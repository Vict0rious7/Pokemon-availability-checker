import { Form, canHold } from "./data.js";
import { FAMILY, FAMILY_OF, CORE_GAMES, OTHER_VERSION, Owned, owns, ownsAny, ownsDlc, dsFamily, partner } from "./games.js";

const BANK_ENDS = "2027-02-25T19:00-08:00";

export interface Fact { form: Form; loc: string; tags: string[]; native: boolean; supports: Support[]; byOrigin: Map<string, Support[]>; }
/** One way a fact holds: the flags it needs, when it stops working, where the Pokémon was obtained and the routes it took (Phase 2). */
export interface Support { flags: string[]; until?: string; origin: string; via: string[]; /** bred: where the parent came from */ from?: string;
  /** display only: the side game or disc that delivered the Pokémon into its origin game (Ranch, bonus disc…) */ source?: string;
  /** internal: the pass that created it (semi-naive evaluation) */ born?: number; }
/** A move refused by an origin rule (Phase 2: "why not this path"). */
export interface Refusal { number: string; from: string; to: string; route: string; reason: string; origins: string[]; }

/** Fact store: "form F can be in location L with tags T" (data model, section 3). */
export class Store {
  facts = new Map<string, Fact>();
  private byLoc = new Map<string, Fact[]>();
  pass = 0;
  key(f: Form, loc: string, tags: string[]) { return `${f.id}@${loc}#${tags.join(",")}`; }
  /** Returns true when something new was learned (a new fact, nativeness, or a non-dominated path). */
  add(form: Form, loc: string, tags: string[], native: boolean, s: Support): boolean {
    tags = [...new Set(tags)].sort();
    const k = this.key(form, loc, tags);
    let f = this.facts.get(k);
    s = { ...s, born: this.pass };
    if (!f) {
      f = { form, loc, tags, native, supports: [s], byOrigin: new Map([[s.origin, [s]]]) };
      this.facts.set(k, f);
      (this.byLoc.get(loc) ?? this.byLoc.set(loc, []).get(loc)!).push(f);
      return true;
    }
    let changed = false;
    if (native && !f.native) { f.native = true; changed = true; }
    const list = f.byOrigin.get(s.origin) ?? [];          // paths compete only with paths from the same origin
    if (!list.some((x) => dominates(x, s))) {
      const gone = list.filter((x) => dominates(s, x));
      f.byOrigin.set(s.origin, list.filter((x) => !gone.includes(x)).concat([s]));
      f.supports = gone.length ? f.supports.filter((x) => !gone.includes(x)).concat([s]) : f.supports.concat([s]);
      changed = true;
    } else {
      // same flags and end date: keep the shorter path (Q3, best path first)
      const i = list.findIndex((x) => equivalent(x, s) && s.via.length < x.via.length);
      if (i >= 0) {
        const old = list[i]; list[i] = s;
        f.supports = f.supports.map((x) => (x === old ? s : x));
        changed = true;
      }
    }
    return changed;
  }
  /** Every way `number` holds at loc(s) with all `tags`, optionally only from some origins (used by unlocks and HOME rewards). */
  supportsOf(number: string, loc: string | string[], tags: string[] = [], origins?: string[], notOrigin?: string, anyForm = false): Support[] {
    const out: Support[] = [];
    for (const l of typeof loc === "string" ? [loc] : loc)
      for (const f of this.byLoc.get(l) ?? []) {
        if (f.form.number !== number || (!anyForm && f.form.form !== "") || !tags.every((t) => f.tags.includes(t))) continue;
        for (const s of f.supports) if ((!origins || origins.includes(s.origin)) && s.origin !== notOrigin) out.push(s);
      }
    return out;
  }
  refusals = new Map<string, Refusal>();
  refuse(r: Omit<Refusal, "origins">, origins: string[]) {
    const k = `${r.number}|${r.from}|${r.to}|${r.reason}`;
    const x = this.refusals.get(k) ?? { ...r, origins: [] };
    for (const o of origins) if (!x.origins.includes(o)) x.origins.push(o);
    this.refusals.set(k, x);
  }
  /** Any fact for this form number (base form) at loc carrying all `tags`. */
  has(number: string, loc: string, tags: string[] = []): boolean {
    return (this.byLoc.get(loc) ?? []).some((f) => f.form.number === number && f.form.form === "" && tags.every((t) => f.tags.includes(t)));
  }
  at(loc: string) { return this.byLoc.get(loc) ?? []; }
}
const later = (a?: string, b?: string) => (a === undefined ? true : b === undefined ? false : a >= b);
/** Paths are compared only with paths from the same origin, so every origin game keeps its best path (Q3 lists them best first). */
function dominates(a: Support, b: Support): boolean {
  return a.origin === b.origin && a.flags.every((x) => b.flags.includes(x)) && later(a.until, b.until);
}
const equivalent = (a: Support, b: Support) => dominates(a, b) && dominates(b, a);
/** All combinations of one support per dependency: flags add up, the earliest end date wins. Dominated combinations are dropped. */
function combine(base: Support, deps: Support[][]): Support[] {
  let cur = [base];
  for (const d of deps) {
    if (!d.length) return [];
    const next: Support[] = [];
    for (const a of cur) for (const b of d) {
      const c: Support = { ...a, flags: [...new Set([...a.flags, ...b.flags])].sort(), until: minUntil(a.until, b.until) };
      if (!next.some((x) => dominates(x, c))) next.splice(0, next.length, ...next.filter((x) => !dominates(c, x)), c);
    }
    cur = next;
  }
  return cur;
}
const minUntil = (a?: string, b?: string) => (a === undefined ? b : b === undefined ? a : a < b ? a : b);

// ---------------------------------------------------------------- seeds (code rules + special sources)

export interface Seed {
  form: Form; at: string; tags: string[]; flags: string[];
  req: (o: Owned, s: Store) => boolean;
  why: string;
  /** Facts this source needs (party unlocks, HOME rewards): their flags and end dates carry over to the unlocked Pokémon. */
  deps?: Dep[];
  /** Where the path starts when it is not the location itself (HOME rewards: the reward id). */
  origin?: string;
  /** Display only: the side game or disc that delivers it (the origin stays the core game it lands in). */
  source?: string;
}
export interface Dep { number: string; loc: string | string[]; tags?: string[]; origins?: string[]; notOrigin?: string; anyForm?: boolean; }

