// Check of the shopping lists against the checker: on random profiles, every species the lists predict at HOME must be reachable
// by the engine (sound: fails the build), and the species they miss are counted (the beam may drop an option; reported only).
// Usage: tsx src/listcheck.ts <data dir> <lists.json> [profiles]
import { readFileSync } from "node:fs";
import { run, destinationReport } from "./engine.js";
import { prepare } from "./prepare.js";
import { dirReader } from "./node.js";
import { ITEMS, bit, subset, ownedPlain } from "./items.js";
import type { ListsFile } from "./optimise.js";
import { optimise } from "./optimise.js";
import { names } from "./items.js";

const [dataDir, file, count] = process.argv.slice(2);
const P = prepare(dirReader(dataDir));
const F: ListsFile = JSON.parse(readFileSync(file, "utf8"));
const idx = F.items.map((id) => bit(id));
const lists = new Map(Object.entries(F.lists.HOME).map(([n, ls]) => [n, ls.map(([ix, until]) => ({ need: ix.reduce((m, i) => m | idx[i], 0n), until }))]));
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const N = Number(count ?? 12);
let unsound = 0, missed = 0, checks = 0;
for (let k = 0; k < N; k++) {
  const p = k % 2 ? 0.02 + rnd() * 0.15 : 0.15 + rnd() * 0.5;
  let m = 0n;
  for (const it of ITEMS) if (rnd() < p) m |= bit(it.id);
  const R = run(P.forms, ownedPlain(m), P.seeds, P.evo);
  for (const date of ["2026-11-20", "2027-06-01"]) {
    checks++;
    const d = Date.parse(date);
    const got = new Set(destinationReport(P.forms, R.store, "HOME", date).filter((r) => r.reachable).map((r) => r.number));
    const pred = new Set([...lists].filter(([, ls]) => ls.some((l) => (l.until === null || Date.parse(l.until) > d) && subset(l.need, m))).map(([n]) => n));
    const extra = [...pred].filter((n) => !got.has(n)), miss = [...got].filter((n) => !pred.has(n));
    if (extra.length) { unsound++; console.log(`profile ${k} on ${date}: lists predict ${extra.join(", ")} but the engine does not reach them`); }
    if (miss.length) { missed++; console.log(`profile ${k} on ${date}: lists miss ${miss.join(", ")} (beam)`); }
  }
}
console.log(`${checks} checks: ${unsound} unsound, ${missed} with a missed option`);

// Plans: on demo profiles, the engine must reach every species the plan says it brings.
const ids = (xs: string[]) => xs.reduce((m, x) => m | bit(x), 0n);
const nameOf = new Map(P.forms.map((f) => [f.number, f.name]));
const DEMO: Record<string, bigint> = {
  "Switch only": ids(["phone", "sw1", "home", "go", "copy1:Sword", "dlc1:Sword", "copy1:Scarlet", "dlc1:Scarlet", "copy1:BrilliantDiamond", "copy1:LegendsArceus", "copy1:LetsGoEevee", "copy1:LegendsZA"]),
  "Emerald + Platinum": ids(["phone", "copy1:Emerald", "copy1:Platinum", "gba1", "ds1", "slot"]),
  "Nothing yet": ids(["phone"]),
};
let bad = 0;
const DATE = "2026-11-20";
for (const [label, o] of Object.entries(DEMO)) for (const noGo of [false, true]) {
  const R0 = run(P.forms, ownedPlain(o), P.seeds, P.evo);
  const missing = destinationReport(P.forms, R0.store, "HOME", DATE).filter((r) => !r.reachable).map((r) => r.number);
  const t = Date.now();
  const plan = optimise(F, { owned: o, dest: "HOME", date: DATE, missing, exclude: noGo ? { go: bit("go") } : {} });
  const ms = Date.now() - t;
  const final = plan.steps.reduce((m, s) => m | s.add, o);
  const R = run(P.forms, ownedPlain(final), P.seeds, P.evo);
  const reach = new Set(destinationReport(P.forms, R.store, "HOME", DATE).filter((r) => r.reachable).map((r) => r.number));
  const not = plan.planned.filter((n) => !reach.has(n));
  if (not.length) bad++;
  console.log(`\n${label}${noGo ? ", no GO" : ""}: ${missing.length} missing, plan brings ${plan.planned.length} for ${plan.total} in ${plan.steps.length} steps (${ms} ms); never ${plan.never.map((n) => nameOf.get(n)).join(", ") || "-"}; left out ${JSON.stringify(Object.fromEntries(Object.entries(plan.excluded).map(([k, v]) => [k, v.map((n) => nameOf.get(n))])))}${not.length ? `; ENGINE DOES NOT REACH ${not.join(", ")}` : ""}`);
  if (process.env.VERBOSE) for (const s of plan.steps) console.log(`   +${s.gain.length} for ${s.cost}: ${names(s.add).join(" ")}${s.alts.length ? `  (or ${s.alts.map((a) => names(a).join(" ")).join(" | ")})` : ""}${s.beforeEnd.length ? `  [${s.beforeEnd.length} before end]` : ""}`);
}
process.exit(unsound || bad ? 1 : 0);
