/** Game families: games that trade with each other (catalogue R3, Routes RT25–RT31). */
export const FAMILY = {
  vc1: ["Red", "Green", "Blue", "Yellow"],
  vc2: ["Gold", "Silver", "Crystal"],
  gba3: ["Ruby", "Sapphire", "Emerald", "FireRed", "LeafGreen"],
  gc: ["Colosseum", "XD"],
  gen4: ["Diamond", "Pearl", "Platinum", "HeartGold", "SoulSilver"],
  gen5: ["Black", "White", "Black2", "White2"],
  gen6: ["X", "Y", "OmegaRuby", "AlphaSapphire"],
  gen7: ["Sun", "Moon", "UltraSun", "UltraMoon"],
  lgpe: ["LetsGoPikachu", "LetsGoEevee"],
  swsh: ["Sword", "Shield"],
  bdsp: ["BrilliantDiamond", "ShiningPearl"],
  la: ["LegendsArceus"],
  sv: ["Scarlet", "Violet"],
  za: ["LegendsZA"],
  frlgSwitch: ["FireRedSwitch", "LeafGreenSwitch"],
} as const;

export const FAMILY_OF: Record<string, keyof typeof FAMILY> = {};
for (const [fam, games] of Object.entries(FAMILY)) for (const g of games) FAMILY_OF[g] = fam as keyof typeof FAMILY;

/** Every core-game location. Side games (Ranch, Ranger…) are sources, not locations. */
export const CORE_GAMES: string[] = Object.values(FAMILY).flat();

export const OTHER_VERSION: Record<string, string> = {
  Black2: "White2", White2: "Black2", Scarlet: "Violet", Violet: "Scarlet", Sword: "Shield", Shield: "Sword",
  LetsGoPikachu: "LetsGoEevee", LetsGoEevee: "LetsGoPikachu", BrilliantDiamond: "ShiningPearl", ShiningPearl: "BrilliantDiamond",
  HeartGold: "SoulSilver", SoulSilver: "HeartGold", Black: "White", White: "Black",
  OmegaRuby: "AlphaSapphire", AlphaSapphire: "OmegaRuby", UltraSun: "UltraMoon", UltraMoon: "UltraSun",
};

/** The user's input (data model section 2, "Owned"). */
export interface Owned {
  copies: Record<string, number>;   // copies per game
  dlc: Record<string, number>;      // copies with DLC per game
  gba: number; ds: number; dsGbaSlot: number; n3ds: number; sw: number;
  has: {
    pokewalker: boolean; dreamRadar: boolean; transporter: boolean; bank: boolean;
    ranchWestern: boolean; ranchJapanese: boolean; battleRevWestern: boolean; battleRevJapanese: boolean;
    ranger: boolean; bonusDiscUS: boolean; bonusDiscJP: boolean; palChannel: boolean;
  };
}

export const owns = (o: Owned, g: string) => (o.copies[g] ?? 0) > 0;
export const ownsAny = (o: Owned, gs: readonly string[]) => gs.some((g) => owns(o, g));
export const ownsDlc = (o: Owned, g: string) => (o.dlc[g] ?? 0) > 0;
/** DS-family systems: DS, DS Lite, DSi and every 3DS (C15). */
export const dsFamily = (o: Owned) => o.ds + o.n3ds;
/** Another save in the family besides `self`: a second game or a second copy (C14). */
export function partner(o: Owned, self: string, family: readonly string[]): boolean {
  const total = family.reduce((n, g) => n + (o.copies[g] ?? 0), 0);
  return owns(o, self) && total >= 2;
}

/** Adapter from the old engine's keyword inputs (as stored in the reference results). */
export function fromOldInputs(i: Record<string, any>): Owned {
  const n = (v: string) => (v === "2+" ? 2 : Number(v) || 0);
  const map: Record<string, string> = {
    red: "Red", green: "Green", blue: "Blue", yellow: "Yellow", gold: "Gold", silver: "Silver", crystal: "Crystal",
    ruby: "Ruby", sapphire: "Sapphire", firered: "FireRed", leafgreen: "LeafGreen", emerald: "Emerald", colo: "Colosseum", xd: "XD",
    diamond: "Diamond", pearl: "Pearl", platinum: "Platinum", heartgold: "HeartGold", soulsilver: "SoulSilver",
    black: "Black", white: "White", black2: "Black2", white2: "White2", x: "X", y: "Y", omega_ruby: "OmegaRuby", aplha_sapphire: "AlphaSapphire",
    sun: "Sun", moon: "Moon", ultrasun: "UltraSun", ultramoon: "UltraMoon", lg_pikachu: "LetsGoPikachu", lg_eevee: "LetsGoEevee",
    sword: "Sword", shield: "Shield", brilliant_diamond: "BrilliantDiamond", shining_pearl: "ShiningPearl", legends_arceus: "LegendsArceus",
    scarlet: "Scarlet", violet: "Violet", legends_za: "LegendsZA",
  };
  const copies: Record<string, number> = {}, dlc: Record<string, number> = {};
  for (const [k, g] of Object.entries(map)) if (i[k]) copies[g] = 1;
  for (const [k, g] of Object.entries({ sword_dlc: "Sword", shield_dlc: "Shield", scarlet_dlc: "Scarlet", violet_dlc: "Violet", legends_za_dlc: "LegendsZA" }))
    if (i[k] && i[g.toLowerCase()] !== false) dlc[g] = 1;
  const lang = (on: boolean, l: string | null, which: "Western" | "Japanese" | "American") =>
    !!on && (l === "Both" || l === which);
  return {
    copies, dlc,
    gba: n(i.gba_number), ds: n(i.ds_number), dsGbaSlot: i.og_ds ? 1 : 0, n3ds: n(i.three_ds_number), sw: n(i.switch_number),
    has: {
      pokewalker: !!i.pokewalker, dreamRadar: !!i.dream_radar, transporter: !!i.transporter, bank: !!i.bank,
      ranchWestern: lang(i.ranch, i.ranch_language, "Western"), ranchJapanese: lang(i.ranch, i.ranch_language, "Japanese"),
      battleRevWestern: lang(i.battle_rev, i.battle_rev_language, "Western"), battleRevJapanese: lang(i.battle_rev, i.battle_rev_language, "Japanese"),
      ranger: !!i.ranger, bonusDiscUS: lang(i.bonus_disc, i.bonus_disc_language, "American"),
      bonusDiscJP: lang(i.bonus_disc, i.bonus_disc_language, "Japanese"), palChannel: !!i.channel,
    },
  };
}
