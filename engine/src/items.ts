// "Complete my collection" (12 Nov 2026): purchasable items, item sets as bigint masks, and the DNF of a requirement predicate.
import { CORE_GAMES, FAMILY_OF, Owned } from "./games.js";

export interface Item { id: string; cost: number; }
export const ITEMS: Item[] = [];
const IDX = new Map<string, number>();
const reg = (id: string, cost: number) => { IDX.set(id, ITEMS.length); ITEMS.push({ id, cost }); };

// Victor, 12 Nov 2026
const GAME_COST = (g: string): number => {
  const f = FAMILY_OF[g];
  if (f === "vc1" || f === "vc2") return 0;
  if (g === "Ruby" || g === "Sapphire") return 65;
  if (f === "gba3") return 100;
  if (f === "gen4" || f === "gen5") return 55;
  if (f === "gen6" || f === "gen7") return 40;
  if (g === "Colosseum") return 95;
  if (g === "XD") return 165;
  return 35;   // Switch games
};
const DLC = ["Sword", "Shield", "Scarlet", "Violet", "LegendsZA"];
for (const g of CORE_GAMES) { reg(`copy1:${g}`, GAME_COST(g)); reg(`copy2:${g}`, GAME_COST(g)); }
for (const g of DLC) { reg(`dlc1:${g}`, 30); reg(`dlc2:${g}`, 30); }
// ds1 + slot = a DS or DS Lite (GBA slot); ds1 alone = a DSi. A phone is assumed owned by everyone (cost 0).
for (const [id, c] of [["gba1", 100], ["gba2", 100], ["ds1", 100], ["ds2", 100], ["slot", 0], ["n3ds1", 120], ["n3ds2", 120], ["sw1", 120], ["sw2", 120], ["phone", 0],
  ["home", 0], ["go", 0], ["bank", 0], ["transporter", 0], ["pokewalker", 60], ["dreamRadar", 0], ["ranchW", 0], ["ranchJ", 0], ["battleRevW", 15], ["battleRevJ", 15],
  ["ranger", 50], ["bonusUS", 150], ["bonusJP", 150], ["palChannel", 150],
  // not read by the engine: prerequisites and flags of the cost model (optimise.ts)
  ["gc", 65], ["wiiGC", 40], ["wii", 40], ["linkCable", 20], ["gcCable", 20], ["homePremium", 5]] as const) reg(id, c);

export const bit = (id: string): bigint => { const i = IDX.get(id); if (i === undefined) throw new Error(`no item ${id}`); return 1n << BigInt(i); };
export const FULL = (1n << BigInt(ITEMS.length)) - 1n;
export const has = (m: bigint, id: string) => (m & bit(id)) !== 0n;
export const bits = (m: bigint): number[] => { const out: number[] = []; for (let i = 0; m; i++, m >>= 1n) if (m & 1n) out.push(i); return out; };
export const names = (m: bigint) => bits(m).map((i) => ITEMS[i].id);
const COST = new Map<bigint, number>();
export const costOf = (m: bigint) => { let c = COST.get(m); if (c === undefined) { c = bits(m).reduce((n, i) => n + ITEMS[i].cost, 0); COST.set(m, c); } return c; };
export const subset = (a: bigint, b: bigint) => (a & ~b) === 0n;

const HAS_ITEM: Record<keyof Owned["has"], string> = {
  home: "home", go: "go", bank: "bank", transporter: "transporter", pokewalker: "pokewalker", dreamRadar: "dreamRadar",
  ranchWestern: "ranchW", ranchJapanese: "ranchJ", battleRevWestern: "battleRevW", battleRevJapanese: "battleRevJ",
  ranger: "ranger", bonusDiscUS: "bonusUS", bonusDiscJP: "bonusJP", palChannel: "palChannel",
};

