// "Complete my collection" (Victor, 12 Nov 2026): what to get next, cheapest first, from the shopping lists (lists.ts).
// Browser-safe: no Node APIs. The checker's own run decides what is already reachable; the lists only plan purchases.
import { FAMILY_OF } from "./games.js";
import { ITEMS, bit, bits, subset } from "./items.js";

/** Built by lists.ts: per destination and species, the minimal item sets (indices into `items`), end date and flags. */
export type ListRow = [number[], string | null, string[]];
export interface ListsFile { items: string[]; beam: number; lists: Record<string, Record<string, ListRow[]>>; }

// ---- cost model: what each item needs to be used (alternatives), and flags that are items (Victor, 12 Nov 2026).
// Costs (items.ts) are weights for choosing between plans, not prices: they are never shown (Victor, 12 Nov 2026).
const PREREQ = new Map<number, bigint[]>();
const idx = (id: string) => bits(bit(id))[0];
const req = (id: string, alts: string[][]) => PREREQ.set(idx(id), alts.map((a) => a.reduce((m, x) => m | bit(x), 0n)));
for (const it of ITEMS) {
  const m = it.id.match(/^(copy|dlc)([12]):(.*)$/);
  if (!m) continue;
  const [, kind, k, g] = m, f = FAMILY_OF[g];
  if (kind === "dlc") req(it.id, [[`copy${k}:${g}`]]);
  else if (k === "2") req(it.id, [[`copy1:${g}`]]);
  else if (f === "gba3") req(it.id, [["gba1"], ["ds1", "slot"]]);          // a DS or DS Lite plays GBA games
  else if (f === "gen4" || f === "gen5") req(it.id, [["ds1"], ["n3ds1"]]);  // a 3DS plays DS games
  else if (f === "gen6" || f === "gen7" || f === "vc1" || f === "vc2") req(it.id, [["n3ds1"]]);
  else if (f === "gc") req(it.id, [["gc"], ["wiiGC"]]);                     // a first-model Wii plays GameCube discs
  else req(it.id, [["sw1"]]);
}
for (const id of ["gba2", "ds2", "n3ds2", "sw2", "slot"]) req(id, [[id === "slot" ? "ds1" : id.replace("2", "1")]]);
req("ranger", [["ds1"], ["n3ds1"]]);
for (const id of ["dreamRadar", "bank", "transporter"]) req(id, [["n3ds1"]]);
for (const id of ["bonusUS", "bonusJP", "palChannel"]) req(id, [["gc"], ["wiiGC"]]);
for (const id of ["ranchW", "ranchJ", "battleRevW", "battleRevJ"]) req(id, [["wii"], ["wiiGC"]]);
req("homePremium", [["home"]]);
const FLAG_ITEM: Record<string, string> = { CABLE_GBA_LINK: "linkCable", CABLE_GC_GBA: "gcCable", HOME_PREMIUM: "homePremium" };

/** Digital-only items whose shop has closed: they need a console with them already installed, or a modded one (Victor, 12 Nov 2026). */
export const PREINSTALLED = new Set(["ranchW", "ranchJ", "bank", "transporter", "dreamRadar",
  ...ITEMS.filter((i) => /^copy[12]:/.test(i.id) && ["vc1", "vc2"].includes(FAMILY_OF[i.id.split(":")[1]])).map((i) => i.id)]);

/** Every minimal way to complete `m` with the prerequisites its items need. */
function closure(m: bigint): bigint[] {
  let cur = [m];
  for (let guard = 0; guard < 12; guard++) {
    const next: bigint[] = []; let grew = false;
    for (const s of cur) {
      const lack = bits(s).find((i) => PREREQ.has(i) && !PREREQ.get(i)!.some((a) => subset(a, s)));
      if (lack === undefined) { next.push(s); continue; }
      grew = true;
      for (const a of PREREQ.get(lack)!) next.push(s | a);
    }
    cur = [...new Set(next)].filter((x, _i, all) => !all.some((y) => y !== x && subset(y, x)));
    if (!grew) break;
  }
  return cur;
}

export interface List { need: bigint; until: string | null; }
/** Lists per species at a destination, with prerequisites and flag items added. Cached per destination. */
const loaded = new WeakMap<ListsFile, Map<string, Map<string, List[]>>>();
export function listsAt(file: ListsFile, dest: string): Map<string, List[]> {
  const per = loaded.get(file) ?? loaded.set(file, new Map()).get(file)!;
  let out = per.get(dest);
  if (out) return out;
  const itemBit = file.items.map((id) => bit(id));
  out = new Map();
  for (const [n, rows] of Object.entries(file.lists[dest] ?? {})) {
    const ls: List[] = [], seen = new Set<string>();
    for (const [ix, until, flags] of rows) {
      let m = ix.reduce((a, i) => a | itemBit[i], 0n);
      for (const f of flags) if (FLAG_ITEM[f]) m |= bit(FLAG_ITEM[f]);
      for (const c of closure(m)) { const k = `${c}|${until}`; if (!seen.has(k)) { seen.add(k); ls.push({ need: c, until }); } }
    }
    out.set(n, ls);
  }
  per.set(dest, out);
  return out;
}

