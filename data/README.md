# Data

`gen1.csv` … `gen9.csv`: built on 15 Oct 2026 from Bulbapedia's *List of Pokémon by availability*, plus your own columns (Ranch, BattleRev, Ranger, JapBonusDisc, USBonusDisc, PALChannel) and your Blue column (= Bulbapedia's Green). New columns: `LegendsZA` everywhere, `FireRedSwitch`/`LeafGreenSwitch` in gen 1–3. Data fix D1: the Ranch gives Kanto Vulpix. Decisions: "CSV diff" tab of the rules catalogue.

`legend.csv`: unchanged. `tools/`: the scripts that parsed the page and built the files. `old_engine_on_new_data.diff.txt`: the old engine run on these files, against the reference results.