const BASE = new Set(["C", "E", "R", "B", "S"]);
const DLC_GAMES = new Set(["Sword", "Shield", "Scarlet", "Violet", "LegendsZA"]);
// Never credited: unobtainable, trade-only, set aside (C6), events, Dream World, Friend Safari (C23),
// record mixing (CCS/CCE in Ruby/Sapphire/Emerald, out of v1), event-only communication (CCEV).
const IGNORED = /^(—|T|TE|TED|EVTED|Ev.*|EV.*|DW.*|FS.*|CCEV)$/;
const RECORD_MIXING = new Set(["Ruby", "Sapphire", "Emerald"]);
const has = (o: Owned) => o.has;

/** Party unlocks (H2/H3): the legendary appears in SELF once its counterparts are facts there. */
const PARTY: Record<string, { games: string[]; needs: string[]; tags?: string[] }> = {
  "245": { games: ["UltraSun", "UltraMoon"], needs: ["243", "244"] },                       // Suicune: Raikou + Entei
  "384": { games: ["UltraSun", "UltraMoon"], needs: ["382", "383"] },                       // Rayquaza: Kyogre + Groudon
  "487": { games: ["OmegaRuby", "AlphaSapphire", "UltraSun", "UltraMoon"], needs: ["483", "484"] }, // Giratina
  "645": { games: ["Black", "White", "OmegaRuby", "AlphaSapphire", "UltraSun", "UltraMoon"], needs: ["641", "642"] }, // Landorus
  "646": { games: ["OmegaRuby", "AlphaSapphire", "UltraSun", "UltraMoon"], needs: ["643", "644"] }, // Kyurem
  "486": { games: ["Diamond", "Pearl", "Platinum"], needs: ["377", "378", "379"] },           // Regigigas: the three Regis
  "465": { games: ["Diamond", "Pearl"], needs: ["114"] },                                     // Tangrowth: Tangela (H11)
};
const HGSS_RAYQUAZA = { games: ["HeartGold", "SoulSilver"], needs: ["382", "383"], tags: ["embedded_tower"] }; // C20

/** Dual-slot map (H1), derived once from the CSVs exactly as the old engine read them. */
function dualSlotGames(f: Form): string[][] {
  // returns alternatives: each a list of GBA games, any one of which is enough
  const c = f.cells;
  if (f.number === "94") return [FAMILY.gba3 as unknown as string[]];          // Gengar: any Gen 3 GBA game
  if (f.gen === 1) {
    const out: string[] = [];
    if (["C", "E"].includes(c.BrilliantDiamond)) out.push("FireRed");
    if (["C", "E"].includes(c.ShiningPearl)) out.push("LeafGreen");
    return out.length ? [out] : [];
  }
  if (f.gen === 2) {
    const out: string[] = [];
    if (["C", "E"].includes(c.Emerald)) out.push("Emerald");
    if (c.FireRed === "B") out.push("FireRed");
    if (c.LeafGreen === "B") out.push("LeafGreen");
    return out.length ? [out] : [];
  }
  if (f.gen === 3) {
    const out: string[] = [];
    if (["C", "E"].includes(c.Ruby)) out.push("Ruby");
    if (["C", "E"].includes(c.Sapphire)) out.push("Sapphire");
    return out.length ? [out] : [];
  }
  if (f.number === "472") return [["Emerald"]];    // Gliscor
  if (f.number === "466") return [["FireRed"]];    // Electivire
  if (f.number === "467") return [["LeafGreen"]];  // Magmortar
  return [];
}

export interface Unhandled { game: string; code: string; forms: string[]; }

/** `hoennDex`: Emerald's Hoenn Pokédex (national numbers, Jirachi and Deoxys excluded) for the Johto first-partner prize (Q1).
 *  Without it the Phase 1 shortcut is used. */
