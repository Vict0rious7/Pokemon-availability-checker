/** Display names, URL codes and grouping for everything the user can pick. Keys are the engine's game names (CSV columns). */
export interface GameInfo { key: string; name: string; code: string; dlc?: string; }
export interface Platform { id: string; name: string; note?: string; games: GameInfo[]; }

export const PLATFORMS: Platform[] = [
  { id: "vc", name: "Game Boy / Color (3DS Virtual Console)", note: "Only the 3DS Virtual Console releases can send Pokémon forward.", games: [
    { key: "Red", name: "Red", code: "R" }, { key: "Green", name: "Green (Japanese)", code: "G" }, { key: "Blue", name: "Blue", code: "B" },
    { key: "Yellow", name: "Yellow", code: "Y" }, { key: "Gold", name: "Gold", code: "Au" }, { key: "Silver", name: "Silver", code: "Ag" },
    { key: "Crystal", name: "Crystal", code: "C" }] },
  { id: "gba", name: "Game Boy Advance", games: [
    { key: "Ruby", name: "Ruby", code: "Ru" }, { key: "Sapphire", name: "Sapphire", code: "Sa" }, { key: "Emerald", name: "Emerald", code: "E" },
    { key: "FireRed", name: "FireRed", code: "FR" }, { key: "LeafGreen", name: "LeafGreen", code: "LG" }] },
  { id: "gc", name: "GameCube", games: [
    { key: "Colosseum", name: "Colosseum", code: "Co" }, { key: "XD", name: "XD: Gale of Darkness", code: "XD" }] },
  { id: "ds", name: "Nintendo DS", games: [
    { key: "Diamond", name: "Diamond", code: "Di" }, { key: "Pearl", name: "Pearl", code: "Pe" }, { key: "Platinum", name: "Platinum", code: "Pt" },
    { key: "HeartGold", name: "HeartGold", code: "HG" }, { key: "SoulSilver", name: "SoulSilver", code: "SS" },
    { key: "Black", name: "Black", code: "Bk" }, { key: "White", name: "White", code: "Wh" },
    { key: "Black2", name: "Black 2", code: "BB" }, { key: "White2", name: "White 2", code: "WW" }] },
  { id: "3ds", name: "Nintendo 3DS", games: [
    { key: "X", name: "X", code: "X" }, { key: "Y", name: "Y", code: "Yv" },
    { key: "OmegaRuby", name: "Omega Ruby", code: "OR" }, { key: "AlphaSapphire", name: "Alpha Sapphire", code: "AS" },
    { key: "Sun", name: "Sun", code: "Su" }, { key: "Moon", name: "Moon", code: "Mo" },
    { key: "UltraSun", name: "Ultra Sun", code: "US" }, { key: "UltraMoon", name: "Ultra Moon", code: "UM" }] },
  { id: "switch", name: "Nintendo Switch", games: [
    { key: "LetsGoPikachu", name: "Let's Go, Pikachu!", code: "LP" }, { key: "LetsGoEevee", name: "Let's Go, Eevee!", code: "LE" },
    { key: "Sword", name: "Sword", code: "Sw", dlc: "Expansion Pass" }, { key: "Shield", name: "Shield", code: "Sh", dlc: "Expansion Pass" },
    { key: "BrilliantDiamond", name: "Brilliant Diamond", code: "BD" }, { key: "ShiningPearl", name: "Shining Pearl", code: "SP" },
    { key: "LegendsArceus", name: "Legends: Arceus", code: "LA" },
    { key: "Scarlet", name: "Scarlet", code: "Sc", dlc: "The Hidden Treasure of Area Zero" }, { key: "Violet", name: "Violet", code: "Vi", dlc: "The Hidden Treasure of Area Zero" },
    { key: "LegendsZA", name: "Legends: Z-A", code: "ZA", dlc: "Mega Dimension" },
    { key: "FireRedSwitch", name: "FireRed (Switch)", code: "FRs" }, { key: "LeafGreenSwitch", name: "LeafGreen (Switch)", code: "LGs" }] },
];
export const GAMES: GameInfo[] = PLATFORMS.flatMap((p) => p.games);
export const GAME = Object.fromEntries(GAMES.map((g) => [g.key, g]));
export const gameName = (k: string) => GAME[k]?.name ?? k;

/** Hardware counts (engine field, label, max, URL code). */
export const HARDWARE = [
  { key: "gba", name: "Game Boy Advance / SP", max: 2, code: "gba", help: "Two are needed for link-cable trades; one links Ruby/Sapphire/Emerald/FireRed/LeafGreen to the GameCube." },
  { key: "ds", name: "Nintendo DS / DS Lite / DSi", max: 2, code: "ds", help: "3DS systems also count as DS systems." },
  { key: "dsGbaSlot", name: "…of which a DS or DS Lite (GBA slot)", max: 1, code: "slot", help: "Needed for Pal Park: moving Pokémon from GBA games to Diamond, Pearl, Platinum, HeartGold or SoulSilver." },
  { key: "n3ds", name: "Nintendo 3DS / 2DS", max: 2, code: "3ds", help: "Runs Poké Transporter and Pokémon Bank; two are needed to trade between 3DS games." },
  { key: "sw", name: "Nintendo Switch", max: 2, code: "sw", help: "Two are needed to trade between Switch games." },
  { key: "phone", name: "Smartphone", max: 1, code: "ph", help: "For Pokémon HOME's mobile app (gifts, Pokédex rewards) and Pokémon GO." },
] as const;

