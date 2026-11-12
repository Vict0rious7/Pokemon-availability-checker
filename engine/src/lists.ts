// Build step ("Complete my collection"): run the engine once in shopping-list mode and write, per destination and species,
// the minimal item sets that bring it there, with end date and flags. Usage: tsx src/lists.ts <data dir> <out.json> [beam]
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { run, Support } from "./engine.js";
import { prepare } from "./prepare.js";
import { dirReader } from "./node.js";
import type { Reader } from "./data.js";
import { CORE_GAMES } from "./games.js";
import { ITEMS, ownedPlain, FULL, subset, costOf, bits } from "./items.js";

import type { ListsFile } from "./optimise.js";
export type { ListsFile };

const later = (a?: string, b?: string) => (a === undefined ? true : b === undefined ? false : a >= b);
/** Keeps the lists no other list beats (fewer items and an end date as late); flags are kept for display only. */
export function minimal(xs: Support[]): Support[] {
  const out: Support[] = [];
  for (const x of [...xs].sort((a, b) => costOf(a.need) - costOf(b.need) || a.flags.length - b.flags.length))
    if (!out.some((y) => subset(y.need, x.need) && later(y.until, x.until))) out.push(x);
  return out;
}

export function buildLists(read: Reader, beam = 8): ListsFile {
  const p = prepare(read);
  const { store } = run(p.forms, ownedPlain(FULL), p.seeds, p.evo, { lists: true, beam });
  const lists: ListsFile["lists"] = {};
  for (const loc of ["HOME", ...CORE_GAMES]) {
    const per = new Map<string, Support[]>();
    for (const f of store.at(loc)) (per.get(f.form.number) ?? per.set(f.form.number, []).get(f.form.number)!).push(...f.supports);
    lists[loc] = {};
    for (const [n, xs] of per) lists[loc][n] = minimal(xs).map((x) => [bits(x.need), x.until ?? null, x.flags]);
  }
  return { items: ITEMS.map((i) => i.id), beam, lists };
}

if (process.argv[1]?.match(/lists\.(ts|js)$/)) {
  const [dataDir, out, beam] = process.argv.slice(2);
  const t = Date.now();
  const f = buildLists(dirReader(dataDir), beam ? Number(beam) : 8);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(f));
  const n = Object.values(f.lists.HOME).reduce((a, l) => a + l.length, 0);
  console.log(`lists: ${Object.keys(f.lists.HOME).length} species reach HOME with ${n} minimal lists; beam ${f.beam}; ${Math.round((Date.now() - t) / 1000)} s`);
}
