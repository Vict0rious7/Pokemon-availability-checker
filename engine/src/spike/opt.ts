// Spike: "Complete my collection" optimiser over the precomputed shopping lists (spike-out/lists.json).
import { readFileSync } from "node:fs";
import { FAMILY_OF } from "../games.js";
import * as real from "../engine.js";
import { prepare } from "../prepare.js";
import { dirReader } from "../node.js";
import { ITEMS, bit, bits, subset, costOf, names, ownedPlain } from "./items.js";

const P = prepare(dirReader("../data"));
const J = JSON.parse(readFileSync("spike-out/lists.json", "utf8"));
const mask = (ix: number[]) => ix.reduce((m, i) => m | (1n << BigInt(i)), 0n);

// ---- cost model: prerequisites (alternatives) and flags that are items (Victor, 12 Nov)
const PREREQ = new Map<number, bigint[]>();
const req = (id: string, alts: string[][]) => PREREQ.set(bits(bit(id))[0], alts.map((a) => a.reduce((m, x) => m | bit(x), 0n)));
for (const it of ITEMS) {
  const m = it.id.match(/^(copy|dlc)([12]):(.*)$/);
  if (!m) continue;
  const [, kind, k, g] = m, f = FAMILY_OF[g];
  if (kind === "dlc") { req(it.id, [[`copy${k}:${g}`]]); continue; }
  if (k === "2") { req(it.id, [[`copy1:${g}`]]); continue; }
  if (f === "gba3") req(it.id, [["gba1"], ["ds1"]]);
  else if (f === "gen4" || f === "gen5") req(it.id, [["ds1"], ["n3ds1"]]);
  else if (f === "gen6" || f === "gen7" || f === "vc1" || f === "vc2") req(it.id, [["n3ds1"]]);
  else if (f === "gc") req(it.id, [["gc"]]);
  else req(it.id, [["sw1"]]);
}
for (const id of ["gba2", "ds2", "n3ds2", "sw2"]) req(id, [[id.replace("2", "1")]]);
req("ranger", [["ds1"], ["n3ds1"]]);
for (const id of ["dreamRadar", "bank"]) req(id, [["n3ds1"]]);
for (const id of ["bonusUS", "bonusJP", "palChannel"]) req(id, [["gc"]]);
for (const id of ["ranchW", "ranchJ", "battleRevW", "battleRevJ"]) req(id, [["wii"]]);
const FLAG_ITEM: Record<string, string> = { CABLE_GBA_LINK: "linkCable", CABLE_GC_GBA: "gcCable", HOME_PREMIUM: "homePremium" };
/** Items that need a console with it already installed (Victor, 12 Nov): digital-only, shops closed. */
const PREINSTALLED = new Set(["ranchW", "ranchJ", "bank", "dreamRadar", ...ITEMS.filter((i) => /^copy[12]:/.test(i.id) && ["vc1", "vc2"].includes(FAMILY_OF[i.id.split(":")[1]])).map((i) => i.id)]);

function closure(m: bigint): bigint[] {
  let cur = [m];
  for (let guard = 0; guard < 10; guard++) {
    const next: bigint[] = []; let grew = false;
    for (const s of cur) {
      const lack = bits(s).find((i) => PREREQ.has(i) && !PREREQ.get(i)!.some((a) => subset(a, s)));
      if (lack === undefined) { next.push(s); continue; }
      grew = true;
      for (const a of PREREQ.get(lack)!) next.push(s | a);
    }
    cur = next.filter((x, i) => !next.some((y, j) => j !== i && subset(y, x) && (y !== x || j < i)));
    if (!grew) break;
  }
  return cur;
}

type List = { need: bigint; until: string | null; flags: string[] };
function listsAt(dest: string): Map<string, List[]> {
  const out = new Map<string, List[]>();
  for (const [n, ls] of Object.entries(J.lists[dest] ?? {}) as [string, [number[], string | null, string[]][]][]) {
    const l: List[] = [];
    for (const [ix, until, flags] of ls) {
      let m = mask(ix);
      for (const f of flags) if (FLAG_ITEM[f]) m |= bit(FLAG_ITEM[f]);
      for (const c of closure(m)) l.push({ need: c, until, flags });
    }
    out.set(n, l);
  }
  return out;
}

export interface Plan { owned: bigint; steps: { add: bigint; cost: number; gain: string[]; beforeBank: string[] }[]; never: string[]; outOfReach: string[]; missing: string[]; }

