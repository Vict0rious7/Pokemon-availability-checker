# Pokémon availability checker

Pokémon Bank and Poké Transporter close on **25 February 2027**. After that, Pokémon from the DS and 3DS games can no longer reach Pokémon HOME.

Enter the games, consoles and services you own, where your collection will live (Pokémon HOME or one game) and which generations count. The checker shows which Pokémon you can bring there, and which ones you can bring only if you move them before Bank closes.

**Open the checker: https://vict0rious7.github.io/Pokemon-availability-checker/**

## Features

- **Every game from Red to Legends: Z-A** (including the Mega Dimension DLC and FireRed/LeafGreen on Switch), with copies, DLC, consoles, Pokémon HOME, Bank, GO and side games such as My Pokémon Ranch, Pokéwalker and Dream Radar.
- **Paths, not just answers**: for each Pokémon, how it gets there (catch, trade, breed, evolve, Pal Park, Poké Transfer, Bank, HOME…), grouped by game family.
- **"Move before 25 Feb 2027"** marks what depends on Bank and Transporter; "can't live there" sets apart Pokémon the chosen game cannot hold.
- **Flags for what needs planning**: choose one (starters, fossils…), only one, one per save, needs a female, cables, region-specific discs.
- **Shareable**: your selections live in the page address. Bookmark it, or send it to show someone the same results.
- **Finder**: where each Pokémon and form can be obtained, game by game, including side games and Pokémon GO.

## How it works

`engine/` (TypeScript) turns the availability data into facts ("this Pokémon can be in this game") and applies transfer routes until nothing new appears. It runs in the browser, in a Web Worker. `site/` is the static site (Vite, Preact). `data/` holds the availability tables and the extra rules data.

Every push to `rebuild` runs two test suites before anything is published: the new engine against 19 reference profiles from the previous version, and the destination tests in `reference/destinations.json`. A failing test blocks the deploy.

    cd site && npm ci && npm run dev    # run the site locally
    cd engine && npm ci                 # tests: see engine/README.md

## Credits

Availability data adapted from [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_availability) (CC BY-NC-SA 2.5; the data in `data/` stays under that licence). Evolution, Egg Group and species data from [PokéAPI](https://pokeapi.co/). Code under the MIT licence.

Pokémon and Pokémon character names are trademarks of Nintendo, Creatures and Game Freak. This is an unofficial fan project.

Found a wrong result? [Open an issue](https://github.com/Vict0rious7/Pokemon-availability-checker/issues) with the page link, the Pokémon and where you saw the right answer.

The previous Streamlit version lives on the `legacy` branch.
