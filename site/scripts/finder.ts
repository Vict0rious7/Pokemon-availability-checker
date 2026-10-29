// Build step: the Finder table, computed once with everything owned (the old app's Finder question:
// in which games can each form be obtained natively). Written to src/generated/ (not committed).
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { prepare } from "../../engine/src/prepare.js";
import { dirReader } from "../../engine/src/node.js";
import { run } from "../../engine/src/engine.js";
import { CORE_GAMES, Owned } from "../../engine/src/games.js";

const [dataDir, out] = process.argv.slice(2);
const p = prepare(dirReader(dataDir));
const has = { home: true, go: true, pokewalker: true, dreamRadar: true, transporter: true, bank: true, ranchWestern: true, ranchJapanese: true,
  battleRevWestern: true, battleRevJapanese: true, ranger: true, bonusDiscUS: true, bonusDiscJP: true, palChannel: true };
const ALL: Owned = { copies: Object.fromEntries(CORE_GAMES.map((g) => [g, 2])), dlc: Object.fromEntries(CORE_GAMES.map((g) => [g, 2])),
  gba: 2, ds: 2, dsGbaSlot: 1, n3ds: 2, sw: 2, phone: 1, has };
const t = Date.now();
const { store } = run(p.forms, ALL, p.seeds, p.evo);
// Native sources only (no trade or transfer): every seed that holds with everything owned. Read from the seeds, not the
// kept paths, so a source that another one dominates in the same game (US bonus disc vs PAL Channel Jirachi) still shows.
// A side game or disc (Ranch, bonus disc…) is listed as itself, with the games it delivers into.
const games = new Map<string, Set<string>>(), sources = new Map<string, Map<string, Set<string>>>();
for (const s of p.seeds) {
  if (!CORE_GAMES.includes(s.at) || !s.req(ALL, store)) continue;
  if (s.deps?.some((d) => !store.supportsOf(d.number, d.loc, d.tags, d.origins, d.notOrigin, d.anyForm).length)) continue;
  const id = s.form.id;
  if (s.source) {
    const m = sources.get(id) ?? sources.set(id, new Map()).get(id)!;
    (m.get(s.source) ?? m.set(s.source, new Set()).get(s.source)!).add(s.at);
  } else (games.get(id) ?? games.set(id, new Set()).get(id)!).add(s.at);
}
const rows = p.forms.map((f) => ({ n: +f.number, name: f.name, form: f.form, gen: f.gen, games: [...(games.get(f.id) ?? [])],
  sources: [...(sources.get(f.id) ?? new Map()).entries()].map(([id, into]) => ({ id, into: [...into] })) }));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(rows));
console.log(`finder: ${rows.length} forms, ${rows.filter((r) => r.games.length || r.sources.length).length} obtainable somewhere, ${Date.now() - t} ms`);
