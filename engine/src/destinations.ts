import { readFileSync } from "node:fs";
import { CORE_GAMES, Owned } from "./games.js";
import { run, reachableAt } from "./engine.js";
import { prepare } from "./prepare.js";
import { dirReader } from "./node.js";

// usage: tsx src/destinations.ts <csv dir> <destinations.json>
// Phase 2 tests (reference/destinations.json). Checks reachable, only_before and the path expectations;
// and HOME rewards offered or not (data/regional_dexes.json).
const [dataDir, casesFile] = process.argv.slice(2);
const { forms, seeds, evo, unhandled } = prepare(dirReader(dataDir));
const { cases } = JSON.parse(readFileSync(casesFile, "utf8"));
const byId = new Map(cases.map((c: any) => [c.id, c]));

const ALL: Owned = {
  copies: Object.fromEntries(CORE_GAMES.map((g) => [g, 2])), dlc: Object.fromEntries(CORE_GAMES.map((g) => [g, 2])),
  gba: 2, ds: 2, dsGbaSlot: 1, n3ds: 2, sw: 2, phone: 1,
  has: { home: true, go: true, pokewalker: true, dreamRadar: true, transporter: true, bank: true, ranchWestern: true, ranchJapanese: true,
         battleRevWestern: true, battleRevJapanese: true, ranger: true, bonusDiscUS: true, bonusDiscJP: true, palChannel: true },
};
function owned(spec: any): Owned {
  if (spec === "ALL") return ALL;
  if (typeof spec === "string") return owned((byId.get(spec) as any).owned);
  const has = Object.fromEntries(Object.keys(ALL.has).map((k) => [k, !!spec.has?.[k]])) as Owned["has"];
  return { copies: spec.copies ?? {}, dlc: spec.dlc ?? {}, gba: spec.gba ?? 0, ds: spec.ds ?? 0, dsGbaSlot: spec.dsGbaSlot ?? 0,
           n3ds: spec.n3ds ?? 0, sw: spec.sw ?? 0, phone: spec.phone === true ? 1 : spec.phone || 0, has };
}

let fail = 0;
for (const c of cases) {
  const form = forms.find((f) => f.name === c.probe && f.form === "");
  if (!form) { console.log(`${c.id}: FAIL unknown probe ${c.probe}`); fail++; continue; }
  const { store } = run(forms, owned(c.owned), seeds, evo);
  const got = reachableAt(store, form.number, c.destination, c.date);
  const e = c.expect, problems: string[] = [];
  if (got.reachable !== e.reachable) problems.push(`reachable ${got.reachable}, expected ${e.reachable}`);
  if (e.reachable && "only_before" in e && (e.only_before === null ? got.onlyBefore !== null : got.onlyBefore === null || Date.parse(got.onlyBefore) !== Date.parse(e.only_before)))
    problems.push(`only_before ${got.onlyBefore}, expected ${e.only_before}`);
  for (const id of e.every_path_uses ?? [])
    if (got.paths.some((p) => !p.via.includes(id))) problems.push(`a path avoids ${id}`);
  if (e.best_path_from && got.paths[0]?.origin !== e.best_path_from) problems.push(`best path from ${got.paths[0]?.origin}, expected ${e.best_path_from}`);
  for (const r of e.rejected_paths ?? [])
    if (!got.refused.some((x) => x.origins.includes(r.from))) problems.push(`no refusal recorded for the path from ${r.from}`);
  for (const id of e.no_path_uses ?? [])
    if (got.paths.some((p) => p.via.includes(id))) problems.push(`a path uses ${id}`);
  for (const fl of e.best_path_flags_include ?? [])
    if (!got.paths[0]?.flags.includes(fl)) problems.push(`best path lacks flag ${fl}`);
  for (const seq of e.paths_include ?? [])
    if (!got.paths.some((p) => p.via.join(">") === seq.join(">"))) problems.push(`no path ${seq.join(" > ")}`);
  for (const id of e.rewards_not_offered ?? []) {
    if ([...store.facts.values()].some((f) => f.loc === "HOME" && f.supports.some((x) => x.origin === id))) problems.push(`reward ${id} offered`);
  }
  for (const id of e.rewards_offered ?? [])
    if (![...store.facts.values()].some((f) => f.loc === "HOME" && f.supports.some((x) => x.origin === id))) problems.push(`reward ${id} not offered`);
  const pending: string[] = [];
  if (problems.length) fail++;
  console.log(`${c.id} ${c.probe} -> ${c.destination} on ${c.date}: ${problems.length ? "FAIL " + problems.join("; ") : "pass"}` +
    `${got.reachable ? (got.onlyBefore ? ` (until ${got.onlyBefore})` : " (no end date)") : ""}${pending.length ? `  [pending: ${pending.join(", ")}]` : ""}`);
  if (process.env.VERBOSE) {
    for (const p of got.paths) console.log(`    ${[p.from ? `${p.from} … bred in ${p.origin}` : p.origin, ...p.via].join(" > ")}${p.flags.length ? `  flags ${p.flags.join(",")}` : ""}${p.until ? `  until ${p.until}` : ""}`);
    for (const r of got.refused) console.log(`    refused: ${r.origins.join("/")} … ${r.from} > ${r.to} (${r.route}): ${r.reason}`);
  }
}
console.log(`\n${cases.length - fail}/${cases.length} pass`);
if (unhandled.size) console.log(`unhandled codes on this data: ${[...unhandled.keys()].length} (game|code)`);
process.exit(fail ? 1 : 0);
