// Timing of the checker run (worker) on two profiles: usage `tsx src/timing.ts ../data`
import { CORE_GAMES, Owned } from "./games.js";
import { run } from "./engine.js";
import { prepare } from "./prepare.js";
import { dirReader } from "./node.js";
const P = prepare(dirReader(process.argv[2] ?? "../data"));
const has = { home: true, go: true, pokewalker: true, dreamRadar: true, transporter: true, bank: true, ranchWestern: true, ranchJapanese: true,
  battleRevWestern: true, battleRevJapanese: true, ranger: true, bonusDiscUS: true, bonusDiscJP: true, palChannel: true };
const none = Object.fromEntries(Object.keys(has).map((k) => [k, false])) as Owned["has"];
const ALL: Owned = { copies: Object.fromEntries(CORE_GAMES.map((g) => [g, 2])), dlc: Object.fromEntries(CORE_GAMES.map((g) => [g, 2])), gba: 2, ds: 2, dsGbaSlot: 1, n3ds: 2, sw: 2, phone: 1, has };
const TYP: Owned = { copies: { Sword: 1, Scarlet: 1, LegendsArceus: 1, BrilliantDiamond: 1, UltraSun: 1, X: 1 }, dlc: { Sword: 1, Scarlet: 1 },
  gba: 0, ds: 0, dsGbaSlot: 0, n3ds: 1, sw: 1, phone: 1, has: { ...none, home: true, go: true, bank: true, transporter: true } };
for (const [n, o] of [["typical", TYP], ["everything x2", ALL], ["typical", TYP], ["everything x2", ALL]] as const) {
  const t = Date.now(); const r = run(P.forms, o, P.seeds, P.evo);
  console.log(n, Date.now() - t, "ms, facts", r.store.facts.size);
}
