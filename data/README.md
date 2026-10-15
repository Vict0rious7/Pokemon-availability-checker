# Data

`gen1.csv` … `gen9.csv`: built on 15 Oct 2026 from Bulbapedia's *List of Pokémon by availability*, plus your own columns (Ranch, BattleRev, Ranger, JapBonusDisc, USBonusDisc, PALChannel) and your Blue column (= Bulbapedia's Green). New columns: `LegendsZA` everywhere, `FireRedSwitch`/`LeafGreenSwitch` in gen 1–3. Data fix D1: the Ranch gives Kanto Vulpix. Decisions: "CSV diff" tab of the rules catalogue.

`legend.csv`: unchanged. `tools/`: the scripts that parsed the page and built the files. `old_engine_on_new_data.diff.txt`: the old engine run on these files, against the reference results.

## Phase 2 inputs (15 Oct 2026, LF line endings)

`once_per_save.csv` (U9): 53 groups from Bulbapedia's *List of mutually exclusive Pokémon* (rev 4593282). Columns: `games` uses this folder's column names; `members` is pipe-separated, forms as `Name (X Form)`; `kind` = `choice` (player picks one), `stages` (no breeding, one stage of a line at a time), `choice+stages`, `single_item` (one evolution stone), `determined` (fixed by an earlier choice, Trainer ID, gender or TV answer; see `determined_by`).
- FRLG for Switch is not on the page; OPS17–19 apply the GBA groups to it (C21, unverified).
- Not on the page at all: Let's Go, BDSP, Legends: Arceus, Colosseum, Switch FRLG. Single one-time gifts and static encounters (Type: Null, Kubfu, most legendaries) are also outside this page's scope.

`home_rewards.csv` (U12): 8 rewards, from *Pokédex (HOME)* (rev 4643615) and the game-based distribution lists for Gen VII/VIII/IX (revs 4522159, 4612383, 4643600). Seven regional-dex rewards plus Original Color Magearna (National 0001–0890). No end dates are listed for any of them.
- Celebi (Kanto GBA dex) counts only FireRed/LeafGreen **for Switch**; the dex can be completed by syncing that game's Pokédex, without sending Pokémon.
- Three rewards need several dexes: Meloetta (Paldea + Kitakami + Blueberry), Keldeo (Galar + IoA + CT), Volcanion (Lumiose + Hyperspace + Mega Evolution).
- Machine-readable requirements are in `regional_dexes.json` (below).

`regional_dexes.json`: species lists (national numbers, regional order) for Kanto, Hoenn (RSE), Sinnoh (DP/BDSP), Hisui, Galar, Isle of Armor, Crown Tundra, Paldea, Kitakami, Blueberry, Lumiose, Hyperspace, the Mega Evolution dex (species level) and National 1–890, each with its Bulbapedia revision; plus each reward's dexes, origin games and exclusions. Counts after exclusions match HOME's stated totals (150, 242, 400, 210, 210, 400, 200, 240, 230, 131). Approximations are listed in its `_notes`.

`evolution.json`: evolutions (with the PokeAPI version group where each method starts, and whether it is a trade, multiplayer-only or form-specific) and the egg each species hatches (null: cannot breed; incense babies left out). Built by `tools/build_evolution.py` from PokeAPI's CSV dump (master, 15 Oct 2026). Used by the arrival rules.

`one_time_evolving.csv` (second half of ONCE_PER_SAVE, Victor 15 Oct): one-time Pokémon that can evolve, per game: received once (code R/RD), evolutions only by evolving it (E/ED), and no member of the line can be bred there. 53 rows, built by `tools/build_one_time.py` from the CSVs and `evolution.json`. Reviewed 15 Oct: Yellow Vulpix (Game Corner) and Z-A fossils (Stone Emporium) are repeatable and left out; Let's Go fossils stay (no breeding).

`home_gifts.csv` (rest of U12): Pokémon HOME gives without a Pokédex condition, still available on 15 Oct 2026 (Bulbapedia, game-based distributions in Generations VII–IX, revs 4522159, 4612383, 4643600). Left out: Eevee (first Wonder Box trade) and Rotom (first GTS trade) need other players (C22); time-limited or in-person events (Shiny Zeraora 2020, Gigantamax Bulbasaur/Squirtle 2021, Bank Oranguru/Passimian 2019, 2026 Japan Championships Garchomp, Pokémon Center birthday Fidough/Tandemaus) are over or out of scope.
