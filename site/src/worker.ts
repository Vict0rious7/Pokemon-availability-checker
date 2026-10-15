/// <reference lib="webworker" />
// Runs the engine off the main thread. The fixed point (run) depends only on what the user owns and is cached;
// destination and scope changes only re-query it.
import { prepare } from "../../engine/src/prepare.js";
import { run, reachableAt, Store } from "../../engine/src/engine.js";
import { canHold } from "../../engine/src/data.js";
import type { Owned } from "../../engine/src/games.js";

const files = import.meta.glob("../../data/*.{csv,json}", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const byName = Object.fromEntries(Object.entries(files).map(([k, v]) => [k.split("/").pop()!, v]));
const p = prepare((f) => byName[f]);
const formsOf = new Map<string, typeof p.forms>();
for (const f of p.forms) (formsOf.get(f.number) ?? formsOf.set(f.number, []).get(f.number)!).push(f);

export type Status = "ok" | "until" | "no" | "cant";
export interface PathOut { origin: string; from?: string; via: string[]; flags: string[]; until?: string; }
export interface Row { n: number; name: string; gen: number; status: Status; until?: string; paths: PathOut[]; more: number; refused: string[]; }
export interface Request { id: number; owned: Owned; dest: string; maxGen: number; date: string; }
export interface Response { id: number; rows: Row[]; ms: number; cached: boolean; }

let cacheKey = "", cache: Store | null = null;

self.onmessage = (e: MessageEvent<Request>) => {
  const { id, owned, dest, maxGen, date } = e.data;
  const t = performance.now();
  const key = JSON.stringify(owned), cached = key === cacheKey && cache !== null;
  if (!cached) { cache = run(p.forms, owned, p.seeds, p.evo).store; cacheKey = key; }
  const store = cache!;
  const rows: Row[] = [], seen = new Set<string>();
  for (const f of p.forms) {
    if (f.gen > maxGen || seen.has(f.number)) continue;
    seen.add(f.number);
    const all = formsOf.get(f.number)!;
    const base: Omit<Row, "status" | "paths" | "more" | "refused"> = { n: +f.number, name: f.name, gen: f.gen };
    if (dest !== "HOME" && !all.some((x) => canHold(x, dest))) { rows.push({ ...base, status: "cant", paths: [], more: 0, refused: [] }); continue; }
    const a = reachableAt(store, f.number, dest, date);
    // one path per origin (the best one), best first
    const byOrigin = new Map<string, PathOut>();
    for (const s of a.paths) if (!byOrigin.has(s.origin)) byOrigin.set(s.origin, { origin: s.origin, from: s.from, via: s.via, flags: s.flags, until: s.until });
    const paths = [...byOrigin.values()];
    rows.push({ ...base, status: !a.reachable ? "no" : a.onlyBefore ? "until" : "ok", until: a.onlyBefore ?? undefined,
      paths: paths.slice(0, 6), more: Math.max(0, paths.length - 6), refused: [...new Set(a.refused.map((r) => r.reason))].slice(0, 3) });
  }
  (self as unknown as Worker).postMessage({ id, rows, ms: Math.round(performance.now() - t), cached } satisfies Response);
};
