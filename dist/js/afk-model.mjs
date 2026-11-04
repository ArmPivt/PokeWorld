export const AFK_LIMIT=8*60*60;
export const BUILDINGS=[
 {id:'pika',name:'Pikachu assistant',key:'25',base:15,rate:.1,desc:'De petites étincelles pour réveiller les Poké Balls.'},
 {id:'nursery',name:'Pension Leveinard',key:'113',base:100,rate:1,desc:'Une pension chaleureuse qui ne ferme jamais.'},
 {id:'garden',name:'Jardin Bulbizarre',key:'1',base:1100,rate:8,desc:'Des graines d’énergie poussent entre les ruines.'},
 {id:'mine',name:'Mine de Racaillou',key:'74',base:12000,rate:47,desc:'Les veines de la tour regorgent de cristaux.'},
 {id:'forge',name:'Forge Dracaufeu',key:'6',base:130000,rate:260,desc:'Le feu transforme les cristaux en énergie pure.'},
 {id:'lab',name:'Laboratoire Alakazam',key:'65',base:1400000,rate:1400,desc:'La science et les pouvoirs psychiques font le reste.'},
 {id:'portal',name:'Portail Ectoplasma',key:'94',base:20000000,rate:7800,desc:'Des ouvriers d’une autre dimension entrent en scène.'},
 {id:'reactor',name:'Réacteur Mewtwo',key:'150',base:330000000,rate:44000,desc:'Une source de puissance à la mesure des légendes.'}
];
export const UPGRADES=[
 {id:'click1',name:'Gants de dresseur',cost:100,click:2,desc:'Double l’énergie par clic.',need:()=>true},
 {id:'click2',name:'Lancer précis',cost:1000,click:2,desc:'Double encore l’énergie par clic.',need:a=>a.clicks>=100},
 {id:'click3',name:'Maître des captures',cost:10000,click:2,desc:'Double encore l’énergie par clic.',need:a=>a.clicks>=500},
 {id:'synergy',name:'Lien du dresseur',cost:50000,synergy:.01,desc:'Chaque clic ajoute 1 % de la production par seconde.',need:a=>a.total>=25000},
 ...BUILDINGS.flatMap(b=>[1,10,25].map((threshold,i)=>({id:b.id+'-'+threshold,name:["Formation","Équipe d’élite","Maîtrise"][i]+' · '+b.name,cost:b.base*[10,100,1000][i],building:b.id,mult:2,desc:'Double la production de tous les '+b.name+'.',need:a=>a.buildings[b.id]>=threshold}))),
 {id:'global1',name:'Cœur de la tour',cost:100000,global:2,desc:'Double toute la production automatique.',need:a=>a.total>=50000},
 {id:'global2',name:'Flamme éternelle',cost:10000000,global:2,desc:'Double encore toute la production automatique.',need:a=>a.total>=5000000}
];
export const ACHIEVEMENTS=[
 {id:'click1',name:'Premier lancer',desc:'Cliquer une fois.',test:a=>a.clicks>=1},
 {id:'click100',name:'Dresseur motivé',desc:'Cliquer 100 fois.',test:a=>a.clicks>=100},
 {id:'click1000',name:'Poignet légendaire',desc:'Cliquer 1 000 fois.',test:a=>a.clicks>=1000},
 {id:'energy1k',name:'Premières étincelles',desc:'Produire 1 000 énergies.',test:a=>a.total>=1000},
 {id:'energy100k',name:'La tour s’éveille',desc:'Produire 100 000 énergies.',test:a=>a.total>=100000},
 {id:'energy1m',name:'Un million de raisons',desc:'Produire un million d’énergies.',test:a=>a.total>=1000000},
 {id:'build10',name:'Une vraie équipe',desc:'Posséder 10 installations.',test:a=>Object.values(a.buildings).reduce((s,n)=>s+n,0)>=10},
 {id:'build50',name:'Petit empire',desc:'Posséder 50 installations.',test:a=>Object.values(a.buildings).reduce((s,n)=>s+n,0)>=50},
 {id:'golden',name:'Chance dorée',desc:'Attraper une Poké Ball dorée.',test:a=>a.golden>=1},
 {id:'upgrade10',name:'Toujours plus loin',desc:'Acheter 10 améliorations.',test:a=>a.upgrades.length>=10},
 {id:'prestige',name:'Renaître des cendres',desc:'Effectuer une renaissance.',test:a=>a.stars>=1}
];
const safe=(v,fallback=0)=>Number.isFinite(+v)?Math.min(1e100,Math.max(0,+v)):fallback;
export function normalizeAfk(raw,now=Date.now()){return {energy:safe(raw?.energy),total:safe(raw?.total),clicks:Math.floor(safe(raw?.clicks)),golden:Math.floor(safe(raw?.golden)),buildings:Object.fromEntries(BUILDINGS.map(b=>[b.id,Math.min(1000,Math.floor(safe(raw?.buildings?.[b.id])))])),upgrades:[...new Set((Array.isArray(raw?.upgrades)?raw.upgrades:[]).filter(id=>UPGRADES.some(u=>u.id===id)))],achievements:[...new Set((Array.isArray(raw?.achievements)?raw.achievements:[]).filter(id=>ACHIEVEMENTS.some(a=>a.id===id)))],stars:Math.floor(safe(raw?.stars)),exchanged:Math.floor(safe(raw?.exchanged)),lastTick:safe(raw?.lastTick,now)||now}}
export function production(a){const owned=UPGRADES.filter(u=>a.upgrades.includes(u.id));const global=owned.reduce((n,u)=>n*(u.global||1),1)*(1+a.stars*.05)*(1+a.achievements.length*.01);return BUILDINGS.reduce((sum,b)=>sum+a.buildings[b.id]*b.rate*owned.filter(u=>u.building===b.id).reduce((n,u)=>n*u.mult,1),0)*global}
export function clickPower(a){const u=UPGRADES.filter(u=>a.upgrades.includes(u.id));return u.reduce((n,u)=>n*(u.click||1),1)*(1+a.stars*.05)+u.reduce((n,u)=>n+(u.synergy||0),0)*production(a)}
export function gain(a,value){if(!Number.isFinite(value)||value<=0)return 0;const amount=Math.min(value,1e100-a.total);a.energy=Math.min(1e100,a.energy+amount);a.total+=amount;return amount}
export function settle(a,now=Date.now()){const seconds=Math.min(AFK_LIMIT,Math.max(0,(now-a.lastTick)/1000));const value=gain(a,production(a)*seconds);a.lastTick=Math.max(a.lastTick,now);return {seconds,gain:value}}
export function unlock(a){const fresh=ACHIEVEMENTS.filter(v=>!a.achievements.includes(v.id)&&v.test(a));a.achievements.push(...fresh.map(v=>v.id));return fresh}
export function buildingCost(a,id,quantity=1){const b=BUILDINGS.find(b=>b.id===id);if(!b||![1,10,100].includes(quantity)||a.buildings[id]+quantity>1000)return Infinity;let sum=0;for(let i=0;i<quantity;i++)sum+=Math.ceil(b.base*1.15**(a.buildings[id]+i));return sum}
export function buyBuilding(a,id,quantity=1){const cost=buildingCost(a,id,quantity);if(!Number.isFinite(cost)||a.energy+1e-8<cost)return false;a.energy=Math.max(0,a.energy-cost);a.buildings[id]+=quantity;unlock(a);return true}
export function buyUpgrade(a,id){const u=UPGRADES.find(u=>u.id===id);if(!u||a.upgrades.includes(id)||!u.need(a)||a.energy<u.cost)return false;a.energy-=u.cost;a.upgrades.push(id);unlock(a);return true}
export function ticketCost(a){return Math.ceil(5000*1.05**Math.min(a.exchanged,1000))}
export function prestigeGain(a){return Math.max(0,Math.floor(Math.sqrt(a.total/1000000))-a.stars)}
export function prestige(a,now=Date.now()){const stars=prestigeGain(a);if(!stars)return 0;a.stars+=stars;a.energy=0;a.upgrades=[];a.buildings=Object.fromEntries(BUILDINGS.map(b=>[b.id,0]));a.lastTick=now;unlock(a);return stars}
export function format(n){if(!Number.isFinite(n))return '—';if(n<1000)return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:n<10?1:0}).format(n);const units=['k','M','Md','Bn','Bld','Tr'];let i=Math.floor(Math.log10(n)/3)-1;if(i>=units.length)return n.toExponential(2);return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(n/1000**(i+1))+' '+units[i]}