export function buildSeeds(forms: Form[], unhandled: Map<string, Unhandled>, hoennDex?: number[], oncePerSave?: Map<string, Set<string>>): Seed[] {
  const seeds: Seed[] = [];
  const full = (f: Form) => (f.form ? `${f.name} (${f.form})` : f.name);
  // ONCE_PER_SAVE (U9): a source in a game where the Pokémon belongs to a once-per-save group. Flags never hide (always shown).
  const ops = (f: Form, at: string) => (oncePerSave?.get(at)?.has(full(f)) ? ["ONCE_PER_SAVE"] : []);
  const add = (form: Form, at: string, req: Seed["req"], why: string, flags: string[] = [], tags: string[] = [], deps?: Seed["deps"], source?: string) =>
    seeds.push({ form, at, req, why, flags: [...new Set([...flags, ...ops(form, at)])], tags: [...tags, ...originTags(at)], deps, ...(source ? { source } : {}) });
  const miss = (game: string, code: string, f: Form) => {
    const k = `${game}|${code}`;
    const u = unhandled.get(k) ?? { game, code, forms: [] };
    u.forms.push(f.id); unhandled.set(k, u);
  };

  for (const f of forms) {
    for (const [game, raw] of Object.entries(f.cells)) {
      if (!CORE_GAMES.includes(game)) continue;            // side-game columns are handled below
      const code = raw === "C*" ? "C" : raw;
      const fam = FAMILY_OF[game];
      const self = (o: Owned) => owns(o, game);
      const tagsFor = (): string[] =>
        (game === "HeartGold" && f.number === "382") || (game === "SoulSilver" && f.number === "383") ? ["embedded_tower"] : [];

      // ---- special sources that replace the cell (overrides_cell)
      const party = PARTY[f.number];
      if (party && party.games.includes(game) && f.form === "") {
        add(f, game, self, `party unlock ${party.needs.join("+")}`, [], [], party.needs.map((n) => ({ number: n, loc: game })));
        continue;
      }
      if (f.number === "384" && HGSS_RAYQUAZA.games.includes(game)) {
        add(f, game, self, "Embedded Tower Kyogre + Groudon (C20)", [], [], HGSS_RAYQUAZA.needs.map((n) => ({ number: n, loc: game, tags: HGSS_RAYQUAZA.tags })));
        continue;
      }
      if (f.number === "442" && ["Diamond", "Pearl", "Platinum"].includes(game)) {   // Spiritomb, Underground
        add(f, game, (o) => partner(o, game, ["Diamond", "Pearl", "Platinum"]) && dsFamily(o) >= 2, "Spiritomb: another D/P/Pt save + 2 systems");
        continue;
      }
      if (f.number === "442" && fam === "swsh") continue;                                   // C22: needs 32 other players
      if (f.number === "151" && fam === "bdsp" && code === "CCR") { add(f, game, (o) => self(o) && ownsAny(o, FAMILY.lgpe), "Let's Go save (BDSP Mew)"); continue; }
      if (f.number === "385" && fam === "bdsp" && code === "CCR") { add(f, game, (o) => self(o) && ownsAny(o, FAMILY.swsh), "Sword/Shield save (BDSP Jirachi)"); continue; }
      if (f.number === "493" && fam === "bdsp") { add(f, game, (o) => self(o) && owns(o, "LegendsArceus"), "Legends: Arceus save"); continue; }
      if (f.number === "491" && game === "LegendsArceus") { add(f, game, (o) => self(o) && ownsAny(o, FAMILY.bdsp), "BDSP save (Darkrai)"); continue; }
      if (f.number === "492" && game === "LegendsArceus") { add(f, game, (o) => self(o) && ownsAny(o, FAMILY.swsh), "Sword/Shield save (Shaymin)"); continue; }
      if (f.number === "801" && fam === "gen7" && code === "EV") { add(f, game, self, "Magearna QR code (R7)"); continue; }
      if (f.number === "1025" && fam === "sv" && code === "EVD") { add(f, game, (o) => ownsDlc(o, game), "Mythical Pecha Berry (C12)", ["ONLINE_SERVICE"]); continue; }
      if (game === "Emerald" && (code === "CCR" || code === "CCE") && +f.number >= 152 && +f.number <= 160) {   // Johto first partners
        if (hoennDex) add(f, game, self, "Hoenn dex complete in Emerald (Q1)", [], [],
          hoennDex.map((n) => ({ number: String(n), loc: "Emerald", anyForm: true })));
        else add(f, game, (o) => self(o) && ["Ruby", "Sapphire", "XD"].filter((g) => owns(o, g)).length >= 2, "Hoenn dex: two of Ruby, Sapphire, XD (Phase 1 shortcut)");
        continue;
      }

      // ZA1: Z-A side missions EX1/EX2 are unlocked by Mystery Gifts with no end date (Diancie, Mewtwo); EX3 (Zeraora,
      // Mega Dimension) needs both. The only EV/EVD cells in the Z-A column.
      if (game === "LegendsZA" && (code === "EV" || code === "EVD")) {
        add(f, game, (o) => (code === "EVD" ? ownsDlc(o, game) : self(o)), "Z-A side mission unlocked by Mystery Gift (ZA1)", ["ONLINE_SERVICE"]);
        continue;
      }
      if (IGNORED.test(code)) continue;
      if (RECORD_MIXING.has(game) && (code === "CCS" || code === "CCE")) continue;   // record mixing, out of v1 (Q12)

      // ---- Dual-slot in Diamond / Pearl / Platinum (D…, DS…)
      if (fam === "gen4" && ["Diamond", "Pearl", "Platinum"].includes(game) && /^D(S)?(E|ET)?$/.test(code)) {
        const alts = dualSlotGames(f);
        if (!alts.length) { miss(game, code, f); continue; }
        const slot = (o: Owned) => o.dsGbaSlot >= 1 && alts.some((gs) => ownsAny(o, gs));
        if (code.endsWith("ET")) add(f, game, (o) => self(o) && slot(o) && partner(o, game, FAMILY.gen4) && dsFamily(o) >= 2, "dual-slot + trade evolution");
        else add(f, game, (o) => self(o) && slot(o), "dual-slot");
        continue;
      }

      // ---- DLC suffix (Sword/Shield, Scarlet/Violet, Z-A)
      let c = code, dlc = false;
      if (DLC_GAMES.has(game)) {
        if (fam === "swsh" && c.endsWith("DA")) { c = c.slice(0, -2) || "C"; dlc = true; }
        else if (c.length > 1 && c.endsWith("D") && !(fam === "swsh" && c === "D")) { c = c.slice(0, -1); dlc = true; }
        if (fam === "swsh" && c === "D") c = "C";   // Max Raid den
      }
      const base = (o: Owned) => (dlc ? ownsDlc(o, game) : self(o));

      if (BASE.has(c)) {
        if (fam === "gc") add(f, game, (o) => self(o) && ownsAny(o, FAMILY.gba3) && o.gba >= 1, "Colosseum/XD with a GBA game (C9)", ["CABLE_GC_GBA"]);
        else add(f, game, base, `code ${code}`, [], tagsFor());
        continue;
      }
      if (c === "ET") { if (!addTradeEvolution(f, game, dlc, add)) miss(game, code, f); continue; }
      if (c === "DR" || c === "DRE" || c === "DRET") {
        const tags = ["641", "642", "645"].includes(f.number) ? ["dr_therian"] : [];
        add(f, game, (o) => self(o) && has(o).dreamRadar && o.n3ds >= 1 && (c !== "DRET" || (partner(o, game, FAMILY.gen5) && dsFamily(o) >= 2)), "Dream Radar", [], tags, undefined, "DreamRadar");
        continue;
      }
      if (c === "PW" || c === "PWE") { add(f, game, (o) => self(o) && has(o).pokewalker, "Pokéwalker", [], [], undefined, "Pokewalker"); continue; }
      if (c.startsWith("CC")) {
        if (fam === "gen5" && (game === "Black2" || game === "White2")) {
          add(f, game, (o) => self(o) && owns(o, OTHER_VERSION[game]) && dsFamily(o) >= 2, "B2W2 communication"); continue;
        }
        if (fam === "sv" && !dlc && c === "CC") {
          add(f, game, (o) => self(o) && owns(o, OTHER_VERSION[game]) && o.sw >= 2, "other version + 2 Switches"); continue;
        }
        if (fam === "sv" && dlc) {
          add(f, game, (o) => ownsDlc(o, game) && FAMILY.sv.reduce((n, g) => n + (o.dlc[g] ?? 0), 0) >= 2 && o.sw >= 2, "two Scarlet/Violet copies with DLC (C22)"); continue;
        }
        if (fam === "swsh" && dlc) {
          add(f, game, (o) => ownsDlc(o, game) && ownsDlc(o, OTHER_VERSION[game]) && o.sw >= 2, "other version's DLC + 2 Switches (C22)"); continue;
        }
      }
      miss(game, code, f);
    }
  }

  // ---- side games delivering into core games (Routes RT3–RT5, RT20–RT24)
  for (const f of forms) {
    const c = f.cells;
    const deliver = (targets: readonly string[], req: (o: Owned) => boolean, why: string, flags: string[] = [], source?: string) => {
      for (const g of targets) if (canHold(f, g)) add(f, g, (o) => owns(o, g) && req(o), why, flags, [], undefined, source);
    };
    const yes = (v?: string) => v !== undefined && v !== "" && !IGNORED.test(v);
    if (yes(c.Ranch)) {
      deliver(["Diamond", "Pearl"], (o) => has(o).ranchWestern || has(o).ranchJapanese, "My Pokémon Ranch", [], "Ranch");
      deliver(["Platinum"], (o) => has(o).ranchJapanese, "My Pokémon Ranch (Japanese)", [], "Ranch");
    }
    if (yes(c.BattleRev)) {
      const western = f.gen === 4;   // Electivire, Magmortar: Western only; Pikachu: any language (Q16)
      deliver(FAMILY.gen4, (o) => has(o).battleRevWestern || (!western && has(o).battleRevJapanese), "Battle Revolution", [], "BattleRev");
    }
    if (yes(c.Ranger)) deliver(FAMILY.gen4, (o) => has(o).ranger, "Pokémon Ranger", ["ONCE_PER_CARTRIDGE", "SAVE_WIPE"], "Ranger");
    if (yes(c.JapBonusDisc)) deliver(FAMILY.gba3, (o) => has(o).bonusDiscJP && owns(o, "Colosseum"), "Japanese bonus disc (C11)", ["CABLE_GC_GBA", "REGION_LOCK"], "JapBonusDisc");
    if (yes(c.USBonusDisc)) deliver(["Ruby", "Sapphire"], (o) => has(o).bonusDiscUS, "US bonus disc", ["CABLE_GC_GBA", "REGION_LOCK", "ONCE_PER_SAVE"], "USBonusDisc");
    if (yes(c.PALChannel)) deliver(["Ruby", "Sapphire"], (o) => has(o).palChannel, "PAL Pokémon Channel", ["CABLE_GC_GBA", "ONCE_PER_SAVE"], "PALChannel");
  }

  // ---- Pokémon GO as a source (RT14, RT15). v1: Meltan and Melmetal only (C18). The Mystery Box opens
  // once GO is linked to Let's Go or to HOME; Melmetal is evolved in GO with Meltan Candy.
  for (const f of forms) {
    if (f.form !== "" || !GO_SPECIES.has(f.number)) continue;
    add(f, "GO", (o) => goOn(o) && (o.has.home || ownsAny(o, FAMILY.lgpe)), "GO Mystery Box (C18)");
  }
  return seeds;
}

