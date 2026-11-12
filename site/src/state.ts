import type { Owned } from "../../engine/src/games.js";
import { GAMES, GAME, HARDWARE, SERVICES, ITEM_HW, ITEM_SERVICE } from "./labels.js";
import { maskOf, bit, names as itemIds } from "../../engine/src/items.js";

/** Everything the user picks. Saved in the URL hash so a profile can be bookmarked and shared. */
export interface Profile {
  copies: Record<string, number>;   // game key -> 0..2
  dlc: Record<string, number>;      // game key -> 0..copies
  hw: Record<string, number>;       // HARDWARE key -> count
  services: Record<string, boolean>;
  dest: string;                     // "HOME" or a game key
  maxGen: number;                   // scope: Gens 1..maxGen
}

export const MAX_GEN = 9;
export const empty = (): Profile => ({ copies: {}, dlc: {}, hw: {}, services: {}, dest: "HOME", maxGen: MAX_GEN });
/** First visit (no profile in the URL): the default destination is HOME, so HOME is ticked. */
export const starting = (): Profile => ({ ...empty(), services: { home: true } });

/** Choosing where the collection lives implies owning that place: HOME gets ticked, a game gets one copy. */
export function withDest(p: Profile, dest: string): Profile {
  if (dest === "HOME") return { ...p, dest, services: { ...p.services, home: true } };
  return { ...p, dest, copies: { ...p.copies, [dest]: Math.max(1, p.copies[dest] ?? 0) } };
}

export function toOwned(p: Profile): Owned {
  const copies: Record<string, number> = {}, dlc: Record<string, number> = {};
  for (const g of GAMES) {
    const c = p.copies[g.key] ?? 0;
    if (c > 0) copies[g.key] = c;
    const d = Math.min(c, p.dlc[g.key] ?? 0);
    if (g.dlc && d > 0) dlc[g.key] = d;
  }
  const hw = (k: string) => p.hw[k] ?? 0;
  const has = Object.fromEntries(SERVICES.filter((s) => !("planOnly" in s)).map((s) => [s.key, !!p.services[s.key]])) as Owned["has"];
  return { copies, dlc, gba: hw("gba"), ds: hw("ds"), dsGbaSlot: Math.min(hw("dsGbaSlot"), hw("ds")), n3ds: hw("n3ds"), sw: hw("sw"), phone: hw("phone"), has };
}

// ---- URL: #g=Sw2d1.Sc.LA&hw=3ds1.sw2.ph1&s=home.bank&to=HOME&gen=9
const BY_CODE = Object.fromEntries(GAMES.map((g) => [g.code, g.key]));

export function encode(p: Profile): string {
  const q = new URLSearchParams();
  const g = GAMES.filter((x) => (p.copies[x.key] ?? 0) > 0).map((x) => {
    const c = p.copies[x.key], d = x.dlc ? Math.min(c, p.dlc[x.key] ?? 0) : 0;
    return `${x.code}${c > 1 ? c : ""}${d ? `d${d}` : ""}`;
  });
  if (g.length) q.set("g", g.join("."));
  const hw = HARDWARE.filter((h) => (p.hw[h.key] ?? 0) > 0).map((h) => `${h.code}${p.hw[h.key]}`);
  if (hw.length) q.set("hw", hw.join("."));
  const s = SERVICES.filter((x) => p.services[x.key]).map((x) => x.code);
  if (s.length) q.set("s", s.join("."));
  q.set("to", p.dest === "HOME" ? "HOME" : GAME[p.dest]?.code ?? "HOME");
  q.set("gen", String(p.maxGen));
  return q.toString().replace(/%2C/g, ",");
}

export function decode(hash: string): Profile {
  const p = empty();
  const q = new URLSearchParams(hash.replace(/^#/, ""));
  for (const tok of (q.get("g") ?? "").split(".").filter(Boolean)) {
    const m = tok.match(/^([A-Za-z]+?)(\d)?(?:d(\d))?$/);
    const key = m && BY_CODE[m[1]];
    if (!key) continue;
    const c = Math.min(2, Math.max(1, Number(m![2] ?? 1)));
    p.copies[key] = c;
    if (m![3]) p.dlc[key] = Math.min(c, Number(m![3]));
  }
  for (const tok of (q.get("hw") ?? "").split(".").filter(Boolean)) {
    const m = tok.match(/^([a-z0-9]+?)(\d)$/);
    const h = m && HARDWARE.find((x) => x.code === m[1]);
    if (h) p.hw[h.key] = Math.min(h.max, Number(m![2]));
  }
  for (const code of (q.get("s") ?? "").split(".")) {
    const s = SERVICES.find((x) => x.code === code);
    if (s) p.services[s.key] = true;
  }
  const to = q.get("to");
  if (to && to !== "HOME" && BY_CODE[to]) p.dest = BY_CODE[to];
  const gen = Number(q.get("gen"));
  if (gen >= 1 && gen <= MAX_GEN) p.maxGen = Math.floor(gen);
  return p;
}

/** The profile as items of "What to get next" (engine/src/items.ts), including what only the planner reads. */
export function toItems(p: Profile): bigint {
  let m = maskOf(toOwned(p));
  for (const [id, [k, n]] of Object.entries(ITEM_HW)) if ((p.hw[k] ?? 0) >= n) m |= bit(id);
  if (!((p.hw.ds ?? 0) >= 1)) m &= ~bit("slot");
  for (const [id, k] of Object.entries(ITEM_SERVICE)) if (p.services[k]) m |= bit(id);
  return m;
}

/** Adds items (engine/src/items.ts ids) to the profile: "I have these now". */
export function withItems(p: Profile, ids: string[]): Profile {
  const copies = { ...p.copies }, dlc = { ...p.dlc }, hw = { ...p.hw }, services = { ...p.services };
  for (const id of ids) {
    const m = id.match(/^(copy|dlc)([12]):(.*)$/);
    if (m) {
      const n = Number(m[2]);
      if (m[1] === "copy") copies[m[3]] = Math.max(copies[m[3]] ?? 0, n);
      else { copies[m[3]] = Math.max(copies[m[3]] ?? 0, n); dlc[m[3]] = Math.max(dlc[m[3]] ?? 0, n); }
    } else if (ITEM_HW[id]) { const [k, n] = ITEM_HW[id]; hw[k] = Math.max(hw[k] ?? 0, n); if (k === "dsGbaSlot") hw.ds = Math.max(hw.ds ?? 0, 1); }
    else if (ITEM_SERVICE[id]) services[ITEM_SERVICE[id]] = true;
  }
  return { ...p, copies, dlc, hw, services };
}
export { itemIds };
