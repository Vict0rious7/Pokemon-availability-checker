import { gameName, originName, GAMES } from "./labels.js";

const ORDER = Object.fromEntries(GAMES.map((g, i) => [g.key, i]));
/** "Black / White": games in the usual order. */
export const names = (keys: string[], name: (k: string) => string = originName) =>
  [...keys].sort((a, b) => (ORDER[a] ?? 99) - (ORDER[b] ?? 99)).map(name).join(" / ");

/** One step of a path as shown: a move to a place (with the method, if useful) or an action where the Pokémon is. */
export interface Step { kind: "move" | "act"; place?: string; method?: string; label?: string; }
export interface Described { start: string; steps: Step[]; }

const TRADE = new Set(["RT25", "RT26", "RT27", "RT28", "RT29", "RT30", "RT31"]);

/** Turns the engine's route ids into places. The engine records routes, not the games in between, so
 *  intermediate games are generic ("a Gen 6 game"); the last move is the destination, and the move before a
 *  breed is the game where the egg hatched (the path's origin). */
export function describe(s: { origins: string[]; froms: string[]; source?: string; via: string[] }, dest: string): Described {
  const steps: Step[] = [];
  const here = names(s.origins, gameName);           // the origin game(s): where it was caught, delivered or hatched
  let cur = s.froms[0] ?? s.origins[0];
  const move = (place: string, method?: string) => { steps.push({ kind: "move", place, method }); cur = place; };
  const fromSide = !s.froms.length && !!s.source;    // delivered by a side game or disc into its origin game
  if (fromSide) move(here);
  for (const v of s.via) {
    if (TRADE.has(v)) move("another game", "trade");
    else switch (v) {
      case "RT1": move("a Gen 1–2 game", "trade"); break;
      case "RT2": move("a GameCube or GBA game", "link cable"); break;
      case "RT6": move("a Gen 4 game", "Pal Park"); break;
      case "RT7": move("a Gen 5 game", "Poké Transfer"); break;
      case "RT8": case "RT9": move("Bank", "Poké Transporter"); break;
      case "RT10": cur === "Bank" ? move("a Gen 6 game") : move("Bank"); break;
      case "RT11": move("a Gen 7 game"); break;
      case "RT12": cur === "Bank" ? move("a Gen 7 game") : move("Bank"); break;
      case "RT14": move("Let's Go", "GO Park"); break;
      case "RT13": case "RT15": case "RT19": move("HOME"); break;
      case "RT16": cur === "HOME" ? move("Let's Go") : move("HOME"); break;
      case "RT17": cur === "HOME" ? move("a Switch game") : move("HOME"); break;
      case "RT18": cur === "HOME" ? move("Legends: Z-A") : move("HOME"); break;
      case "EVO": steps.push({ kind: "act", label: "evolve" }); break;
      case "EVO(trade)": steps.push({ kind: "act", label: "trade-evolve" }); break;
      case "BREED": {
        for (let i = steps.length - 1; i >= 0; i--) if (steps[i].kind === "move") { steps[i].place = here; break; }
        steps.push({ kind: "act", label: "breed" });
        break;
      }
      default: move(v);
    }
  }
  const lastBreed = steps.map((x) => x.label).lastIndexOf("breed");
  for (let i = steps.length - 1; i > lastBreed; i--)
    if (steps[i].kind === "move") { steps[i].place = dest === "HOME" ? "HOME" : gameName(dest); break; }
  return { start: fromSide ? originName(s.source!) : names(s.froms.length ? s.froms : s.origins), steps };
}
