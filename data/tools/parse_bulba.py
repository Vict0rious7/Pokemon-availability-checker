import re, json, collections
from bs4 import BeautifulSoup
s=BeautifulSoup(open('bulba.html').read(),'lxml')
tabs=s.find_all('table')[1:12]
ORDER=['Red','Green','Blue','Yellow','Gold','Silver','Crystal','Ruby','Sapphire','FireRed','LeafGreen','Emerald','Colosseum','XD',
 'Diamond','Pearl','Platinum','HeartGold','SoulSilver','Black','White','Black2','White2','X','Y','OmegaRuby','AlphaSapphire',
 'Sun','Moon','UltraSun','UltraMoon','LetsGoPikachu','LetsGoEevee','Sword','Shield','BrilliantDiamond','ShiningPearl','LegendsArceus',
 'Scarlet','Violet','LegendsZA']
def color(c):
    m=re.search(r'(?:background|color)\s*:\s*(#[0-9A-Fa-f]{3,6})',c.get('style','') or '')
    return m.group(1).upper() if m else None
# colour map from the Gen I table, first data row with 41 game cells
cmap=collections.defaultdict(set)
for r in tabs[0].find_all('tr')[2:]:
    cells=r.find_all(['th','td'])[3:]
    if len(cells)!=41: continue
    for g,c in zip(ORDER,cells): cmap[color(c)].add(g)
amb={k:v for k,v in cmap.items() if len(v)>1}
print('colours:',len(cmap),'ambiguous:',amb)
g2c=collections.defaultdict(set)
for k,v in cmap.items():
    if k:
        for g in v: g2c[g].add(k)
bad={g:c for g,c in g2c.items() if len(c)!=1}
print('games with !=1 colour:',bad, 'games coloured:',len(g2c))
c2g={next(iter(v)):g for g,v in g2c.items() for _ in [0]}
c2g={list(c)[0]:g for g,c in g2c.items()}
def norm_name(cell):
    t=cell.get_text(' ',strip=True)
    return ' '.join(t.split())
data={}  # key (num,int name) -> {game: code}
problems=[]
for ti,t in enumerate(tabs, start=1):
    rows=[r for r in t.find_all('tr') if len(r.find_all(['th','td']))>4 and r.find_all(['th','td'])[0].get_text(strip=True).isdigit()]
    ncols=max(len(r.find_all(['th','td'])) for r in rows)-3
    colgame=[]
    for j in range(ncols):
        seen=collections.Counter()
        for r in rows:
            cells=r.find_all(['th','td'])[3:]
            if j<len(cells):
                c=color(cells[j])
                if c: seen[c2g.get(c,'?'+c)]+=1
        colgame.append(seen.most_common(1)[0][0] if seen else None)
    for r in rows:
        cells=r.find_all(['th','td'])
        num=str(int(cells[0].get_text(strip=True))); name=norm_name(cells[2])
        codes={}
        for j,c in enumerate(cells[3:]):
            codes[colgame[j]]=' '.join(c.get_text(' ',strip=True).split())
        key=(num,name)
        if key in data: problems.append(('dup',key))
        data[key]=codes
    print(f'table {ti}: {len(rows)} rows, columns: {colgame}')
json.dump({f'{k[0]}|{k[1]}':v for k,v in data.items()},open('bulba.json','w'),ensure_ascii=False,indent=0)
print('rows',len(data),'problems',problems[:5])