function addTradeEvolution(f: Form, game: string, dlc: boolean, add: (f: Form, at: string, req: Seed["req"], why: string, flags?: string[]) => void): boolean {
  const fam = FAMILY_OF[game];
  const self = (o: Owned) => (dlc ? ownsDlc(o, game) : owns(o, game));
  switch (fam) {
    case "vc1": add(f, game, (o) => self(o) && partner(o, game, [...FAMILY.vc1, ...FAMILY.vc2]) && o.n3ds >= 2, "trade evolution", ["DIFFERENT_NNID"]); return true;
    case "vc2": add(f, game, (o) => self(o) && partner(o, game, FAMILY.vc2) && o.n3ds >= 2, "trade evolution", ["DIFFERENT_NNID"]); return true;
    case "gba3":
      add(f, game, (o) => self(o) && partner(o, game, FAMILY.gba3) && o.gba >= 2, "trade evolution", ["CABLE_GBA_LINK"]);
      add(f, game, (o) => self(o) && ownsAny(o, FAMILY.gc) && o.gba >= 1, "trade evolution via Colosseum/XD (C27)", ["CABLE_GC_GBA"]);
      return true;
    case "gc": add(f, game, (o) => self(o) && ownsAny(o, FAMILY.gba3) && o.gba >= 1, "trade evolution via a GBA game", ["CABLE_GC_GBA"]); return true;
    case "gen4": add(f, game, (o) => self(o) && partner(o, game, FAMILY.gen4) && dsFamily(o) >= 2, "trade evolution"); return true;
    case "gen5": add(f, game, (o) => self(o) && partner(o, game, FAMILY.gen5) && dsFamily(o) >= 2, "trade evolution"); return true;
    case "gen6": add(f, game, (o) => self(o) && partner(o, game, FAMILY.gen6) && o.n3ds >= 2, "trade evolution"); return true;
    case "gen7": add(f, game, (o) => self(o) && partner(o, game, FAMILY.gen7) && o.n3ds >= 2, "trade evolution"); return true;
    case "lgpe": case "bdsp": case "swsh": case "sv":
    case "za": case "frlgSwitch":   // Phase 2: Bulbapedia codes ET in both, so both trade (extends RT31)
      add(f, game, (o) => self(o) && partner(o, game, FAMILY[fam]) && o.sw >= 2, "trade evolution"); return true;
  }
  return false;
}

// ---------------------------------------------------------------- routes (Routes tab)

interface Route {
  id: string; from: readonly string[]; to: readonly string[];
  req: (o: Owned) => boolean; flags?: string[]; until?: string;
  forms?: (f: Form) => boolean;
  forbids?: (from: string, to: string) => string[];
  /** Tags the Pokémon carries after the move, or the reason the move is refused (origin locks, Phase 2). */
  retag?: (from: string, to: string, tags: string[], f: Form) => string[] | string;
  /** Legendaries and Mythicals move only once per save on this route (U4: BDSP into HOME; RT19). */
  legendsOnce?: (from: string) => boolean;
}
const STORAGE = new Set(["bank_g6", "bank_g7"]);
/** Non-game locations: Bank's two sides, HOME, GO. Any species can be stored; none is "native" in the Phase 1 sense. */
const NOT_GAMES = new Set([...STORAGE, "HOME", "GO"]);
const GO_SPECIES = new Set(["808", "809"]);   // C18
const goOn = (o: Owned) => o.has.go && o.phone >= 1;
const homeOn = (o: Owned) => o.has.home && (o.sw >= 1 || o.phone >= 1);   // HOME on Switch or on a phone (RT13)
/** Origin tags set where a Pokémon is caught (data model: lgpe_pure, za_touched). */
function originTags(at: string): string[] {
  const fam = FAMILY_OF[at];
  return fam === "lgpe" ? ["lgpe_pure"] : fam === "za" ? ["za_touched"] : [];
}
// U4: Spinda cannot move between HOME and BDSP either way; BDSP Nincada cannot leave BDSP, other Nincada cannot enter.
const BDSP_LOCKED = new Set(["327", "290"]);
const without = (tags: string[], t: string) => tags.filter((x) => x !== t);
const SWITCH_HOME_GAMES = [...FAMILY.swsh, ...FAMILY.bdsp, ...FAMILY.la, ...FAMILY.sv];
const within = (id: string, games: readonly string[], req: Route["req"], extra: Partial<Route> = {}): Route => ({ id, from: games, to: games, req, ...extra });