/** Services and side software (engine `has` field, label, URL code). */
export const SERVICES = [
  { key: "home", name: "Pokémon HOME", code: "home" },
  { key: "bank", name: "Pokémon Bank", code: "bank", help: "Closes on 25 February 2027." },
  { key: "transporter", name: "Poké Transporter", code: "tp", help: "Closes with Pokémon Bank on 25 February 2027." },
  { key: "go", name: "Pokémon GO", code: "go" },
  { key: "pokewalker", name: "Pokéwalker", code: "pw" },
  { key: "dreamRadar", name: "Pokémon Dream Radar", code: "dr" },
  { key: "ranger", name: "Pokémon Ranger (DS)", code: "rg" },
  { key: "ranchWestern", name: "My Pokémon Ranch (Western)", code: "rw" },
  { key: "ranchJapanese", name: "My Pokémon Ranch (Japanese)", code: "rj" },
  { key: "battleRevWestern", name: "Pokémon Battle Revolution (Western)", code: "bw" },
  { key: "battleRevJapanese", name: "Pokémon Battle Revolution (Japanese)", code: "bj" },
  { key: "bonusDiscUS", name: "Colosseum bonus disc (US)", code: "bu" },
  { key: "bonusDiscJP", name: "Colosseum bonus disc (Japanese)", code: "bp" },
  { key: "palChannel", name: "Pokémon Channel (PAL)", code: "ch" },
] as const;

/** Path flags: short label and explanation. */
export const FLAG: Record<string, [string, string]> = {
  ONCE_PER_SAVE: ["once per save", "Only one per save file, or one of a choice: plan which save gets it."],
  ONCE_PER_CARTRIDGE: ["once per cartridge", "Can only be done once per cartridge."],
  SAVE_WIPE: ["erases a save", "Doing it again means starting a new save."],
  DIFFERENT_NNID: ["two accounts", "The two 3DS systems need different Nintendo Network IDs."],
  CABLE_GC_GBA: ["GBA–GameCube cable", "Needs the GameCube Game Boy Advance cable."],
  CABLE_GBA_LINK: ["GBA link cable", "Needs a Game Boy Advance link cable."],
  HOME_PREMIUM: ["HOME Premium", "Moving from Bank to HOME needs a HOME Premium plan."],
  AFTER_REGISTERED: ["after one is registered", "A Mythical from Pokémon GO only enters a game where one is already registered: move a non-GO one there first."],
  REGION_LOCK: ["region-specific", "Needs a disc from a specific region."],
  ONLINE_SERVICE: ["online", "Needs an internet connection: a Mystery Gift or online service with no end date."],
};
/** Where a path starts: a game, or a HOME reward or gift. */
export const ORIGIN: Record<string, string> = {
  HR1: "HOME Paldea Pokédex reward", HR2: "HOME Sinnoh (BDSP) Pokédex reward", HR3: "HOME Hisui Pokédex reward", HR4: "HOME Kanto (Let's Go) Pokédex reward",
  HR5: "HOME Galar Pokédex reward", HR6: "HOME Lumiose Pokédex reward", HR7: "HOME Kanto (Switch FireRed/LeafGreen) Pokédex reward", HR8: "HOME National Pokédex reward",
  HG1: "HOME gift (Legends: Arceus deposit)", HG2: "HOME gift (BDSP deposit)", HG3: "HOME gift (Sword/Shield deposit)", HG4: "HOME gift (Scarlet/Violet deposit)",
  HG5: "HOME gift (Legends: Z-A deposit)", HG6: "HOME gift (first GO transfer)", HG7: "HOME gift (first start)", HG8: "HOME gift (mobile app, choose one)", HG9: "HOME gift (first challenge)",
  HOME: "Pokémon HOME", GO: "Pokémon GO",
  // side games and discs that deliver into a core game (engine `source`)
  Ranch: "My Pokémon Ranch", BattleRev: "Pokémon Battle Revolution", Ranger: "Pokémon Ranger", Pokewalker: "Pokéwalker",
  DreamRadar: "Pokémon Dream Radar", JapBonusDisc: "Colosseum bonus disc (Japanese)", USBonusDisc: "Colosseum bonus disc (US)",
  PALChannel: "Pokémon Channel (PAL)",
};
export const originName = (o: string) => ORIGIN[o] ?? gameName(o);

export const BANK_END_LABEL = "25 Feb 2027";

/** Last National Pokédex number of each generation (index = generation). */
export const GEN_END = [0, 151, 251, 386, 493, 649, 721, 809, 905, 1025];
const pad = (n: number) => `#${String(n).padStart(4, "0")}`;
export const genRange = (g: number) => `${pad(GEN_END[g - 1] + 1)}–${pad(GEN_END[g])}`;
