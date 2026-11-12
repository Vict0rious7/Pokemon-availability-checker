// "Suggested" consoles and services (Victor, 12 Nov 2026): what the games already picked play on or connect to,
// shown above the full lists. Suggestions only reorder the inputs; nothing is ticked for the user.
import { FAMILY_OF } from "../../engine/src/games.js";
import type { Profile } from "./state.js";

const owns = (p: Profile, keys: string[]) => keys.some((k) => (p.copies[k] ?? 0) > 0);
const fam = (p: Profile, f: string) => Object.keys(p.copies).some((k) => (p.copies[k] ?? 0) > 0 && FAMILY_OF[k] === f);

/** Hardware keys (labels.ts HARDWARE) that the picked games and services use, in the list's order. */
export function suggestedHardware(p: Profile): Set<string> {
  const s = new Set<string>();
  const gba = fam(p, "gba3"), gc = fam(p, "gc");
  if (gba) { s.add("gba"); s.add("linkCable"); }
  if (fam(p, "gen4") || fam(p, "gen5") || p.services.ranger) s.add("ds");
  if (gba && fam(p, "gen4")) { s.add("ds"); s.add("dsGbaSlot"); }   // Pal Park
  if (["vc1", "vc2", "gen6", "gen7"].some((f) => fam(p, f)) || p.services.bank || p.services.transporter || p.services.dreamRadar) s.add("n3ds");
  if (["lgpe", "swsh", "bdsp", "la", "sv", "za", "frlgSwitch"].some((f) => fam(p, f))) s.add("sw");
  if (gc || p.services.bonusDiscUS || p.services.bonusDiscJP || p.services.palChannel) { s.add("gc"); s.add("wiiGC"); }
  if ((gba && gc) || ((p.services.bonusDiscUS || p.services.bonusDiscJP || p.services.palChannel) && gba)) s.add("gcCable");
  if (p.services.ranchWestern || p.services.ranchJapanese || p.services.battleRevWestern || p.services.battleRevJapanese) { s.add("wiiGC"); s.add("wii"); }
  if (p.services.home || p.services.go) s.add("phone");
  return s;
}

/** Services, side games and the GameCube games that connect to the picked games. */
export function suggestedServices(p: Profile): { services: Set<string>; games: Set<string> } {
  const s = new Set<string>(), g = new Set<string>();
  const gba = fam(p, "gba3");
  if (gba) { g.add("Colosseum"); g.add("XD"); }
  if (owns(p, ["Ruby", "Sapphire"])) { s.add("bonusDiscUS"); s.add("palChannel"); }
  if (gba || fam(p, "gc")) s.add("bonusDiscJP");
  if (fam(p, "gen4")) { s.add("ranger"); s.add("battleRevWestern"); s.add("battleRevJapanese"); }
  if (owns(p, ["Diamond", "Pearl", "Platinum"])) { s.add("ranchWestern"); s.add("ranchJapanese"); }
  if (owns(p, ["HeartGold", "SoulSilver"])) s.add("pokewalker");
  if (owns(p, ["Black2", "White2"])) s.add("dreamRadar");
  if (fam(p, "gen5") || fam(p, "vc1") || fam(p, "vc2")) { s.add("transporter"); s.add("bank"); }
  if (fam(p, "gen6") || fam(p, "gen7")) s.add("bank");
  if (p.services.bank || s.has("bank")) { s.add("home"); s.add("homePremium"); }
  if (p.dest === "HOME" || ["lgpe", "swsh", "bdsp", "la", "sv", "za", "frlgSwitch"].some((f) => fam(p, f))) s.add("home");
  if (fam(p, "lgpe") || p.services.home) s.add("go");
  return { services: s, games: g };
}
