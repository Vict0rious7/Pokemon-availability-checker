import re, csv, collections, os, shutil
exec(open('diff_csv.py').read().split("print('old rows'")[0].replace("print(","(lambda *a,**k:None)("))
TABLE_GEN={1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:7,9:8,10:8,11:9}
G1=['JapBonusDisc','USBonusDisc','PALChannel','Ranch','BattleRev','Ranger']
SWITCH_ONLY={('249',''),('250',''),('386','')}   # Lugia, Ho-Oh, Deoxys: C* in FRLG = Switch re-release
def clean(v):
    v=v.replace(' ','')
    if v=='EV*': return 'EV'       # Colosseum, Japanese e-Reader only
    return v or '—'
headers={}
for g in range(1,10):
    with open(f'repo/gen{g}.csv',newline='',encoding='utf-8') as f: headers[g]=next(csv.reader(f,delimiter=';'))
os.makedirs('newcsv',exist_ok=True)
log=collections.Counter(); rowsout=collections.defaultdict(list)
for key in new:   # dict keeps Bulbapedia order
    g=TABLE_GEN[newgen[key]]; n=new[key]; o=old.get(key) or old.get((key[0],''))
    form=key[1].replace('_',' ')
    name=n['name']+(f'\n({form})' if form else '')
    if key in old: name=[r for r in [old[key]]][0]['name'] and None or name
    row={'#':key[0],'Name':name}
    for col in headers[g][2:]:
        if col in G1:
            row[col]=(old[key][col] if key in old else '—'); log['G1 kept']+=1
        elif col=='Blue':
            row[col]=clean(n.get('Green','—')); log['G2 Blue=Green']+=1
        else:
            v=clean(n.get(col,'—'))
            if col in('FireRed','LeafGreen') and key in SWITCH_ONLY and v=='C*': v='EV'; log['G5 GBA FRLG EV']+=1
            row[col]=v
    if g<=3:
        for col in('FireRedSwitch','LeafGreenSwitch'):
            base=col.replace('Switch','')
            v=clean(n.get(base,'—'))
            row[col]='C' if (key in SWITCH_ONLY and v=='C*') else v
    row['LegendsZA']=clean(n.get('LegendsZA','—'))
    rowsout[g].append(row)
for g in range(1,10):
    hdr=headers[g]+(['FireRedSwitch','LeafGreenSwitch'] if g<=3 else [])+['LegendsZA']
    with open(f'newcsv/gen{g}.csv','w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=hdr,delimiter=';',lineterminator='\r\n'); w.writeheader(); w.writerows(rowsout[g])
    print(g,len(rowsout[g]),'rows')
print(dict(log))
