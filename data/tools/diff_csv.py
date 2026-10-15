import re, csv, json, collections
from bs4 import BeautifulSoup
exec(open('parse_bulba.py').read().split("data={}")[0])   # reuse colour map + helpers
s=BeautifulSoup(open('bulba.html').read(),'lxml')
new={}; newgen={}
for ti,t in enumerate(s.find_all('table')[1:12], start=1):
    rows=[r for r in t.find_all('tr') if len(r.find_all(['th','td']))>4 and r.find_all(['th','td'])[0].get_text(strip=True).isdigit()]
    ncols=max(len(r.find_all(['th','td'])) for r in rows)-3
    colgame=[]
    for j in range(ncols):
        seen=collections.Counter(c2g.get(color(r.find_all(['th','td'])[3:][j])) for r in rows if j<len(r.find_all(['th','td'])[3:]) and color(r.find_all(['th','td'])[3:][j]))
        colgame.append(seen.most_common(1)[0][0])
    nums=collections.Counter(r.find_all(['th','td'])[0].get_text(strip=True) for r in rows)
    for r in rows:
        c=r.find_all(['th','td']); num=str(int(c[0].get_text(strip=True)))
        name=' '.join(c[2].get_text(' ',strip=True).split())
        m=re.search(r'\(\s*(.*?)\s*\)',name); form=m.group(1) if m else ''
        base=re.sub(r'\s*\(.*','',name)
        if not form and nums[c[0].get_text(strip=True)]>1:
            fn=c[1].find('img')['src'].split('/')[-1]
            stem=re.sub(r'^\d+px-','',fn)[4:].rsplit('.',1)[0]
            sp=base.replace(' ','_')
            form=stem[len(sp)+1:] if stem.startswith(sp+'-') else ''
        key=(num,form)
        if key in new: print('DUP',key)
        new[key]={'name':base,**{colgame[j]:' '.join(x.get_text(' ',strip=True).split()) for j,x in enumerate(c[3:])}}
        newgen[key]=ti
old={}
for g in range(1,10):
    for r in csv.DictReader(open(f'repo/gen{g}.csv',newline='',encoding='utf-8'),delimiter=';'):
        nm=' '.join(r['Name'].split()); m=re.search(r'\(\s*(.*?)\s*\)',nm)
        old[(r['#'],m.group(1) if m else '')]={'name':re.sub(r'\s*\(.*','',nm),'gen':g,**{k:v.strip() for k,v in r.items() if k not in('#','Name')}}
print('old rows',len(old),'new rows',len(new))
only_old=sorted(set(old)-set(new),key=lambda k:int(k[0])); only_new=sorted(set(new)-set(old),key=lambda k:int(k[0]))
print('only in old:',only_old); print('only in new:',[(k,new[k]['name']) for k in only_new])
pairs=collections.defaultdict(lambda: collections.defaultdict(list)); added_cols=collections.Counter(); new_cols=collections.Counter()
for k in set(old)&set(new):
    o,n=old[k],new[k]
    for col,v in o.items():
        if col in('name','gen'): continue
        if col not in n: added_cols[col]+=1; continue
        if v!=n[col]: pairs[(v,n[col])][col].append(k)
    for col in n:
        if col!='name' and col not in o: new_cols[col]+=1
print('old-only columns (cells):',dict(added_cols)); print('new-only columns (cells):',dict(new_cols))
tot=sum(len(x) for p in pairs.values() for x in p.values()); print('changed cells:',tot,'distinct (old,new) pairs:',len(pairs))
out=[]
for p,cols in sorted(pairs.items(), key=lambda kv:-sum(len(x) for x in kv[1].values())):
    out.append((p,{c:[f"{k[0]}{' '+k[1] if k[1] else ''} {old[k]['name']}" for k in ks] for c,ks in cols.items()}))
json.dump([[list(p),c] for p,c in out],open('diff.json','w'),ensure_ascii=False,indent=1)
for p,c in out:
    n=sum(len(v) for v in c.values())
    print(f"{p[0]!r:>8} -> {p[1]!r:<8} {n:4d}  cols={sorted(c)[:8]}{'…' if len(c)>8 else ''}  e.g. {next(iter(c.values()))[:2]}")

print('\n--- checks')
common=set(old)&set(new)
for oc,nc in (('Blue','Blue'),('Blue','Green'),('Green','Green'),('Red','Red')):
    rows=[k for k in common if oc in old[k] and nc in new[k]]
    same=sum(old[k][oc]==new[k][nc] for k in rows)
    print(f'old {oc} vs new {nc}: {same}/{len(rows)} equal')
# old-only cells: are they all dashes?
vals=collections.Counter()
for k in common:
    for col,v in old[k].items():
        if col not in('name','gen') and col not in new[k] and col not in ('JapBonusDisc','Ranch','BattleRev','Ranger','USBonusDisc','PALChannel'):
            vals[(col,v)]+=1
print('old cells in columns Bulbapedia omits for that row:',dict(vals))
for p,c in out:
    if p[1] in ('TE',) and p[0]=='T': print('T->TE:',c)
    if p[0]=='EVTED': print('EVTED->TED:',c)