export const ROUTES: Route[] = [
  { id: "RT1", from: FAMILY.vc1, to: FAMILY.vc2, req: (o) => o.n3ds >= 2, flags: ["DIFFERENT_NNID"], forms: (f) => f.gen === 1 && f.form === "" },
  { id: "RT1", from: FAMILY.vc2, to: FAMILY.vc1, req: (o) => o.n3ds >= 2, flags: ["DIFFERENT_NNID"], forms: (f) => f.gen === 1 && f.form === "" },
  { id: "RT2", from: FAMILY.gba3, to: FAMILY.gc, req: (o) => o.gba >= 1, flags: ["CABLE_GC_GBA"] },
  { id: "RT2", from: FAMILY.gc, to: FAMILY.gba3, req: (o) => o.gba >= 1, flags: ["CABLE_GC_GBA"] },
  { id: "RT6", from: FAMILY.gba3, to: FAMILY.gen4, req: (o) => o.dsGbaSlot >= 1 },
  { id: "RT7", from: FAMILY.gen4, to: FAMILY.gen5, req: (o) => dsFamily(o) >= 2 },
  { id: "RT8", from: FAMILY.gen5, to: ["bank_g6"], req: (o) => o.has.transporter && o.has.bank && o.n3ds >= 1, until: BANK_ENDS },
  { id: "RT9", from: [...FAMILY.vc1, ...FAMILY.vc2], to: ["bank_g7"], req: (o) => o.has.transporter && o.has.bank && o.n3ds >= 1, until: BANK_ENDS },
  { id: "RT10", from: FAMILY.gen6, to: ["bank_g6"], req: (o) => o.has.bank && o.n3ds >= 1, until: BANK_ENDS },
  { id: "RT10", from: ["bank_g6"], to: FAMILY.gen6, req: (o) => o.has.bank && o.n3ds >= 1, until: BANK_ENDS },
  { id: "RT11", from: ["bank_g6"], to: FAMILY.gen7, req: (o) => o.has.bank && o.n3ds >= 1, until: BANK_ENDS },
  { id: "RT12", from: FAMILY.gen7, to: ["bank_g7"], req: (o) => o.has.bank && o.n3ds >= 1, until: BANK_ENDS },
  { id: "RT12", from: ["bank_g7"], to: FAMILY.gen7, req: (o) => o.has.bank && o.n3ds >= 1, until: BANK_ENDS },
  within("RT25", FAMILY.gba3, (o) => o.gba >= 2, { flags: ["CABLE_GBA_LINK"] }),
  within("RT26", FAMILY.gen4, (o) => dsFamily(o) >= 2),
  within("RT27", FAMILY.gen5, (o) => dsFamily(o) >= 2, {
    forbids: (from, to) => (["Black2", "White2"].includes(from) && ["Black", "White"].includes(to) ? ["dr_therian"] : []),  // C28
  }),
  within("RT28", FAMILY.gen6, (o) => o.n3ds >= 2),
  within("RT29", FAMILY.gen7, (o) => o.n3ds >= 2),
  within("RT30", FAMILY.vc1, (o) => o.n3ds >= 2, { flags: ["DIFFERENT_NNID"] }),   // U16
  within("RT30", FAMILY.vc2, (o) => o.n3ds >= 2, { flags: ["DIFFERENT_NNID"] }),
  ...(["lgpe", "swsh", "bdsp", "sv", "za", "frlgSwitch"] as const).map((fam) => within("RT31", FAMILY[fam], (o) => o.sw >= 2)),   // za, frlgSwitch: Phase 2

  // ---- Phase 2: HOME (Routes tab RT13–RT19)
  { id: "RT13", from: ["bank_g6", "bank_g7"], to: ["HOME"], req: (o) => o.has.bank && o.n3ds >= 1 && homeOn(o), flags: ["HOME_PREMIUM"], until: BANK_ENDS },
  { id: "RT14", from: ["GO"], to: FAMILY.lgpe, req: (o) => goOn(o) && o.sw >= 1,
    retag: (_f, _t, tags) => [...tags, "lgpe_pure"] },                       // GO Park arrivals count as Let's Go-only
  { id: "RT15", from: ["GO"], to: ["HOME"], req: (o) => goOn(o) && o.has.home },
  { id: "RT16", from: FAMILY.lgpe, to: ["HOME"], req: (o) => homeOn(o) && o.sw >= 1 },
  { id: "RT16", from: ["HOME"], to: FAMILY.lgpe, req: (o) => homeOn(o) && o.sw >= 1,
    retag: (_f, _t, tags) => (tags.includes("lgpe_pure") ? tags : "has left Let's Go (lgpe_pure)") },
  { id: "RT17", from: SWITCH_HOME_GAMES, to: ["HOME"], req: (o) => homeOn(o) && o.sw >= 1, legendsOnce: (from) => FAMILY_OF[from] === "bdsp",
    retag: (from, _t, tags, f) => (FAMILY_OF[from] === "bdsp" && BDSP_LOCKED.has(f.number) ? "cannot leave BDSP (U4)" : tags) },
  { id: "RT17", from: ["HOME"], to: SWITCH_HOME_GAMES, req: (o) => homeOn(o) && o.sw >= 1,
    retag: (_f, to, tags, f) =>
      tags.includes("za_touched") ? "has been in Z-A: never to an older game (za_touched, RT18)"
      : FAMILY_OF[to] === "bdsp" && BDSP_LOCKED.has(f.number) ? "cannot enter BDSP (U4)" : without(tags, "lgpe_pure") },
  { id: "RT18", from: FAMILY.za, to: ["HOME"], req: (o) => homeOn(o) && o.sw >= 1 },
  { id: "RT18", from: ["HOME"], to: FAMILY.za, req: (o) => homeOn(o) && o.sw >= 1,
    retag: (_f, _t, tags) => [...without(tags, "lgpe_pure"), "za_touched"] },
  { id: "RT19", from: FAMILY.frlgSwitch, to: ["HOME"], req: (o) => homeOn(o) && o.sw >= 1, legendsOnce: () => true },   // one-way; nothing enters Switch FRLG
];

