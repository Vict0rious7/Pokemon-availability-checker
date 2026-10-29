/// <reference lib="webworker" />
// Runs the engine off the main thread. The fixed point (run) depends only on what the user owns and is cached;
// destination and scope changes only re-query it.
import { prepare } from "../../engine/src/prepare.js";
import { run, reachableAt, Store } from "../../engine/src/engine.js";
import { canHold } from "../../engine/src/data.js";
import { FAMILY_OF, type Owned } from "../../engine/src/games.js";

const files = import.meta.glob("../../data/*.{csv,json}", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const byName = Object.fromEntries(Object.entries(files).map(([k, v]) => [k.split("/").pop()!, v]));
const p = prepare((f) => byName[f]);
const formsOf = new Map<string, typeof p.forms>();
for (const f of p.forms) (formsOf.get(f.number) ?? formsOf.set(f.number, []).get(f.number)!).push(f);

export type Status = "ok" | "until" | "no" | "cant";
/** A group of equivalent paths: same route, flags and end date, from games of the same family (Black / White → …). */
export interface PathOut { origins: string[]; froms: string[]; source?: string; via: string[]; flags: string[]; until?: string; }
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
    // the best path per starting point, best first; then paths that differ only by a game of the same family are merged
    const best = new Map<string, (typeof a.paths)[number]>();
    for (const s of a.paths) { const k = `${s.source ?? ""}@${s.origin}@${s.from ?? ""}`; if (!best.has(k)) best.set(k, s); }
    const fam = (g: string) => FAMILY_OF[g] ?? g;
    const byOrigin = new Map<string, PathOut>();
    for (const s of best.values()) {
      const k = [s.source ?? "", fam(s.origin), s.from ? fam(s.from) : "", s.via.join(">"), s.flags.join(","), s.until ?? ""].join("|");
      const g = byOrigin.get(k);
      if (!g) byOrigin.set(k, { origins: [s.origin], froms: s.from ? [s.from] : [], source: s.source, via: s.via, flags: s.flags, until: s.until });
      else {
        if (!g.origins.includes(s.origin)) g.origins.push(s.origin);
        if (s.from && !g.froms.includes(s.from)) g.froms.push(s.from);
      }
    }
    const paths = [...byOrigin.values()];
    // A bred path names one parent game: the engine keeps one representative parent per (flags, end date). When that game
    // shares a row with games of its family (same route out, no extra flags), name them all as the parent's games.
    for (const p of paths) {
      if (p.froms.length !== 1) continue;
      const peer = paths.find((q) => !q.froms.length && !q.source && q.origins.includes(p.froms[0]) && q.flags.every((f) => p.flags.includes(f)));
      if (peer) p.froms = [...peer.origins];
    }
    rows.push({ ...base, status: !a.reachable ? "no" : a.onlyBefore ? "until" : "ok", until: a.onlyBefore ?? undefined,
      paths, more: 0, refused: [...new Set(a.refused.map((r) => r.reason))].slice(0, 3) });
  }
  (self as unknown as Worker).postMessage({ id, rows, ms: Math.round(performance.now() - t), cached } satisfies Response);
};