/** The Owned of an item set. Every field read is recorded in `read` (as the items it depends on). */
export function ownedOf(m: bigint, read?: { r: bigint }): Owned {
  const rec = (x: bigint) => { if (read) read.r |= x; };
  const count = (a: string, b: string) => { rec(bit(a) | bit(b)); return has(m, a) ? (has(m, b) ? 2 : 1) : 0; };
  const games = (pre: string) => new Proxy({}, {
    get: (_t, k) => (typeof k === "string" && IDX.has(`${pre}1:${k}`) ? count(`${pre}1:${k}`, `${pre}2:${k}`) : undefined),
  }) as Record<string, number>;
  const hasP = new Proxy({}, { get: (_t, k) => { const id = HAS_ITEM[k as keyof Owned["has"]]; if (!id) return undefined; rec(bit(id)); return has(m, id); } }) as Owned["has"];
  return {
    copies: games("copy"), dlc: games("dlc"),
    get gba() { return count("gba1", "gba2"); },
    get ds() { return count("ds1", "ds2"); },
    get dsGbaSlot() { rec(bit("ds1") | bit("slot")); return has(m, "ds1") && has(m, "slot") ? 1 : 0; },
    get n3ds() { return count("n3ds1", "n3ds2"); },
    get sw() { return count("sw1", "sw2"); },
    get phone() { rec(bit("phone")); return has(m, "phone") ? 1 : 0; },
    has: hasP,
  } as Owned;
}

/** Converts an item set to the input the engine takes. */
export function ownedPlain(m: bigint): Owned {
  const o = ownedOf(m);
  const copies: Record<string, number> = {}, dlc: Record<string, number> = {};
  for (const g of CORE_GAMES) { if (o.copies[g]) copies[g] = o.copies[g]; }
  for (const g of DLC) { if (o.dlc[g]) dlc[g] = o.dlc[g]; }
  const h = Object.fromEntries(Object.keys(HAS_ITEM).map((k) => [k, o.has[k as keyof Owned["has"]]])) as Owned["has"];
  return { copies, dlc, gba: o.gba, ds: o.ds, dsGbaSlot: o.dsGbaSlot, n3ds: o.n3ds, sw: o.sw, phone: o.phone, has: h };
}

/** Minimal item sets that make a monotone predicate true (its DNF). Black box: the evaluation trace depends only on the
 *  fields read, so the items not read can be dropped; each minimal set is found by shrinking, others by forbidding one of its items. */
export function dnf(pred: (o: Owned) => boolean, within: bigint = FULL): bigint[] {
  const ev = (m: bigint) => { const read = { r: 0n }; const v = pred(ownedOf(m, read)); return { v, read: read.r }; };
  const found: bigint[] = [];
  const seen = new Set<bigint>();
  const rec = (forbid: bigint) => {
    if (seen.has(forbid)) return; seen.add(forbid);
    if (seen.size > 20000) throw new Error("dnf: too many branches");
    let h = within & ~forbid;
    let t = ev(h); if (!t.v) return;
    h &= t.read;
    for (const b of bits(h)) {
      const bb = 1n << BigInt(b);
      if (!(h & bb)) continue;
      const t2 = ev(h & ~bb);
      if (t2.v) h = h & ~bb & t2.read;
    }
    if (!found.some((f) => subset(f, h))) { for (let i = found.length - 1; i >= 0; i--) if (subset(h, found[i])) found.splice(i, 1); found.push(h); }
    for (const b of bits(h)) rec(forbid | (1n << BigInt(b)));
  };
  rec(0n);
  return found;
}

/** Product of two DNFs, kept minimal. */
export function andDnf(a: bigint[], b: bigint[]): bigint[] {
  const out: bigint[] = [];
  for (const x of a) for (const y of b) {
    const z = x | y;
    if (out.some((f) => subset(f, z))) continue;
    for (let i = out.length - 1; i >= 0; i--) if (subset(z, out[i])) out.splice(i, 1);
    out.push(z);
  }
  return out;
}

/** The item set of an engine input (the cost-model items that Owned does not carry are added by the caller). */
export function maskOf(o: Owned): bigint {
  let m = 0n;
  const n = (a: string, b: string, k: number) => { if (k >= 1) m |= bit(a); if (k >= 2) m |= bit(b); };
  for (const g of CORE_GAMES) { const k = o.copies[g] ?? 0; n(`copy1:${g}`, `copy2:${g}`, k); }
  for (const g of DLC) { const k = o.dlc[g] ?? 0; n(`dlc1:${g}`, `dlc2:${g}`, k); }
  n("gba1", "gba2", o.gba); n("ds1", "ds2", o.ds); n("n3ds1", "n3ds2", o.n3ds); n("sw1", "sw2", o.sw);
  if (o.dsGbaSlot >= 1) m |= bit("slot");
  if (o.phone >= 1) m |= bit("phone");
  for (const [k, id] of Object.entries(HAS_ITEM)) if (o.has[k as keyof Owned["has"]]) m |= bit(id);
  return m;
}