// ---------------------------------------------------------------- run

// ---------------------------------------------------------------- arrival rules (Phase 2)
// A Pokémon that reaches a game can evolve there, and can be bred there (with a Ditto, or a partner from a shared Egg Group).
// Evolving keeps the origin; an egg takes the game as its origin, so HOME rewards and origin rules see it.
// Not "native" in the Phase 1 sense. Forms: regional, East/West, Basculin stripes… are followed (data/evolution.json).

export interface EvoRow { from: number; to: number; vg: number; trade: boolean; multiplayer: boolean;
  from_form: string | null; to_form: string | null; region: number | null; }
export interface SpeciesInfo { egg: number | null; egg_groups: number[]; gender_rate: number; baby: boolean;
  legendary: boolean; mythical: boolean; default_form: string; }
export interface EvoData { evolutions: EvoRow[]; species: Record<string, SpeciesInfo>; }
// PokeAPI version groups in release order; a game's position includes its DLC groups.
const VG_ORDER = [1, 28, 29, 2, 3, 4, 5, 6, 7, 12, 13, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 30, 31, 32];
const GAME_VG: Record<string, number[]> = {
  Red: [1, 28], Green: [1, 28], Blue: [1, 29], Yellow: [2], Gold: [3], Silver: [3], Crystal: [4], Ruby: [5], Sapphire: [5], Emerald: [6],
  FireRed: [7], LeafGreen: [7], Colosseum: [12], XD: [13], Diamond: [8], Pearl: [8], Platinum: [9], HeartGold: [10], SoulSilver: [10],
  Black: [11], White: [11], Black2: [14], White2: [14], X: [15], Y: [15], OmegaRuby: [16], AlphaSapphire: [16], Sun: [17], Moon: [17],
  UltraSun: [18], UltraMoon: [18], LetsGoPikachu: [19], LetsGoEevee: [19], Sword: [20, 21, 22], Shield: [20, 21, 22],
  BrilliantDiamond: [23], ShiningPearl: [23], LegendsArceus: [24], Scarlet: [25, 26, 27], Violet: [25, 26, 27], LegendsZA: [30, 31],
  FireRedSwitch: [7], LeafGreenSwitch: [7],
};
const pos = (vg: number) => VG_ORDER.indexOf(vg);
const BREEDING = new Set(["vc2", "gba3", "gen4", "gen5", "gen6", "gen7", "swsh", "bdsp", "sv", "frlgSwitch"]);   // no breeding: Gen 1, Colosseum/XD, Let's Go, Legends: Arceus, Z-A
// Regional evolutions (PokeAPI region rows) happen in the games of that region.
const REGION_GAMES: Record<number, readonly string[]> = { 7: FAMILY.gen7, 8: FAMILY.swsh, 9: FAMILY.la, 10: FAMILY.sv };
// PokeAPI form identifiers that are rows of their own in the CSVs; every other form is cosmetic (species level).
const FORM_NAME: Record<string, string> = {
  alola: "Alolan Form", galar: "Galarian Form", hisui: "Hisuian Form", paldea: "Paldean Form", east: "East", west: "West",
  summer: "Summer", autumn: "Autumn", winter: "Winter", "red-striped": "Red", "blue-striped": "Blue", "white-striped": "White",
  midnight: "Midnight", dusk: "Dusk", amped: "Amped", "low-key": "Low Key", male: "Male", female: "Female",
};
// Babies that hatch only when a parent holds an incense: bred only where Bulbapedia codes the baby "B" (bred) in that game.
const INCENSE = new Set([298, 360, 406, 433, 438, 439, 440, 446, 458]);

/** How (from -> to) evolves in `game`: "trade", "other", or null when no method applies there.
 *  A non-trade method from before the first trade method stops at that trade method; a later non-trade method
 *  (Milotic's beauty in ORAS) applies only to its own game. Legends: Arceus replaces trades with the Linking Cord. */
export function evoMethod(rows: EvoRow[], game: string): "trade" | "other" | null {
  const own = GAME_VG[game]; if (!own) return null;
  const at = Math.max(...own.map(pos));
  const ok = rows.filter((r) => pos(r.vg) <= at);
  if (!ok.length) return null;
  const trades = ok.filter((r) => r.trade);
  if (!trades.length) return "other";
  if (game === "LegendsArceus") return "other";
  const firstTrade = Math.min(...trades.map((r) => pos(r.vg)));
  const other = ok.some((r) => !r.trade && ((pos(r.vg) < firstTrade && at < firstTrade) || own.includes(r.vg)));
  return other ? "other" : "trade";
}

/** Can the user trade within this game's family (a second save and the hardware)? Returns the flags the trade needs, or null. */
export function tradeFlags(o: Owned, game: string): string[] | null {
  const fam = FAMILY_OF[game];
  switch (fam) {
    case "vc1": return partner(o, game, [...FAMILY.vc1, ...FAMILY.vc2]) && o.n3ds >= 2 ? ["DIFFERENT_NNID"] : null;
    case "vc2": return partner(o, game, FAMILY.vc2) && o.n3ds >= 2 ? ["DIFFERENT_NNID"] : null;
    case "gba3": return partner(o, game, FAMILY.gba3) && o.gba >= 2 ? ["CABLE_GBA_LINK"] : ownsAny(o, FAMILY.gc) && o.gba >= 1 ? ["CABLE_GC_GBA"] : null;
    case "gc": return ownsAny(o, FAMILY.gba3) && o.gba >= 1 ? ["CABLE_GC_GBA"] : null;
    case "gen4": case "gen5": return partner(o, game, FAMILY[fam]) && dsFamily(o) >= 2 ? [] : null;
    case "gen6": case "gen7": return partner(o, game, FAMILY[fam]) && o.n3ds >= 2 ? [] : null;
    case "lgpe": case "swsh": case "bdsp": case "la": case "sv": case "za": case "frlgSwitch":
      return partner(o, game, FAMILY[fam]) && o.sw >= 2 ? [] : null;
  }
  return null;
}

