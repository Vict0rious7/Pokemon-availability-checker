import { Form, canHold } from "./data.js";
import { FAMILY, FAMILY_OF, CORE_GAMES, OTHER_VERSION, Owned, owns, ownsAny, ownsDlc, dsFamily, partner } from "./games.js";

const BANK_ENDS = "2027-02-25T19:00-08:00";

export interface Fact { form: Form; loc: string; tags: string[]; native: boolean; supports: Support[]; }
export interface Support { flags: string[]; until?: string; }

/** Fact store: "form F can be in location L with tags T" (data model, section 3). */
export class Store {
  facts = new Map<string, Fact>();
  private byLoc = new Map<string, Fact[]>();
  key(f: Form, loc: string, tags: string[]) { return `${f.id}@${loc}#${tags.join(",")}`; }
  /** Returns true when something new was learned (a new fact, nativeness, or a non-dominated path). */
  add(form: Form, loc: string, tags: string[], native: boolean, s: Support): boolean {
    tags = [...new Set(tags)].sort();
    const k = this.key(form, loc, tags);
    let f = this.facts.get(k);
    if (!f) {
      f = { form, loc, tags, native, supports: [s] };
      this.facts.set(k, f);
      (this.byLoc.get(loc) ?? this.byLoc.set(loc, []).get(loc)!).push(f);
      return true;
    }
    let changed = false;
    if (native && !f.native) { f.native = true; changed = true; }
    if (!f.supports.some((x) => dominates(x, s))) {
      f.supports = f.supports.filter((x) => !dominates(s, x)).concat([s]);
      changed = true;
    }
    return changed;
  }
  /** Any fact for this form number (base form) at loc carrying all `tags`. */
  has(number: string, loc: string, tags: string[] = []): boolean {
    return (this.byLoc.get(loc) ?? []).some((f) => f.form.number === number && f.form.form === "" && tags.every((t) => f.tags.includes(t)));
  }
  at(loc: string) { return this.byLoc.get(loc) ?? []; }
}
const later = (a?: string, b?: string) => (a === undefined ? true : b === undefined ? false : a >= b);
function dominates(a: Support, b: Support): boolean {
  return a.flags.every((x) => b.flags.includes(x)) && later(a.until, b.until);
}
const minUntil = (a?: string, b?: string) => (a === undefined ? b : b === undefined ? a : a < b ? a : b);

// ---------------------------------------------------------------- seeds (code rules + special sources)

export interface Seed {
  form: Form; at: string; tags: string[]; flags: string[];
  req: (o: Owned, s: Store) => boolean;
  why: string;
}

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

export function buildSeeds(forms: Form[], unhandled: Map<string, Unhandled>): Seed[] {
  const seeds: Seed[] = [];
  const add = (form: Form, at: string, req: Seed["req"], why: string, flags: string[] = [], tags: string[] = []) =>
    seeds.push({ form, at, req, why, flags, tags });
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
        add(f, game, (o, s) => self(o) && party.needs.every((n) => s.has(n, game)), `party unlock ${party.needs.join("+")}`);
        continue;
      }
      if (f.number === "384" && HGSS_RAYQUAZA.games.includes(game)) {
        add(f, game, (o, s) => self(o) && HGSS_RAYQUAZA.needs.every((n) => s.has(n, game, HGSS_RAYQUAZA.tags)), "Embedded Tower Kyogre + Groudon (C20)");
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
        add(f, game, (o) => self(o) && ["Ruby", "Sapphire", "XD"].filter((g) => owns(o, g)).length >= 2, "Hoenn dex: two of Ruby, Sapphire, XD (shortcut until Q1 data)");
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
      if (c === "ET") { addTradeEvolution(f, game, dlc, add); continue; }
      if (c === "DR" || c === "DRE" || c === "DRET") {
        const tags = ["641", "642", "645"].includes(f.number) ? ["dr_therian"] : [];
        add(f, game, (o) => self(o) && has(o).dreamRadar && o.n3ds >= 1 && (c !== "DRET" || (partner(o, game, FAMILY.gen5) && dsFamily(o) >= 2)), "Dream Radar", [], tags);
        continue;
      }
      if (c === "PW" || c === "PWE") { add(f, game, (o) => self(o) && has(o).pokewalker, "Pokéwalker"); continue; }
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
    const deliver = (targets: readonly string[], req: (o: Owned) => boolean, why: string, flags: string[] = []) => {
      for (const g of targets) if (canHold(f, g)) add(f, g, (o) => owns(o, g) && req(o), why, flags);
    };
    const yes = (v?: string) => v !== undefined && v !== "" && !IGNORED.test(v);
    if (yes(c.Ranch)) {
      deliver(["Diamond", "Pearl"], (o) => has(o).ranchWestern || has(o).ranchJapanese, "My Pokémon Ranch");
      deliver(["Platinum"], (o) => has(o).ranchJapanese, "My Pokémon Ranch (Japanese)");
    }
    if (yes(c.BattleRev)) {
      const western = f.gen === 4;   // Electivire, Magmortar: Western only; Pikachu: any language (Q16)
      deliver(FAMILY.gen4, (o) => has(o).battleRevWestern || (!western && has(o).battleRevJapanese), "Battle Revolution");
    }
    if (yes(c.Ranger)) deliver(FAMILY.gen4, (o) => has(o).ranger, "Pokémon Ranger", ["ONCE_PER_CARTRIDGE", "SAVE_WIPE"]);
    if (yes(c.JapBonusDisc)) deliver(FAMILY.gba3, (o) => has(o).bonusDiscJP && owns(o, "Colosseum"), "Japanese bonus disc (C11)", ["CABLE_GC_GBA", "REGION_LOCK"]);
    if (yes(c.USBonusDisc)) deliver(["Ruby", "Sapphire"], (o) => has(o).bonusDiscUS, "US bonus disc", ["CABLE_GC_GBA", "REGION_LOCK", "ONCE_PER_SAVE"]);
    if (yes(c.PALChannel)) deliver(["Ruby", "Sapphire"], (o) => has(o).palChannel, "PAL Pokémon Channel", ["CABLE_GC_GBA", "ONCE_PER_SAVE"]);
  }
  return seeds;
}

