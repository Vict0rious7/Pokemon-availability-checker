# Optimiser engine test ("Complete my collection"), 12 Nov 2026

Throwaway test of the design in the plan (Decisions, 12 Nov). Not used by the site.

- `items.ts`: purchasable items and their costs (Victor, 12 Nov). Item sets are bigint masks. `dnf()` turns any requirement predicate of the engine into its minimal shopping lists: the predicate is a black box; only the fields it reads matter.
- `sym.ts`: **fork of `engine.ts`**. The run has everything owned. Every path carries one shopping list (`need`). A path dominates another only if its list is a subset as well. Kept paths per (fact, origin) are capped at `BEAM`, cheapest first. Breeding mates and parents are reduced to non-dominated sets.
- `build.ts`: writes `spike-out/lists.json` (every location) and `spike-out/HOME.json`: minimal lists per species, with end date and flags.
- `check.ts`: random profiles; the species predicted from the lists must equal the real engine's answer (HOME, on 20 Nov 2026 and 1 Jun 2027).
- `opt.ts`: optimiser. It adds prerequisites (console per game, Wii, GameCube, cables and HOME Premium from flags), then runs a greedy ladder (best gain per cost, bundles allowed) and drops unneeded items. The real engine checks the final plan.

Run from `engine/` (compiled, faster than tsx):

    npx tsc -p . --noEmit false --outDir /tmp/b
    BEAM=8 node --max-old-space-size=4000 /tmp/b/spike/build.js
    BEAM=8 N=30 node --max-old-space-size=4000 /tmp/b/spike/check.js
    node /tmp/b/spike/opt.js

## Results (cloud machine, slower than Victor's Mac)

| | Beam 4 | Beam 8 |
|---|---|---|
| Shopping-list run (everything owned) | 49 s, 540 MB | 108–113 s, 820 MB |
| Minimal lists, HOME | 16,223 | 20,993 |
| Minimal lists, every location | 145,868 | 190,122 |
| File size, gzip (HOME / every location) | — | 26 KB / 263 KB |
| Prediction = real engine (random profiles) | 31/32 (missed Phione: two 3DS instead of DS + 3DS, dropped by the beam) | 60/60 |
| Optimiser on a profile, including one real engine run | — | 0.35–1.1 s |

The lists are sound: every list is a real derivation, so the beam can only miss options and never invents one. The real engine reached 100% of each plan in the demo profiles.

Never obtainable at HOME (no list with everything owned): Zarude, Walking Wake, Iron Leaves.
