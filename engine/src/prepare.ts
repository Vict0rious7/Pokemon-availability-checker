import { Form, Reader, loadForms } from "./data.js";
import { buildSeeds, Seed, EvoData, Unhandled } from "./engine.js";
import { loadDexes, rewardSeeds, emeraldHoenn, loadOncePerSave, homeGiftSeeds } from "./rewards.js";

/** Everything the Phase 2 engine needs, from the data folder (Node) or the bundled files (browser). */
export interface Prepared { forms: Form[]; seeds: Seed[]; evo?: EvoData; unhandled: Map<string, Unhandled>; }

export function prepare(read: Reader): Prepared {
  const forms = loadForms(read);
  const unhandled = new Map<string, Unhandled>();
  const dexes = loadDexes(read);
  const seeds = [...buildSeeds(forms, unhandled, dexes ? emeraldHoenn(dexes) : undefined, loadOncePerSave(read)),
                 ...(dexes ? rewardSeeds(forms, dexes) : []), ...homeGiftSeeds(forms, read)];
  const evoText = read("evolution.json");
  return { forms, seeds, evo: evoText === undefined ? undefined : JSON.parse(evoText), unhandled };
}