export function optimise(owned: bigint, dest: string, date: string, gens: number[], exclude: bigint): Plan {
  const lists = listsAt(dest), d = Date.parse(date);
  const R = real.run(P.forms, ownedPlain(owned), P.seeds, P.evo);
  const species = new Map<string, number>(); for (const f of P.forms) if (!species.has(f.number)) species.set(f.number, f.gen);
  const reach = new Set(real.destinationReport(P.forms, R.store, dest, date).filter((r) => r.reachable).map((r) => r.number));
  const never: string[] = [], outOfReach: string[] = [], target = new Map<string, List[]>();
  for (const [n, g] of species) {
    if (!gens.includes(g) || reach.has(n)) continue;
    const all = (lists.get(n) ?? []).filter((l) => l.until === null || Date.parse(l.until) > d);
    if (!all.length) { never.push(n); continue; }
    const ok = all.filter((l) => (l.need & exclude) === 0n);
    if (!ok.length) { outOfReach.push(n); continue; }
    target.set(n, ok);
  }
  const missing = [...target.keys()];
  let X = owned;
  const steps: Plan["steps"] = [];
  const covered = (x: bigint) => [...target].filter(([, ls]) => ls.some((l) => subset(l.need, x))).map(([n]) => n);
  while (true) {
    const left = [...target].filter(([, ls]) => !ls.some((l) => subset(l.need, X)));
    if (!left.length) break;
    const byRes = new Map<bigint, Set<string>>();
    for (const [n, ls] of left) for (const l of ls) { const r = l.need & ~X; (byRes.get(r) ?? byRes.set(r, new Set()).get(r)!).add(n); }
    let best: { b: bigint; gain: Set<string>; score: number } | null = null;
    for (const b of byRes.keys()) {
      const gain = new Set<string>();
      const bb = bits(b);
      if (bb.length <= 12) {
        for (let s = 0; s < 1 << bb.length; s++) {
          let sub = 0n; bb.forEach((i, k) => { if (s & (1 << k)) sub |= 1n << BigInt(i); });
          for (const n of byRes.get(sub) ?? []) gain.add(n);
        }
      } else for (const [r, ns] of byRes) if (subset(r, b)) for (const n of ns) gain.add(n);
      const c = costOf(b), score = c === 0 ? 1e9 + gain.size : gain.size / c;
      if (!best || score > best.score) best = { b, gain, score };
    }
    if (!best) break;
    const before = new Set(covered(X));
    X |= best.b;
    const gainNow = covered(X).filter((n) => !before.has(n));
    const beforeBank = gainNow.filter((n) => !target.get(n)!.some((l) => subset(l.need, X) && l.until === null));
    steps.push({ add: best.b, cost: costOf(best.b), gain: gainNow, beforeBank });
  }
  // reverse delete: drop bought items the plan does not need
  const need = covered(X).length;
  for (const i of bits(X & ~owned).sort((a, b) => ITEMS[b].cost - ITEMS[a].cost)) {
    const Y = X & ~(1n << BigInt(i));
    if (covered(Y).length === need) { X = Y; for (const s of steps) s.add &= ~(1n << BigInt(i)); }
  }
  // re-attribute gains in order with the pruned items; fold steps left empty
  const kept: Plan["steps"] = [];
  let Z = owned, prev = new Set(covered(owned));
  for (const s of steps) {
    if (s.add === 0n) continue;
    Z |= s.add;
    const now = covered(Z), gain = now.filter((n) => !prev.has(n));
    prev = new Set(now);
    kept.push({ add: s.add, cost: costOf(s.add), gain, beforeBank: gain.filter((n) => !target.get(n)!.some((l) => subset(l.need, Z) && l.until === null)) });
  }
  return { owned, steps: kept.filter((s) => s.gain.length), never, outOfReach, missing };
}

// ---- demo
const ids = (xs: string[]) => xs.reduce((m, x) => m | bit(x), 0n);
const nameOf = new Map(P.forms.map((f) => [f.number, f.name]));
const PROFILES: Record<string, bigint> = {
  "Switch only": ids(["sw1", "home", "go", "copy1:Sword", "dlc1:Sword", "copy1:Scarlet", "dlc1:Scarlet", "copy1:BrilliantDiamond", "copy1:LegendsArceus", "copy1:LetsGoEevee", "copy1:LegendsZA"]),
  "Switch + 3DS (Gen 7)": ids(["sw1", "home", "go", "n3ds1", "bank", "copy1:UltraSun", "copy1:Y", "copy1:Sword", "dlc1:Sword", "copy1:Violet", "dlc1:Violet", "copy1:ShiningPearl", "copy1:LegendsArceus"]),
  "Nothing yet": 0n,
};
const DATE = process.env.DATE ?? "2026-11-20";
for (const [label, o] of Object.entries(PROFILES)) for (const noGo of [false, true]) {
  const t = Date.now();
  const p = optimise(o, "HOME", DATE, [1, 2, 3, 4, 5, 6, 7, 8, 9], noGo ? bit("go") : 0n);
  const ms = Date.now() - t;
  const total = p.steps.reduce((n, s) => n + s.cost, 0);
  console.log(`\n== ${label}${noGo ? ", no GO" : ""} (HOME, Gens 1-9, ${DATE}): ${p.missing.length} missing and obtainable; ${p.never.length} never obtainable; ${p.outOfReach.length} out of reach with settings; ${ms} ms`);
  console.log(`   never: ${p.never.map((n) => nameOf.get(n)).join(", ")}`);
  if (p.outOfReach.length) console.log(`   out of reach: ${p.outOfReach.map((n) => nameOf.get(n)).join(", ")}`);
  let cum = 0, got = 0;
  for (const s of p.steps) {
    cum += s.cost; got += s.gain.length;
    const pre = names(s.add).filter((x) => PREINSTALLED.has(x));
    console.log(`   +${String(s.gain.length).padStart(3)} (total ${got}) for ${String(s.cost).padStart(3)} (cum ${cum}): ${names(s.add).join(", ") || "(nothing new)"}` +
      `${s.beforeBank.length ? `  [${s.beforeBank.length} only before 25 Feb]` : ""}${pre.length ? `  [already installed: ${pre.join(", ")}]` : ""}` +
      `${s.gain.length <= 6 ? `  — ${s.gain.map((n) => nameOf.get(n)).join(", ")}` : ""}`);
  }
  // verify with the real engine
  const final = p.steps.reduce((m, s) => m | s.add, o);
  const R = real.run(P.forms, ownedPlain(final), P.seeds, P.evo);
  const reach = new Set(real.destinationReport(P.forms, R.store, "HOME", DATE).filter((r) => r.reachable).map((r) => r.number));
  const notReached = p.missing.filter((n) => !reach.has(n));
  console.log(`   check with the real engine: ${p.missing.length - notReached.length}/${p.missing.length} of the plan reached${notReached.length ? `; NOT: ${notReached.map((n) => nameOf.get(n)).join(", ")}` : ""}; total cost ${total}`);
}
