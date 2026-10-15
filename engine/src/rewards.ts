import { Form, Reader } from "./data.js";
import { Seed } from "./engine.js";

/** HOME dex-completion rewards (U12) as seeds at HOME. Requirements come from data/regional_dexes.json. */
export interface RewardSpec { reward: number; dexes: string[]; origin_games: string[] | null; exclude: number[]; registered_in_game?: boolean;
  /** species whose regional forms caught in the origin game do not count: only the plain CSV row does (HR1) */ base_form_only?: number[]; }
export interface DexFile { dexes: Record<string, { species: number[] }>; rewards: Record<string, RewardSpec>; }

export function loadDexes(read: Reader): DexFile | null {
  const t = read("regional_dexes.json");
  return t === undefined ? null : JSON.parse(t);
}

/** Species a dex needs, after the reward's exclusions. */
export function required(dex: DexFile, r: RewardSpec): number[] {
  const out = new Set<number>();
  for (const d of r.dexes) for (const n of dex.dexes[d].species) if (!r.exclude.includes(n)) out.add(n);
  return [...out];
}

export function rewardSeeds(forms: Form[], dex: DexFile): Seed[] {
  const seeds: Seed[] = [];
  for (const [id, r] of Object.entries(dex.rewards)) {
    const form = forms.find((f) => f.number === String(r.reward) && f.form === "");
    if (!form) throw new Error(`${id}: reward species ${r.reward} not in the CSVs`);
    // Registration counts any form (regional forms included); the Pokémon need not stay in HOME.
    const where = r.registered_in_game ? (r.origin_games as string[]) : "HOME";
    seeds.push({
      form, at: "HOME", origin: id, tags: [], flags: [], why: `HOME reward ${id} (U12)`,
      req: (o) => o.has.home && o.phone >= 1,                        // claimed in HOME's mobile app
      deps: required(dex, r).map((n) => ({ number: String(n), loc: where, origins: r.origin_games ?? undefined, notOrigin: id,
                                           anyForm: !(r.base_form_only ?? []).includes(n) })),
    });
  }
  return seeds;
}

/** Emerald's Hoenn Pokédex for the Johto first-partner prize: Jirachi and Deoxys are not required. */
export const emeraldHoenn = (dex: DexFile) => dex.dexes.hoenn_rse.species.filter((n) => n !== 385 && n !== 386);

/** ONCE_PER_SAVE (U9): mutually exclusive groups (data/once_per_save.csv) and one-time Pokémon that can evolve (data/one_time_evolving.csv); for each game, the Pokémon (full CSV names) whose own source in that game is once per save. */
export function loadOncePerSave(read: Reader): Map<string, Set<string>> | undefined {
  const t = read("once_per_save.csv");
  if (t === undefined) return undefined;
  const [head, ...rows] = t.trim().split(/\r?\n/).map((l) => l.split(";"));
  const gi = head.indexOf("games"), mi = head.indexOf("members"), out = new Map<string, Set<string>>();
  for (const r of rows) for (const g of r[gi].split("|")) for (const m of r[mi].split("|"))
    (out.get(g) ?? out.set(g, new Set()).get(g)!).add(m);
  // second half (Victor, 15 Oct): one-time Pokémon that can evolve, derived by data/tools/build_one_time.py
  const t2 = read("one_time_evolving.csv");
  if (t2 !== undefined) {
    const [h2, ...r2] = t2.trim().split(/\r?\n/).map((l) => l.split(";"));
    const g2 = h2.indexOf("game"), m2 = h2.indexOf("members");
    for (const r of r2) for (const m of r[m2].split("|")) (out.get(r[g2]) ?? out.set(r[g2], new Set()).get(r[g2])!).add(m);
  }
  return out;
}

/** Gifts HOME gives without a Pokédex condition (U12 rest, data/home_gifts.csv), as seeds at HOME. The gift id is the path origin. */
export function homeGiftSeeds(forms: Form[], read: Reader): Seed[] {
  const t = read("home_gifts.csv");
  if (t === undefined) return [];
  const [head, ...rows] = t.trim().split(/\r?\n/).map((l) => l.split(";"));
  const col = (r: string[], c: string) => r[head.indexOf(c)];
  const seeds: Seed[] = [];
  for (const r of rows) {
    const id = col(r, "id"), cond = col(r, "condition"), games = col(r, "games").split("|").filter(Boolean);
    const req: Seed["req"] =
      cond === "deposit" ? (o) => o.has.home && o.phone >= 1 && o.sw >= 1 && games.some((g) => (o.copies[g] ?? 0) > 0)
      : cond === "go_transfer" ? (o) => o.has.home && o.has.go && o.phone >= 1
      : cond === "home_start" ? (o) => o.has.home && (o.sw >= 1 || o.phone >= 1)
      : (o) => o.has.home && o.phone >= 1;                   // home_mobile_choice, challenge
    const flags = cond === "home_mobile_choice" ? ["ONCE_PER_SAVE"] : [];
    for (const name of col(r, "species").split("|")) {
      const form = forms.find((f) => f.name === name && f.form === "");
      if (!form) throw new Error(`${id}: ${name} not in the CSVs`);
      seeds.push({ form, at: "HOME", origin: id, tags: [], flags, why: `HOME gift ${id} (U12)`, req });
    }
  }
  return seeds;
}
