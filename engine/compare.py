"""Compare the rebuild's results with the old engine's reference results, at the level of games.
Old labels are mapped to the core games they stand for, so 'Sword DLC⇄', 'Diamond (BR)' or 'Ranch' compare fairly."""
import json, re, sys, glob, os
ref_dir, new_dir = sys.argv[1], sys.argv[2]
G4=['Diamond','Pearl','Platinum','HeartGold','SoulSilver']; G3=['Ruby','Sapphire','Emerald','FireRed','LeafGreen']
NAMES={'Lets Go Pikachu':'LetsGoPikachu','Lets Go Eevee':'LetsGoEevee','Brilliant Diamond':'BrilliantDiamond','Shining Pearl':'ShiningPearl','Legends: Arceus':'LegendsArceus'}
KEYS={'red':'Red','green':'Green','blue':'Blue','yellow':'Yellow','gold':'Gold','silver':'Silver','crystal':'Crystal','ruby':'Ruby','sapphire':'Sapphire','firered':'FireRed','leafgreen':'LeafGreen','emerald':'Emerald','diamond':'Diamond','pearl':'Pearl','platinum':'Platinum','heartgold':'HeartGold','soulsilver':'SoulSilver','black2':'Black2','white2':'White2'}
def games(label, inp):
    owned={g for k,g in KEYS.items() if inp.get(k)}
    l=re.sub(r'[⇄⤹⤓]','',label).strip(); l=re.sub(r' \((BR|PW)\)$','',l); l=re.sub(r' DLC$','',l)
    if l=='Dream Radar': return owned & {'Black2','White2'}
    if l=='Ranch': return owned & ({'Diamond','Pearl','Platinum'} if inp.get('ranch_language') in ('Japanese','Both') else {'Diamond','Pearl'})
    if l in ('Ranger','Battle Revolution'): return owned & set(G4)
    if l=='Colosseum (Bonus Disc)': return owned & set(G3)
    if l=='Channel (PAL)': return owned & {'Ruby','Sapphire'}
    return {NAMES.get(l,l)}
total=0; out=[]
for f in sorted(glob.glob(os.path.join(ref_dir,'*.json'))):
    ref=json.load(open(f)); new=json.load(open(os.path.join(new_dir,os.path.basename(f))))
    inp=ref['profile']['inputs']; pid=ref['profile']['id']
    a={f"{r['number']} {r['name']}":set().union(*[games(g,inp) for g in r['games']]) for r in ref['available']}
    a.update({f"{r['number']} {r['name']}":set() for r in ref['unavailable']})
    b={f"{r['number']} {r['name']}":set(r['games']) for r in new['available']}
    b.update({f"{r['number']} {r['name']}":set() for r in new['unavailable']})
    diffs=[]
    for k in sorted(set(a)|set(b), key=lambda k:(int(k.split()[0]),k)):
        x,y=a.get(k,set()),b.get(k,set())
        if x!=y: diffs.append(f"  {k}: old {sorted(x) or 'none'} | new {sorted(y) or 'none'}  (+{sorted(y-x)} -{sorted(x-y)})")
    total+=len(diffs); print(f"{pid}: {len(diffs)} difference(s)"); print('\n'.join(diffs))
print(f"TOTAL {total}")

# --accepted <file>: every difference must be listed there with the same old and new games; exit 1 otherwise.
if len(sys.argv) > 4 and sys.argv[3] == '--accepted':
    acc = {(a['profile'], a['row']): (set(a['old']), set(a['new']), a['reason']) for a in json.load(open(sys.argv[4]))}
    bad = 0
    for f in sorted(glob.glob(os.path.join(ref_dir, '*.json'))):
        ref = json.load(open(f)); new = json.load(open(os.path.join(new_dir, os.path.basename(f))))
        inp = ref['profile']['inputs']; pid = ref['profile']['id']
        a = {f"{r['number']} {r['name']}": set().union(*[games(g, inp) for g in r['games']]) for r in ref['available']}
        a.update({f"{r['number']} {r['name']}": set() for r in ref['unavailable']})
        b = {f"{r['number']} {r['name']}": set(r['games']) for r in new['available']}
        b.update({f"{r['number']} {r['name']}": set() for r in new['unavailable']})
        for k in set(a) | set(b):
            x, y = a.get(k, set()), b.get(k, set())
            if x != y and acc.get((pid, k), (None, None))[:2] != (x, y):
                bad += 1; print(f"UNEXPLAINED {pid} {k}: old {sorted(x)} | new {sorted(y)}")
    print(f"{bad} unexplained difference(s)"); sys.exit(1 if bad else 0)
