/** Site themes: how the result boxes look. Stored per viewer in this browser (localStorage).
 *  "PC boxes": every generation box gets its own biome, like the games' storage system; "Forest": every box is a forest. */
export const THEMES = [
  { id: "boxes", name: "PC boxes" },
  { id: "forest", name: "Forest" },
  { id: "plain", name: "Plain" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];
export const DEFAULT_THEME: ThemeId = "boxes";

/** Biomes drawn in themes.css (scripts/biomes.py), in box order. */
export const BIOMES = ["forest", "city", "desert", "savanna", "volcano", "snow", "cave", "seafloor", "sky"] as const;
const BIOME_NAME: Record<string, string> = { forest: "Forest", city: "City", desert: "Desert", savanna: "Savanna", volcano: "Volcano",
  snow: "Snow", cave: "Cave", seafloor: "Seafloor", sky: "Sky" };

export function biomeFor(theme: ThemeId, gen: number): string | undefined {
  return theme === "boxes" ? BIOMES[(gen - 1) % BIOMES.length] : theme === "forest" ? "forest" : undefined;
}
export const biomeName = (b?: string) => (b ? BIOME_NAME[b] : "");

export function loadTheme(): ThemeId {
  try {
    const t = localStorage.getItem("theme");
    if (THEMES.some((x) => x.id === t)) return t as ThemeId;
  } catch { /* storage blocked: use the default */ }
  return DEFAULT_THEME;
}
export function applyTheme(t: ThemeId) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("theme", t); } catch { /* not saved, still applied */ }
}