export interface Step {
  /** items to get (bit mask) */ add: bigint;
  /** other item sets that do the same for the same cost or less (e.g. the other version) */ alts: bigint[];
  cost: number; gain: string[];
  /** species of `gain` that this step only brings if they are moved before their route closes (Bank) */ beforeEnd: string[];
}
export interface Plan {
  steps: Step[]; total: number;
  /** in scope and missing, but no one can get them any more (no list at all) */ never: string[];
  /** missing and obtainable, but only with something excluded (Pokémon GO) */ excluded: string[];
  /** missing species the plan brings */ planned: string[];
}
export interface PlanRequest { owned: bigint; dest: string; date: string; missing: string[]; exclude: bigint; }

export function optimise(file: ListsFile, q: PlanRequest): Plan {
  const lists = listsAt(file, q.dest), d = Date.parse(q.date);
  // Owning a DSi (no GBA slot) and needing the slot means buying a DS Lite: then the slot is not free.
  const costs = ITEMS.map((i) => i.cost);
  if ((q.owned & bit("ds1")) && !(q.owned & bit("slot"))) costs[idx("slot")] = ITEMS[idx("ds1")].cost;
  const cost = (m: bigint) => bits(m).reduce((n, i) => n + costs[i], 0);
  const never: string[] = [], excluded: string[] = [], target = new Map<string, List[]>();
  for (const n of q.missing) {
    const all = (lists.get(n) ?? []).filter((l) => l.until === null || Date.parse(l.until) > d);
    if (!all.length) { never.push(n); continue; }
    const ok = all.filter((l) => (l.need & q.exclude) === 0n);
    if (!ok.length) { excluded.push(n); continue; }
    target.set(n, ok);
  }
  const covered = (x: bigint) => [...target].filter(([, ls]) => ls.some((l) => subset(l.need, x))).map(([n]) => n);
  // Greedy ladder: the next purchase is the item set with the most new species per cost (free ones first).
  // Candidates are what each missing species still lacks, so items that only work together (a game and its console) come as one.
  let X = q.owned;
  const picks: bigint[] = [];
  for (;;) {
    const left = [...target].filter(([, ls]) => !ls.some((l) => subset(l.need, X)));
    if (!left.length) break;
    const byRes = new Map<bigint, Set<string>>();
    for (const [n, ls] of left) for (const l of ls) { const r = l.need & ~X; (byRes.get(r) ?? byRes.set(r, new Set()).get(r)!).add(n); }
    let best: { b: bigint; score: number; c: number } | null = null;
    for (const b of byRes.keys()) {
      const gain = new Set<string>(), bb = bits(b);
      if (bb.length <= 12) {
        for (let s = 1; s < 1 << bb.length; s++) {
          let sub = 0n; bb.forEach((i, k) => { if (s & (1 << k)) sub |= 1n << BigInt(i); });
          for (const n of byRes.get(sub) ?? []) gain.add(n);
        }
      } else for (const [r, ns] of byRes) if (subset(r, b)) for (const n of ns) gain.add(n);
      const c = cost(b), score = c === 0 ? 1e9 + gain.size : gain.size / c;
      if (!best || score > best.score || (score === best.score && (c < best.c || (c === best.c && b < best.b)))) best = { b, score, c };
    }
    if (!best) break;
    X |= best.b; picks.push(best.b);
  }
  // Drop what the plan turns out not to need, dearest first.
  const all = covered(X).length;
  for (const i of bits(X & ~q.owned).sort((a, b) => costs[b] - costs[a])) {
    const Y = X & ~(1n << BigInt(i));
    if (covered(Y).length === all) { X = Y; for (let k = 0; k < picks.length; k++) picks[k] &= ~(1n << BigInt(i)); }
  }
  // Steps in order, with what each brings, and the alternatives that bring the same for the same cost.
  const steps: Step[] = [];
  let Z = q.owned, prev = new Set(covered(Z));
  for (const add of picks) {
    if (add === 0n) continue;
    const before = Z;
    Z |= add;
    const now = covered(Z), gain = now.filter((n) => !prev.has(n));
    prev = new Set(now);
    if (!gain.length) continue;
    const alts: bigint[] = [], c = cost(add);
    const cands = new Set<bigint>();
    for (const n of gain) for (const l of target.get(n)!) { const r = l.need & ~before; if (r !== add && cost(r) <= c) cands.add(r); }
    for (const r of [...cands].sort((a, b) => cost(a) - cost(b) || (a < b ? -1 : 1))) {
      if (alts.length >= 3) break;
      const got = new Set(covered(before | r));
      if (gain.every((n) => got.has(n))) alts.push(r);
    }
    steps.push({ add, alts, cost: c, gain, beforeEnd: gain.filter((n) => !target.get(n)!.some((l) => subset(l.need, Z) && l.until === null)) });
  }
  return { steps, total: steps.reduce((n, s) => n + s.cost, 0), never, excluded, planned: [...prev].filter((n) => target.has(n)) };
}
