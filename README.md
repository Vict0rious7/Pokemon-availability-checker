# Pokémon availability checker

Pokémon Bank and Poké Transporter close on **25 February 2027**. After that, Pokémon from the DS and 3DS games can no longer reach Pokémon HOME.

Enter the games, consoles and services you own, where your collection will live (Pokémon HOME or one game) and which generations count. The checker shows which Pokémon you can bring there, and which ones you can bring only if you move them before Bank closes.

**Open the checker: https://vict0rious7.github.io/Pokemon-availability-checker/**

## Features

- **Every game from Red to Legends: Z-A** (including the Mega Dimension DLC and FireRed/LeafGreen on Switch), with copies, DLC, consoles, Pokémon HOME, Bank, GO and side games such as My Pokémon Ranch, Pokéwalker and Dream Radar.
- **Paths, not just answers**: for each Pokémon, how it gets there (catch, trade, breed, evolve, Pal Park, Poké Transfer, Bank, HOME…), grouped by game family.
- **"Move before 25 Feb 2027"** marks what depends on Bank and Transporter; "can't live there" sets apart Pokémon the chosen game cannot hold.
- **Flags for what needs planning**: choose one (starters, fossils…), only one, one per save, needs a female, cables, region-specific discs.
- **What to get next**: for the Pokémon still missing, a step-by-step list of what to get (a game with the system it plays on, a cable, a service) that brings the most Pokémon for the least extra hardware first, with the Pokémon each step brings. Optional boxes leave out Pokémon GO, or allow software you can only get on a console that already has it installed (Bank, Transporter, Dream Radar, My Pokémon Ranch, Virtual Console games).
- **Suggested for your games**: the consoles, cables, services and side games that work with the games you picked are listed first.
- **Shareable**: your selections live in the page address. Bookmark it, or send it to show someone the same results.
- **Finder**: where each Pokémon and form can be obtained, game by game, including side games and Pokémon GO.

## How it works

`engine/` (TypeScript) turns the availability data into facts ("this Pokémon can be in this game") and applies transfer routes until nothing new appears. It runs in the browser, in a Web Worker. `site/` is the static site (Vite, Preact). `data/` holds the availability tables and the extra rules data.

For "What to get next", the site build runs the engine once more with everything obtainable. Each path then records the items it needs, and the minimal shopping lists per Pokémon and destination are written to a file the planner loads (about 330 KB compressed). A check fails the build if a list promises a Pokémon the engine does not reach.

Every push to `main` runs the checks before anything is published: the engine against 19 reference profiles from the previous version, the destination tests in `reference/destinations.json`, and the shopping-list check. A failing check blocks the deploy.

    cd site && npm ci && npm run build && npm run preview   # run the site locally (the build takes about 4 min)
    cd engine && npm ci                 # tests: see engine/README.md

## Credits

Availability data adapted from [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_availability) (CC BY-NC-SA 2.5; the data in `data/` stays under that licence). Evolution, Egg Group and species data from [PokéAPI](https://pokeapi.co/). Code under the MIT licence.

Pokémon and Pokémon character names are trademarks of Nintendo, Creatures and Game Freak. This is an unofficial fan project.

Found a wrong result? Use the "Wrong? Report it" link under that Pokémon in the checker, or [open a report](https://github.com/Vict0rious7/Pokemon-availability-checker/issues/new?template=wrong-result.yml) with the page link, the Pokémon and where you saw the right answer.

The previous Streamlit version lives on the `legacy` branch.
