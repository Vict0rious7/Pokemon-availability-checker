// Build step: the Finder table, computed once with everything owned (the old app's Finder question:
// in which games can each form be obtained natively). Written to src/generated/ (not committed).
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { prepare } from "../../engine/src/prepare.js";
import { dirReader } from "../../engine/src/node.js";
import { run, nativeGames } from "../../engine/src/engine.js";
import { CORE_GAMES, Owned } from "../../engine/src/games.js";

const [dataDir, out] = process.argv.slice(2);
const p = prepare(dirReader(dataDir));
const has = { home: true, go: true, pokewalker: true, dreamRadar: true, transporter: true, bank: true, ranchWestern: true, ranchJapanese: true,
  battleRevWestern: true, battleRevJapanese: true, ranger: true, bonusDiscUS: true, bonusDiscJP: true, palChannel: true };
const ALL: Owned = { copies: Object.fromEntries(CORE_GAMES.map((g) => [g, 2])), dlc: Object.fromEntries(CORE_GAMES.map((g) => [g, 2])),
  gba: 2, ds: 2, dsGbaSlot: 1, n3ds: 2, sw: 2, phone: 1, has };
const t = Date.now();
const { store } = run(p.forms, ALL, p.seeds, p.evo);
const games = nativeGames(p.forms, store);
const rows = p.forms.map((f) => ({ n: +f.number, name: f.name, form: f.form, gen: f.gen, games: games.get(f.id)!.filter((g) => CORE_GAMES.includes(g)) }));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(rows));
console.log(`finder: ${rows.length} forms, ${rows.filter((r) => r.games.length).length} obtainable somewhere, ${Date.now() - t} ms`);
