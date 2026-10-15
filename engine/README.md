# Availability engine (rebuild)

TypeScript implementation of the data model. Phase 1 answers the old engine's question ("in which owned games can each form be obtained") with the full model underneath: code rules, special sources, routes with tags and flags, and a fixed-point loop.

## Check the rebuild against the old engine

    cd engine
    npm ci
    npx tsx src/cli.ts ../reference/old-csv ../reference/results out
    python3 compare.py ../reference/results out --accepted accepted.json

The last line must read `0 unexplained difference(s)` (exit code 0). `accepted.json` ties each of the 51 known differences to a decision (C…, H11, U8, D1).

`../reference/old-csv` holds the old CSVs from commit 4f93c6a with one data fix (D1: the Ranch mark on plain Vulpix, not Alolan). Run on `../data` to see the refreshed data instead.

## Phase 2 destination tests

    npx tsx src/destinations.ts ../data ../reference/destinations.json

Runs the destination cases (D1–D13 and variants) on the refreshed data and must end with `19/19 pass` (about 7 s: two cases own everything). It checks reachability on the date, the "only before" end date, which routes the kept paths use, the best path's origin, refused moves, and which HOME rewards are offered. `VERBOSE=1` prints every kept path, best first.

To run the Phase 1 check with the real Emerald Hoenn dex (Q1) and the ONCE_PER_SAVE flags, add the data folder as a 4th argument: `npx tsx src/cli.ts ../reference/old-csv ../reference/results out ../data` (still `0 unexplained`).

If `tsx` complains about the esbuild platform (node_modules installed on macOS, run from Linux), compile with `tsc` instead: `node node_modules/typescript/bin/tsc -p . --noEmit false --outDir /tmp/build && node /tmp/build/destinations.js ../data ../reference/destinations.json`.

## Files

- `src/data.ts`: CSV parsing from a `Reader` (file name → text, no Node APIs, so the browser can use it); `canHold`
- `src/prepare.ts`: forms, seeds (code rules, HOME rewards and gifts, ONCE_PER_SAVE) and evolution data from a `Reader`; used by the destination tests and the site
- `src/node.ts`: Node only, `dirReader(dir)` reads the data folder
- `src/games.ts`: families, the user's input (`Owned`), adapter from the old engine's inputs
- `src/engine.ts`: seeds (code rules and special sources), routes (RT1–RT31, HOME and GO since Phase 2), origin tags and locks, fixed point, Phase 1 answer, `reachableAt` (Phase 2 answer, minimal)
- `src/cli.ts`: runs every reference profile and lists any code it cannot interpret
- `src/destinations.ts`: runs the Phase 2 destination cases in `../reference/destinations.json`
- Arrival rules (Phase 2, `run(..., evo)`): a Pokémon that reaches a game can evolve there (forms followed: regional, East/West, Basculin stripes; regional evolutions in their region's games; trades need the trade hardware, except the Linking Cord in Legends: Arceus) and be bred there with a Ditto or a male-capable partner sharing an Egg Group (incense babies only where the CSV codes the baby B). Data: `../data/evolution.json`. Off in the Phase 1 check.
- Legendaries and Mythicals moving BDSP → HOME or Switch FRLG → HOME carry ONCE_PER_SAVE (U4, RT19).
- `src/rewards.ts`: HOME gifts (`../data/home_gifts.csv`), HOME dex-completion rewards as seeds (from `../data/regional_dexes.json`), Emerald's Hoenn dex, ONCE_PER_SAVE groups (from `../data/once_per_save.csv`)
