"""Build data/evolution.json from PokeAPI's CSV dump (https://github.com/PokeAPI/pokeapi, data/v2/csv, master).
usage: python3 build_evolution.py <dir with the PokeAPI CSVs> <out.json>
Needs: pokemon_species, pokemon_egg_groups, pokemon_evolution, pokemon_forms, pokemon.
Used by the Phase 2 arrival rules (evolve and breed in the game a Pokémon reaches) and by the legendary flags.
Forms are PokeAPI form identifiers ("alola", "east", "red-striped"…); the engine maps them to the CSV form names."""
import csv, json, sys
src, out = sys.argv[1], sys.argv[2]
rows = lambda f: list(csv.DictReader(open(f"{src}/{f}.csv", encoding="utf-8")))
species = {int(r["id"]): r for r in rows("pokemon_species")}
forms = {int(r["id"]): r for r in rows("pokemon_forms")}
pokemon = {int(r["id"]): r for r in rows("pokemon")}
eggs = {}
for r in rows("pokemon_egg_groups"): eggs.setdefault(int(r["species_id"]), []).append(int(r["egg_group_id"]))
default_form = {}
for fid, f in forms.items():
    p = pokemon[int(f["pokemon_id"])]
    if p["is_default"] == "1" and f["is_default"] == "1": default_form[int(p["species_id"])] = f["form_identifier"]
fi = lambda i: forms[int(i)]["form_identifier"] if i else None
evo = []
for r in rows("pokemon_evolution"):
    to = int(r["evolved_species_id"]); frm = species[to]["evolves_from_species_id"]
    if not frm: continue
    evo.append({"from": int(frm), "to": to, "vg": int(r["version_group_id"]), "trade": r["evolution_trigger_id"] == "2",
                "multiplayer": r["needs_multiplayer"] == "1", "from_form": fi(r["required_pokemon_form_id"]),
                "to_form": fi(r["evolved_pokemon_form_id"]), "region": int(r["region_id"]) if r["region_id"] else None})
have = {(e["from"], e["to"]) for e in evo}
for i, s in species.items():
    if s["evolves_from_species_id"] and (int(s["evolves_from_species_id"]), i) not in have:
        evo.append({"from": int(s["evolves_from_species_id"]), "to": i, "vg": 1, "trade": False, "multiplayer": False,
                    "from_form": None, "to_form": None, "region": None, "no_method_row": True})
def root(i):
    while species[i]["evolves_from_species_id"]: i = int(species[i]["evolves_from_species_id"])
    return i
def egg(i):
    if i == 490: return 489                                   # Manaphy hatches Phione
    if 15 in eggs.get(i, []) or i == 132: return None        # No Eggs Discovered; Ditto only helps
    return root(i)                                            # babies included: the engine decides about incense
spec = {str(i): {"egg": egg(i), "egg_groups": eggs.get(i, []), "gender_rate": int(s["gender_rate"]), "baby": s["is_baby"] == "1",
                 "legendary": s["is_legendary"] == "1", "mythical": s["is_mythical"] == "1", "default_form": default_form.get(i, "")}
        for i, s in sorted(species.items())}
json.dump({"_about": "Evolutions and species facts by national number, from PokeAPI's CSV dump (master, 15 Oct 2026). "
           "Evolution rows: 'vg' = PokeAPI version group where the method starts; from_form/to_form = PokeAPI form identifiers "
           "(null: no form required / default form); region = PokeAPI region where this row applies. Species: egg = what breeding it "
           "gives (null: cannot breed), egg groups, gender_rate (-1 genderless, 0 male only, 8 female only), baby, legendary, mythical.",
           "evolutions": sorted(evo, key=lambda e: (e["from"], e["to"], e["vg"], str(e["from_form"]))), "species": spec},
          open(out, "w"), indent=0, ensure_ascii=False)
print(len(evo), "evolution rows;", sum(1 for v in spec.values() if v["egg"] is None), "species cannot breed")
