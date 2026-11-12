import { CORE_GAMES, Owned } from "../games.js";
import * as real from "../engine.js";
import * as sym from "./sym.js";
import { prepare } from "../prepare.js";
import { dirReader } from "../node.js";
import { ITEMS, bit, subset, ownedPlain, names, costOf, FULL } from "./items.js";

const P = prepare(dirReader("../data"));
const beam = Number(process.env.BEAM ?? 8); sym.setBeam(beam);
const ALL = ownedPlain(FULL);
const stats = { seedDnfMs: 0, routeDnfMs: 0 };
let t = Date.now();
const S = sym.run(P.forms, ALL, P.seeds as any, P.evo, stats);
const symMs = Date.now() - t;
let sup = 0, max = 0; for (const f of S.store.facts.values()) { sup += f.supports.length; max = Math.max(max, f.supports.length); }
console.log(`beam ${beam}: sym run ${symMs} ms (seed dnf ${stats.seedDnfMs}, route dnf ${stats.routeDnfMs}); facts ${S.store.facts.size} supports ${sup} max/fact ${max} passes ${S.passes}; heap ${Math.round(process.memoryUsage().heapUsed / 1e6)} MB`);

// shopping lists per species at HOME (raw, before cost-model closure)
const DEST = process.env.DEST ?? "HOME";
const lists = new Map<string, { need: bigint; until?: string; flags: string[] }[]>();
for (const f of S.store.at(DEST)) {
  const l = lists.get(f.form.number) ?? lists.set(f.form.number, []).get(f.form.number)!;
  for (const s of f.supports) l.push({ need: s.need, until: s.until, flags: s.flags });
}
const later = (a?: string, b?: string) => (a === undefined ? true : b === undefined ? false : a >= b);
const minimize = (l: { need: bigint; until?: string; flags: string[] }[]) => {
  const out: typeof l = [];
  for (const x of [...l].sort((a, b) => costOf(a.need) - costOf(b.need))) {
    if (out.some((y) => subset(y.need, x.need) && later(y.until, x.until))) continue;
    for (let i = out.length - 1; i >= 0; i--) if (subset(x.need, out[i].need) && later(x.until, out[i].until)) out.splice(i, 1);
    out.push(x);
  }
  return out;
};
for (const [n, l] of lists) lists.set(n, minimize(l));
// all destinations: size estimate
let allLists = 0, allItems = 0;
for (const loc of new Set([...S.store.facts.values()].map((f) => f.loc))) {
  const per = new Map<string, any[]>();
  for (const f of S.store.at(loc)) { const l = per.get(f.form.number) ?? per.set(f.form.number, []).get(f.form.number)!; for (const x of f.supports) l.push({ need: x.need, until: x.until, flags: x.flags }); }
  for (const l of per.values()) { const m = minimize(l); allLists += m.length; allItems += m.reduce((a, x) => a + names(x.need).length, 0); }
}
console.log(`all locations: ${allLists} minimal lists, ${allItems} item refs`);
let total = 0, mx = 0; for (const l of lists.values()) { const u = new Set(l.map((x) => `${x.need}|${x.until}`)).size; total += u; mx = Math.max(mx, u); }
console.log(`${DEST}: ${lists.size} species with a list; ${total} lists (max ${mx} per species)`);

const predict = (m: bigint, date: string) => {
  const d = Date.parse(date), out = new Set<string>();
  for (const [n, l] of lists) if (l.some((x) => (x.until === undefined || Date.parse(x.until) > d) && subset(x.need, m))) out.add(n);
  return out;
};
// random profiles: consoles first, then games for them
let seed = Number(process.env.SEED ?? 1);
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const N = Number(process.env.N ?? 20);
let bad = 0, runMs = 0;
for (let k = 0; k < N; k++) {
  const ONLY = process.env.ONLY;
  let m = 0n;
  const p = k % 2 ? 0.02 + rnd() * 0.15 : 0.15 + rnd() * 0.5;
  for (const it of ITEMS) if (rnd() < p) m |= bit(it.id);
  if (ONLY && String(k) !== ONLY) continue;
  for (const date of ["2026-11-20", "2027-06-01"]) {
    const t1 = Date.now();
    const R = real.run(P.forms, ownedPlain(m), P.seeds, P.evo);
    runMs += Date.now() - t1;
    const got = new Set(real.destinationReport(P.forms, R.store, DEST, date).filter((r) => r.reachable).map((r) => r.number));
    const pred = predict(m, date);
    const miss = [...got].filter((n) => !pred.has(n)), extra = [...pred].filter((n) => !got.has(n));
    if (process.env.DEBUG && miss.length) for (const n of miss.slice(0, 2)) {
      console.log("  owned:", names(m).join(" "));
      for (const x of real.reachableAt(R.store, n, DEST, date).paths.slice(0, 4)) console.log("  real path", x.origin, x.from ?? "", x.via.join(">"), x.flags.join(","));
      for (const x of (lists.get(n) ?? []).slice(0, 12)) console.log("  list", names(x.need).join(" "), x.until ?? "");
    }
    if (miss.length || extra.length) { bad++; console.log(`profile ${k} ${date}: engine ${got.size}, predicted ${pred.size}; missed ${miss.slice(0, 10).join(",")}${miss.length > 10 ? "…" : ""} extra ${extra.slice(0, 10).join(",")}`); }
  }
}
console.log(`${N * 2} checks, ${bad} mismatches; real engine avg ${Math.round(runMs / N / 2)} ms`);