interface Indexed { byFrom: Map<number, Map<number, EvoRow[]>>; rows: Map<string, Form>; firstChild: Map<number, number>; legends: Set<string>; }
const evoIndex = new WeakMap<EvoData, Map<Form[], Indexed>>();
function indexOf(evo: EvoData, forms: Form[]): Indexed {
  const per = evoIndex.get(evo) ?? evoIndex.set(evo, new Map()).get(evo)!;
  let x = per.get(forms);
  if (!x) {
    const byFrom = new Map<number, Map<number, EvoRow[]>>(), firstChild = new Map<number, number>();
    for (const r of evo.evolutions) {
      const m = byFrom.get(r.from) ?? byFrom.set(r.from, new Map()).get(r.from)!;
      (m.get(r.to) ?? m.set(r.to, []).get(r.to)!).push(r);
      if (!firstChild.has(r.from)) firstChild.set(r.from, r.to);
    }
    const rows = new Map(forms.map((f) => [`${f.number}|${f.form}`, f]));
    const legends = new Set(Object.entries(evo.species).filter(([, s]) => s.legendary || s.mythical).map(([n]) => n));
    x = { byFrom, rows, firstChild, legends };
    per.set(forms, x);
  }
  return x;
}
/** The CSV row for species `n` in PokeAPI form `pf` (null = the species' default form). Cosmetic forms fall back to the plain row. */
function csvForm(ix: Indexed, evo: EvoData, n: number, pf: string | null): Form | undefined {
  const id = pf || evo.species[String(n)]?.default_form || "";
  const name = FORM_NAME[id] ?? "";
  return ix.rows.get(`${n}|${name}`) ?? ix.rows.get(`${n}|`);
}
export const legendsOf = (evo: EvoData, forms: Form[]) => indexOf(evo, forms).legends;

function arrivalStep(o: Owned, store: Store, forms: Form[], evo: EvoData, fresh: (s: Support) => boolean): boolean {
  let changed = false;
  const ix = indexOf(evo, forms);
  // Breeding partners per game, built once per pass: Dittos, and per Egg Group the male-capable Pokémon (by species).
  const key = (s: Support) => `${s.flags.join(",")}|${s.until ?? ""}`;
  const dedupe = (xs: Support[]) => { const m = new Map<string, Support>(); for (const s of xs) if (!m.has(key(s)) || fresh(s)) m.set(key(s), s); return [...m.values()]; };
  const pool = new Map<string, { ditto: Support[]; groups: Map<number, Map<string, Support[]>> }>();
  const poolOf = (g: string) => {
    let p = pool.get(g);
    if (!p) {
      p = { ditto: dedupe(store.supportsOf("132", g, [], undefined, undefined, true)), groups: new Map() };
      for (const f of store.at(g)) {
        const y = evo.species[f.form.number];
        if (!y || y.egg_groups.includes(15) || y.gender_rate < 0 || y.gender_rate === 8) continue;
        for (const e of y.egg_groups) {
          const bySp = p.groups.get(e) ?? p.groups.set(e, new Map()).get(e)!;
          bySp.set(f.form.number, dedupe([...(bySp.get(f.form.number) ?? []), ...f.supports]));
        }
      }
      pool.set(g, p);
    }
    return p;
  };
  /** Paths to a breeding partner in game g for species n: a Ditto, or a male-capable Pokémon of another species sharing an Egg Group. */
  const partners = (g: string, n: string): Support[] => {
    const sp = evo.species[n], p = poolOf(g);
    if (p.ditto.some((s) => !s.flags.length && s.until === undefined)) return p.ditto;   // nothing beats a free Ditto
    const out = [...p.ditto];
    if (sp.gender_rate > 0)                                // the egg is the mother's species: this one must be able to be female
      for (const e of sp.egg_groups) for (const [y, sups] of p.groups.get(e) ?? []) if (y !== n) out.push(...sups);
    return dedupe(out);
  };
  for (const fact of [...store.facts.values()]) {
    const g = fact.loc;
    if (NOT_GAMES.has(g)) continue;
    const n = +fact.form.number;
    // ---- evolve
    for (const [to, rows] of ix.byFrom.get(n) ?? []) {
      let cand = rows.filter((r) => {
        if (r.multiplayer) return false;
        if (r.from_form && !(r.from_form in FORM_NAME) && r.from_form !== evo.species[String(n)]?.default_form && r.to_form && r.to_form in FORM_NAME)
          return false;                                     // a special cosmetic form into a real one (Own Tempo Rockruff -> Dusk)
        return csvForm(ix, evo, n, r.from_form) === fact.form;
      });
      const regional = cand.filter((r) => r.region !== null && REGION_GAMES[r.region]?.includes(g));
      cand = regional.length ? regional : cand.filter((r) => r.region === null);
      const byTarget = new Map<Form, EvoRow[]>();
      for (const r of cand) {
        const t = csvForm(ix, evo, to, r.to_form);
        if (t) (byTarget.get(t) ?? byTarget.set(t, []).get(t)!).push(r);
      }
      for (const [target, trows] of byTarget) {
        if (!canHold(target, g)) continue;
        const m = evoMethod(trows, g);
        if (!m) continue;
        const extra = m === "trade" ? tradeFlags(o, g) : [];
        if (extra === null) continue;
        for (const sup of fact.supports) {
          if (!fresh(sup)) continue;
          const s: Support = { ...sup, flags: [...new Set([...sup.flags, ...extra])].sort(), via: [...sup.via, m === "trade" ? "EVO(trade)" : "EVO"] };
          if (store.add(target, g, fact.tags, false, s)) changed = true;
        }
      }
    }
    // ---- breed
    if (!BREEDING.has(FAMILY_OF[g])) continue;
    const sp = evo.species[String(n)];
    if (!sp || sp.egg === null) continue;
    let eggNo = sp.egg;
    if (INCENSE.has(eggNo) && !/B/.test(ix.rows.get(`${eggNo}|`)?.cells[g] ?? "")) eggNo = ix.firstChild.get(eggNo) ?? eggNo;
    const egg = ix.rows.get(`${eggNo}|${fact.form.form}`) ?? csvForm(ix, evo, eggNo, null);   // regional/East/West parents pass their form on
    if (!egg || !canHold(egg, g)) continue;
    const mates = partners(g, String(n));
    if (!mates.length) continue;
    // The egg's origin is this game whatever the parents' path, so only distinct (flags, end date) pairs matter.
    const parents = new Map<string, Support>();
    for (const sup of fact.supports) {
      const k = `${sup.flags.join(",")}|${sup.until ?? ""}`, x = parents.get(k);
      if (!x || sup.via.length < x.via.length || (fresh(sup) && !fresh(x) && sup.via.length === x.via.length)) parents.set(k, sup);
    }
    for (const sup of parents.values()) for (const d of mates) {
      if (!fresh(sup) && !fresh(d)) continue;
      const s: Support = { flags: [...new Set([...sup.flags, ...d.flags])].sort(), until: minUntil(sup.until, d.until),
                           origin: g, from: sup.source ?? sup.origin, via: [...sup.via, "BREED"] };
      if (store.add(egg, g, originTags(g), false, s)) changed = true;
    }
  }
  return changed;
}

