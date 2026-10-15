# Availability engine (rebuild)

TypeScript implementation of the data model. Phase 1 answers the old engine's question ("in which owned games can each form be obtained") with the full model underneath: code rules, special sources, routes with tags and flags, and a fixed-point loop.

## Check the rebuild against the old engine

    cd engine
    npm ci
    npx tsx src/cli.ts ../reference/old-csv ../reference/results out
    python3 compare.py ../reference/results out --accepted accepted.json

The last line must read `0 unexplained difference(s)` (exit code 0). `accepted.json` ties each of the 51 known differences to a decision (C…, H11, U8, D1).

`../reference/old-csv` holds the old CSVs from commit 4f93c6a with one data fix (D1: the Ranch mark on plain Vulpix, not Alolan). Run on `../data` to see the refreshed data instead.

## Files

- `src/data.ts`: CSV loading; `canHold`
- `src/games.ts`: families, the user's input (`Owned`), adapter from the old engine's inputs
- `src/engine.ts`: seeds (code rules and special sources), routes, fixed point, Phase 1 answer
- `src/cli.ts`: runs every reference profile and lists any code it cannot interpret
