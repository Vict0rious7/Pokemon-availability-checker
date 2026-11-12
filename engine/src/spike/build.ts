// Spike: run the shopping-list engine once (everything owned) and write minimal lists per location and species.
import { writeFileSync, mkdirSync } from "node:fs";
import * as sym from "./sym.js";
import { prepare } from "../prepare.js";
import { dirReader } from "../node.js";
import { ITEMS, FULL, ownedPlain, subset, costOf, bits } from "./items.js";
const P = prepare(dirReader("../data"));
sym.setBeam(Number(process.env.BEAM ?? 8));
const t = Date.now();
const S = sym.run(P.forms, ownedPlain(FULL), P.seeds as any, P.evo);
const later = (a?: string, b?: string) => (a === undefined ? true : b === undefined ? false : a >= b);
type L = { need: bigint; until?: string; flags: string[] };
const minimize = (l: L[]) => {
  const out: L[] = [];
  for (const x of [...l].sort((a, b) => costOf(a.need) - costOf(b.need) || a.flags.length - b.flags.length)) {
    if (out.some((y) => subset(y.need, x.need) && later(y.until, x.until))) continue;
    out.push(x);
  }
  return out;
};
const out: Record<string, Record<string, [number[], string | null, string[]][]>> = {};
for (const loc of new Set([...S.store.facts.values()].map((f) => f.loc))) {
  const per = new Map<string, L[]>();
  for (const f of S.store.at(loc)) { const l = per.get(f.form.number) ?? per.set(f.form.number, []).get(f.form.number)!; for (const x of f.supports) l.push(x); }
  out[loc] = {};
  for (const [n, l] of per) out[loc][n] = minimize(l).map((x) => [bits(x.need), x.until ?? null, x.flags]);
}
mkdirSync("spike-out", { recursive: true });
writeFileSync("spike-out/lists.json", JSON.stringify({ items: ITEMS, beam: sym.BEAM, lists: out }));
writeFileSync("spike-out/HOME.json", JSON.stringify({ items: ITEMS, lists: { HOME: out.HOME } }));
console.log(`built in ${Date.now() - t} ms`);