function addTradeEvolution(f: Form, game: string, dlc: boolean, add: (f: Form, at: string, req: Seed["req"], why: string, flags?: string[]) => void) {
  const fam = FAMILY_OF[game];
  const self = (o: Owned) => (dlc ? ownsDlc(o, game) : owns(o, game));
  switch (fam) {
    case "vc1": add(f, game, (o) => self(o) && partner(o, game, [...FAMILY.vc1, ...FAMILY.vc2]) && o.n3ds >= 2, "trade evolution", ["DIFFERENT_NNID"]); return;
    case "vc2": add(f, game, (o) => self(o) && partner(o, game, FAMILY.vc2) && o.n3ds >= 2, "trade evolution", ["DIFFERENT_NNID"]); return;
    case "gba3":
      add(f, game, (o) => self(o) && partner(o, game, FAMILY.gba3) && o.gba >= 2, "trade evolution", ["CABLE_GBA_LINK"]);
      add(f, game, (o) => self(o) && ownsAny(o, FAMILY.gc) && o.gba >= 1, "trade evolution via Colosseum/XD (C27)", ["CABLE_GC_GBA"]);
      return;
    case "gc": add(f, game, (o) => self(o) && ownsAny(o, FAMILY.gba3) && o.gba >= 1, "trade evolution via a GBA game", ["CABLE_GC_GBA"]); return;
    case "gen4": add(f, game, (o) => self(o) && partner(o, game, FAMILY.gen4) && dsFamily(o) >= 2, "trade evolution"); return;
    case "gen5": add(f, game, (o) => self(o) && partner(o, game, FAMILY.gen5) && dsFamily(o) >= 2, "trade evolution"); return;
    case "gen6": add(f, game, (o) => self(o) && partner(o, game, FAMILY.gen6) && o.n3ds >= 2, "trade evolution"); return;
    case "gen7": add(f, game, (o) => self(o) && partner(o, game, FAMILY.gen7) && o.n3ds >= 2, "trade evolution"); return;
    case "lgpe": case "bdsp": case "swsh": case "sv":
      add(f, game, (o) => self(o) && partner(o, game, FAMILY[fam]) && o.sw >= 2, "trade evolution"); return;
  }
}

// ---------------------------------------------------------------- routes (Routes tab)

interface Route {
  id: string; from: readonly string[]; to: readonly string[];
  req: (o: Owned) => boolean; flags?: string[]; until?: string;
  forms?: (f: Form) => boolean;
  forbids?: (from: string, to: string) => string[];
}
const STORAGE = new Set(["bank_g6", "bank_g7"]);
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
  ...(["lgpe", "swsh", "bdsp", "sv"] as const).map((fam) => within("RT31", FAMILY[fam], (o) => o.sw >= 2)),
];

// ---------------------------------------------------------------- run

export interface Result { store: Store; unhandled: Map<string, Unhandled>; passes: number; }

export function run(forms: Form[], o: Owned, seeds: Seed[]): Result {
  const store = new Store();
  const locOwned = (l: string) => (STORAGE.has(l) ? o.has.bank : owns(o, l));
  let passes = 0, changed = true;
  while (changed) {
    changed = false; passes++;
    for (const s of seeds) {
      if (!locOwned(s.at) || !s.req(o, store)) continue;
      if (store.add(s.form, s.at, s.tags, true, { flags: s.flags })) changed = true;
    }
    for (const r of ROUTES) {
      if (!r.req(o)) continue;
      for (const from of r.from) {
        if (!locOwned(from)) continue;
        for (const fact of [...store.at(from)]) {
          if (r.forms && !r.forms(fact.form)) continue;
          for (const to of r.to) {
            if (to === from || !locOwned(to)) continue;
            if (!STORAGE.has(to) && !canHold(fact.form, to)) continue;
            const blocked = r.forbids?.(from, to) ?? [];
            if (fact.tags.some((t) => blocked.includes(t))) continue;
            for (const sup of fact.supports) {
              const s: Support = { flags: [...new Set([...sup.flags, ...(r.flags ?? [])])].sort(), until: minUntil(sup.until, r.until) };
              if (store.add(fact.form, to, fact.tags, false, s)) changed = true;
            }
          }
        }
      }
    }
    if (passes > 50) throw new Error("no fixed point after 50 passes");
  }
  return { store, unhandled: new Map(), passes };
}

/** Phase 1 answer: the games where each form is natively obtainable (the old engine's question). */
export function nativeGames(forms: Form[], store: Store): Map<string, string[]> {
  const out = new Map<string, string[]>(forms.map((f) => [f.id, []]));
  for (const fact of store.facts.values()) {
    if (!fact.native || STORAGE.has(fact.loc)) continue;
    const l = out.get(fact.form.id)!;
    if (!l.includes(fact.loc)) l.push(fact.loc);
  }
  return out;
}