export interface Result { store: Store; unhandled: Map<string, Unhandled>; passes: number; }

/** `evo`: Phase 2 arrival rules (evolve and breed after arrival). Without it, Phase 1 behaviour. */
export function run(forms: Form[], o: Owned, seeds: Seed[], evo?: EvoData): Result {
  const store = new Store();
  const legends = evo ? legendsOf(evo, forms) : new Set<string>();
  const locOwned = (l: string) =>
    STORAGE.has(l) ? o.has.bank : l === "HOME" ? o.has.home : l === "GO" ? goOn(o) : owns(o, l);
  let passes = 0, changed = true;
  while (changed) {
    changed = false; passes++; store.pass = passes;
    const fresh = (s: Support) => (s.born ?? 0) >= passes - 1;   // only paths new since the last pass can lead anywhere new
    for (const s of seeds) {
      if (!locOwned(s.at) || !s.req(o, store)) continue;
      const base: Support = { flags: [...s.flags].sort(), origin: s.origin ?? s.at, via: [], ...(s.source ? { source: s.source } : {}) };
      const sups = s.deps ? combine(base, s.deps.map((d) => store.supportsOf(d.number, d.loc, d.tags, d.origins, d.notOrigin, d.anyForm))) : [base];
      for (const sup of sups) if (store.add(s.form, s.at, s.tags, true, sup)) changed = true;
    }
    for (const r of ROUTES) {
      if (!r.req(o)) continue;
      for (const from of r.from) {
        if (!locOwned(from)) continue;
        for (const fact of [...store.at(from)]) {
          if (r.forms && !r.forms(fact.form)) continue;
          for (const to of r.to) {
            if (to === from || !locOwned(to)) continue;
            if (!NOT_GAMES.has(to) && !canHold(fact.form, to)) continue;
            const blocked = r.forbids?.(from, to) ?? [];
            if (fact.tags.some((t) => blocked.includes(t))) continue;
            const tags = r.retag ? r.retag(from, to, fact.tags, fact.form) : fact.tags;
            if (typeof tags === "string") {
              store.refuse({ number: fact.form.number, from, to, route: r.id, reason: tags }, fact.supports.map((x) => x.origin));
              continue;
            }
            for (const sup of fact.supports) {
              if (!fresh(sup)) continue;
              const once = r.legendsOnce?.(from) && legends.has(fact.form.number) ? ["ONCE_PER_SAVE"] : [];
              const s: Support = { flags: [...new Set([...sup.flags, ...(r.flags ?? []), ...once])].sort(), until: minUntil(sup.until, r.until),
                                   origin: sup.origin, from: sup.from, via: [...sup.via, r.id], ...(sup.source ? { source: sup.source } : {}) };   // `from`: a bred Pokémon keeps its parent's origin when it moves on
              if (store.add(fact.form, to, tags, false, s)) changed = true;
            }
          }
        }
      }
    }
    if (evo && arrivalStep(o, store, forms, evo, fresh)) changed = true;
    if (passes > 50) throw new Error("no fixed point after 50 passes");
  }
  return { store, unhandled: new Map(), passes };
}

/** Phase 1 answer: the games where each form is natively obtainable (the old engine's question). */
export function nativeGames(forms: Form[], store: Store): Map<string, string[]> {
  const out = new Map<string, string[]>(forms.map((f) => [f.id, []]));
  for (const fact of store.facts.values()) {
    if (!fact.native || NOT_GAMES.has(fact.loc)) continue;
    const l = out.get(fact.form.id)!;
    if (!l.includes(fact.loc)) l.push(fact.loc);
  }
  return out;
}

/** Q3 order: no end date first, then the later end date, then fewer flags, then fewer moves. */
export function bestFirst(a: Support, b: Support): number {
  if ((a.until === undefined) !== (b.until === undefined)) return a.until === undefined ? -1 : 1;
  if (a.until && b.until && a.until !== b.until) return Date.parse(b.until) - Date.parse(a.until);
  return a.flags.length - b.flags.length || a.via.length - b.via.length;
}

export interface Answer { reachable: boolean; onlyBefore: string | null; paths: Support[]; refused: Refusal[]; }

/** Phase 2 answer for one species at one location on one date: every kept path, best first, and the moves refused into it. */
export function reachableAt(store: Store, number: string, loc: string, date: string): Answer {
  const t = Date.parse(date);
  const paths: Support[] = [];
  for (const f of store.at(loc)) {
    if (f.form.number !== number) continue;            // species level: any form counts (G6)
    for (const s of f.supports) if (s.until === undefined || Date.parse(s.until) > t) paths.push(s);
  }
  paths.sort(bestFirst);
  const refused = [...store.refusals.values()].filter((r) => r.number === number && r.to === loc);
  if (!paths.length) return { reachable: false, onlyBefore: null, paths, refused };
  return { reachable: true, onlyBefore: paths[0].until ?? null, paths, refused };
}

/** The Phase 2 question: every species (optionally limited to some generations) at a destination on a date. */
export function destinationReport(forms: Form[], store: Store, loc: string, date: string, gens?: number[]) {
  const seen = new Set<string>(), rows: ({ number: string; name: string } & Answer)[] = [];
  for (const f of forms) {
    if (seen.has(f.number) || (gens && !gens.includes(f.gen))) continue;
    seen.add(f.number);
    rows.push({ number: f.number, name: f.name, ...reachableAt(store, f.number, loc, date) });
  }
  return rows;
}
