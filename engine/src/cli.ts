import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadForms } from "./data.js";
import { fromOldInputs } from "./games.js";
import { buildSeeds, run, nativeGames, Unhandled } from "./engine.js";
import { loadDexes, emeraldHoenn, loadOncePerSave } from "./rewards.js";
import { dirReader } from "./node.js";

// usage: tsx src/cli.ts <csv dir> <reference results dir> <out dir> [dex dir]
// With a dex dir (holding regional_dexes.json), Emerald's Johto prize uses the real Hoenn dex (Q1) instead of the Phase 1 shortcut.
const [dataDir, refDir, outDir, dexDir] = process.argv.slice(2);
const forms = loadForms(dirReader(dataDir));
const unhandled = new Map<string, Unhandled>();
const dexes = dexDir ? loadDexes(dirReader(dexDir)) : null;
const seeds = buildSeeds(forms, unhandled, dexes ? emeraldHoenn(dexes) : undefined, loadOncePerSave(dirReader(dexDir ?? dataDir)));
mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(refDir).filter((f) => f.endsWith(".json")).sort()) {
  const ref = JSON.parse(readFileSync(join(refDir, file), "utf8"));
  const owned = fromOldInputs(ref.profile.inputs);
  const t = Date.now();
  const { store, passes } = run(forms, owned, seeds);
  const games = nativeGames(forms, store);
  const available = [], unavailable = [];
  for (const f of forms) {
    const name = f.form ? `${f.name} (${f.form})` : f.name;
    const g = games.get(f.id)!;
    if (g.length) available.push({ number: f.number, name, games: g });
    else unavailable.push({ number: f.number, name });
  }
  writeFileSync(join(outDir, file), JSON.stringify({ engine: "rebuild", profile: ref.profile, counts: { available: available.length, unavailable: unavailable.length }, available, unavailable }, null, 1));
  console.log(`${ref.profile.id}: ${available.length} available, ${unavailable.length} unavailable, ${store.facts.size} facts, ${passes} passes, ${Date.now() - t} ms`);
}
console.log(`\nunhandled codes (counted once per cell, never credited):`);
for (const u of [...unhandled.values()].sort((a, b) => b.forms.length - a.forms.length))
  console.log(`  ${u.game} ${u.code}: ${u.forms.length}  e.g. ${u.forms.slice(0, 4).join(", ")}`);
