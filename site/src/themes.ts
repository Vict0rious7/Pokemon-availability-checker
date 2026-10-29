/** Site themes: how the result boxes look. Stored per viewer in this browser (localStorage). */
export const THEMES = [
  { id: "forest", name: "Forest" },
  { id: "plain", name: "Plain" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];
export const DEFAULT_THEME: ThemeId = "forest";

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
