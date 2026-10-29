"""Derive the second half of ONCE_PER_SAVE (Victor, 15 Oct 2026): one-time Pokémon that can evolve.
A Pokémon received once in a game (code R or RD: gift, fossil, in-game trade) whose evolutions can only be had by
evolving it (codes E/ED there), when it cannot be bred in that game (no breeding there, or No Eggs Discovered):
one save can hold it or its evolution, not both. Non-evolving one-time Pokémon are left out.
usage: python3 tools/build_one_time.py  (from data/) -> one_time_evolving.csv"""
import csv, io, json
NO_BREEDING = {"Red", "Green", "Blue", "Yellow", "Colosseum", "XD", "LetsGoPikachu", "LetsGoEevee", "LegendsArceus", "LegendsZA"}
SIDE = {"Ranch", "BattleRev", "Ranger", "JapBonusDisc", "USBonusDisc", "PALChannel"}
# Received more than once although coded R (Victor, 15 Oct): Yellow's Game Corner Vulpix; Z-A fossils (Stone Emporium).
REPEATABLE = {("Yellow", 37), ("LegendsZA", 696), ("LegendsZA", 698)}
evo = json.load(open("evolution.json"))
sp = evo["species"]
children = {}
for e in evo["evolutions"]:
    if e["multiplayer"] or e["from_form"] not in (None, "", sp[str(e["from"])]["default_form"]): continue   # plain forms only
    children.setdefault(e["from"], set()).add(e["to"])
rows = {}
for g in range(1, 10):
    r = list(csv.reader(io.StringIO(open(f"gen{g}.csv", encoding="utf-8").read()), delimiter=";"))
    head = r[0]
    for x in r[1:]:
        name = " ".join(x[1].split())
        if "(" in name: continue                          # species level: base forms only
        rows[int(x[0])] = (name, {head[j]: x[j].strip() for j in range(2, len(head))})
out = []
for n, (name, cells) in sorted(rows.items()):
    for game, code in cells.items():
        if game in SIDE or code not in ("R", "RD") or (game, n) in REPEATABLE: continue
        line, todo = [], [n]
        while todo:
            for c in sorted(children.get(todo.pop(), ())):
                if c in rows and rows[c][1].get(game, "—") in ("E", "ED"):
                    line.append(c); todo.append(c)
        # any member that can be bred gives the line again (babies are No Eggs Discovered, their evolutions are not)
        if game not in NO_BREEDING and any(sp[str(m)]["egg"] is not None and not sp[str(m)]["baby"] for m in [n] + line): continue
        if line:
            out.append((game, n, name, "|".join([name] + [rows[c][0] for c in line])))
with open("one_time_evolving.csv", "w", encoding="utf-8") as f:
    f.write("game;number;received;members\n")
    for o in out: f.write(";".join(map(str, o)) + "\n")
print(len(out), "rows")
