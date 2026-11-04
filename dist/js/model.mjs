import {normalizeMaterials} from './resources.mjs';
import {normalizePlayer} from './player-profile.mjs';
import {normalizeAfk} from './afk-model.mjs';
export const REGIONS=['Kanto','Johto','Hoenn','Sinnoh','Unys','Kalos','Alola','Galar','Paldea'];
export const STARTERS=[[1,4,7],[152,155,158],[252,255,258],[387,390,393],[495,498,501],[650,653,656],[722,725,728],[810,813,816],[906,909,912]];
export const RATES=[{key:'common',name:'Commun',rate:65,color:'#a6b1bf'},{key:'rare',name:'Rare',rate:25,color:'#69bbff'},{key:'epic',name:'Épique',rate:8,color:'#bd91ff'},{key:'legendary',name:'Légendaire',rate:2,color:'#f7c566'}];
export const SHINY_RATE=.01;
export const ITEMS=[
 {key:'seed',name:'Graine de force',rarity:'common',desc:'Attaque +8 %',atk:.08},
 {key:'scarf',name:'Foulard agile',rarity:'common',desc:'Vitesse +8 %',speed:.08},
 {key:'band',name:'Bandeau robuste',rarity:'common',desc:'PV +12 %',hp:.12},
 {key:'charcoal',name:'Charbon ardent',rarity:'rare',desc:'Attaque +18 %',atk:.18},
 {key:'shell',name:'Coquille protectrice',rarity:'rare',desc:'Défense +18 %',def:.18},
 {key:'boots',name:'Bottes du voyageur',rarity:'rare',desc:'Vitesse +18 %',speed:.18},
 {key:'bell',name:'Grelot de soin',rarity:'epic',desc:'Régénération : 1 PV / s',regen:1},
 {key:'lens',name:'Lentille astrale',rarity:'epic',desc:'Attaque +25 %, cadence +15 %',atk:.25,cadence:.15},
 {key:'vest',name:'Veste du gardien',rarity:'epic',desc:'PV +30 %, défense +15 %',hp:.3,def:.15},
 {key:'crown',name:'Couronne infernale',rarity:'legendary',desc:'Attaque +35 %, PV +25 %, vitesse +15 %',atk:.35,hp:.25,speed:.15},
 {key:'relic',name:'Relique de Célébi',rarity:'legendary',desc:'Soin : 2 PV / s, défense +25 %',regen:2,def:.25}
];
export const keyOf=(id,shiny=false)=>String(id)+(shiny?'s':'');
export const idOf=key=>parseInt(key,10);
export const isShiny=key=>String(key).endsWith('s');
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function migrate(raw){
 const n=v=>Number.isFinite(+v)?Math.max(0,Math.floor(+v)):0;
 const valid=k=>/^\d{1,4}s?$/.test(String(k))&&idOf(k)>=1&&idOf(k)<=1025;
 const list=Array.isArray(raw?.roster)?raw.roster:Array.isArray(raw?.owned)?raw.owned:[];
 const roster=[...new Set(list.map(String).filter(valid))];
 const starter=valid(raw?.starter)?n(raw.starter):null;
 if(starter&&!roster.includes(String(starter)))roster.unshift(String(starter));
 const team=[...new Set((Array.isArray(raw?.team)?raw.team:[]).map(String).filter(k=>roster.includes(k)))].slice(0,6);
 const tickets=Array.isArray(raw?.tickets)?raw.tickets.reduce((s,v)=>s+n(v),0):raw?.tickets===undefined?27:n(raw.tickets);
 return {version:6,conquest:raw?.conquest,materials:normalizeMaterials(raw?.materials),player:normalizePlayer(raw?.player),candies:n(raw?.candies??10),denFloor:Math.max(1,n(raw?.denFloor)),training:raw?.training&&typeof raw.training==='object'?raw.training:{},archivedRoster:Array.isArray(raw?.archivedRoster)?raw.archivedRoster:[],afk:normalizeAfk(raw?.afk),starter,roster,team:team.length?team:roster.slice(0,1),survivor:roster.includes(String(raw?.survivor))?String(raw.survivor):roster[0]||null,tickets,coins:n(raw?.coins),floor:Math.max(1,n(raw?.floor)),kills:n(raw?.kills),runs:n(raw?.runs),inventory:Array.isArray(raw?.inventory)?raw.inventory.filter(i=>i&&typeof i.uid==='string'&&ITEMS.some(d=>d.key===i.key)):[],equipment:raw?.equipment&&typeof raw.equipment==='object'?{...raw.equipment}:{},history:Array.isArray(raw?.history)?raw.history.slice(0,30):[],settings:{sound:raw?.settings?.sound??false,reducedMotion:raw?.settings?.reducedMotion??false}};
}
export function selectRarity(random=Math.random){const v=random()*100;let acc=0;return RATES.find(r=>(acc+=r.rate)>v)?.key||'legendary'}
export function summonRoll(dex,gen,random=Math.random){const rarity=selectRarity(random),pool=Object.values(dex).filter(p=>p.gen===gen&&p.rarity===rarity);if(!pool.length)throw Error('Portail sans Pokémon pour cette rareté');const index=random(),shiny=random()<SHINY_RATE,eligible=shiny?pool.filter(p=>p.shiny!==false):pool;const choices=eligible.length?eligible:pool,pokemon=choices[Math.min(choices.length-1,Math.floor(index*choices.length))];return{key:keyOf(pokemon.id,shiny&&eligible.length>0),id:pokemon.id,rarity,gen,at:Date.now()}}
export function held(state,key){const instance=state.inventory.find(i=>i.uid===state.equipment[key]);return ITEMS.find(i=>i.key===instance?.key)||{}}
export function equip(state,uid,key){if(!state.roster.includes(key)||!state.inventory.some(i=>i.uid===uid))return false;for(const k of Object.keys(state.equipment))if(state.equipment[k]===uid)delete state.equipment[k];state.equipment[key]=uid;return true}
export function lootRoll(random=Math.random){let r=random()*100;const rarity=r<55?'common':r<83?'rare':r<97?'epic':'legendary';const pool=ITEMS.filter(d=>d.rarity===rarity);return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]}
export function calcDamage(a,d,m,chart,random=Math.random){if(random()*100>m.accuracy)return{n:0,text:'Esquivé !',effective:1};let effective=d.types.reduce((n,t)=>n*(chart[m.type]?.[t]??1),1);if((d.abilityId===26&&m.type==='ground')||([11,114].includes(d.abilityId)&&m.type==='water')||([10,31].includes(d.abilityId)&&m.type==='electric')||(d.abilityId===18&&m.type==='fire'))effective=0;const atk=m.special?a.spa:a.atk,def=m.special?d.spd:d.def;const n=Math.floor((((2*(a.level||20)/5+2)*m.power*atk/Math.max(1,def))/50+2)*(a.types.includes(m.type)?(a.abilityId===91?2:1.5):1)*((!m.special&&[37,74].includes(a.abilityId))?2:1)*((a.abilityId===101&&m.power<=60)?1.5:1)*((a.hp<=a.max/3&&({65:'grass',66:'fire',67:'water',68:'bug'})[a.abilityId]===m.type)?1.5:1)*((d.abilityId===47&&['fire','ice'].includes(m.type))?.5:1)*effective*(.85+random()*.15));return{n:effective===0?0:Math.max(1,n),effective,text:effective===0?'Sans effet':effective>1?'Super efficace !':effective<1?'Peu efficace':''}}
export function fighter(dex,key,item={}){const p=dex[idOf(key)];const max=Math.round((70+p.stats[0])*(1+(item.hp||0)));return{key,id:p.id,name:p.name,types:p.types,max,hp:max,atk:Math.round(p.stats[1]*(1+(item.atk||0))),def:Math.round(p.stats[2]*(1+(item.def||0))),spa:Math.round(p.stats[3]*(1+(item.atk||0))),spd:Math.round(p.stats[4]*(1+(item.def||0))),speed:Math.round(p.stats[5]*(1+(item.speed||0))),regen:item.regen||0,moves:p.moves.map(m=>({...m,left:m.pp}))}}
export function resolveRound(battle,chart,random=Math.random){
 const events=[],alive=battle.teams.filter(t=>t.mons.some(m=>m.hp>0));
 if(!alive.every(t=>battle.actions[t.pid]))return null;
 for(const t of alive){const action=battle.actions[t.pid];if(action.swap!==undefined&&t.mons[action.swap]?.hp>0){t.active=action.swap;events.push({kind:'swap',pid:t.pid,key:t.mons[t.active].key})}}
 const order=alive.filter(t=>battle.actions[t.pid].move!==undefined).map(t=>({pid:t.pid,slot:t.active,speed:t.mons[t.active].speed}));order.push({pid:'boss',speed:battle.boss.speed});order.sort((a,b)=>b.speed-a.speed);
 for(const turn of order){if(battle.boss.hp<=0)break;let source,target,move,targetPid;
 if(turn.pid==='boss'){const candidates=battle.teams.filter(t=>t.mons[t.active].hp>0);if(!candidates.length)break;const t=candidates[Math.floor(random()*candidates.length)];source=battle.boss;target=t.mons[t.active];targetPid=t.pid;move=(battle.kind==='tower'?[...source.moves].sort((a,b)=>b.power*target.types.reduce((n,t)=>n*(chart[b.type]?.[t]??1),1)-a.power*target.types.reduce((n,t)=>n*(chart[a.type]?.[t]??1),1))[0]:source.moves[Math.floor(random()*source.moves.length)])}
 else{const t=battle.teams.find(t=>t.pid===turn.pid);source=t.mons[t.active];if(t.active!==turn.slot||source.hp<=0)continue;target=battle.boss;targetPid='boss';move=source.moves[battle.actions[t.pid].move];if(!move||move.left<=0)continue;move.left--}
 const result=calcDamage(source,target,move,chart,random);target.hp=Math.max(0,target.hp-result.n);
 events.push({kind:'attack',source:turn.pid,target:targetPid,sourceKey:source.key,targetKey:target.key,move:move.name,moveId:move.id,slug:move.slug,type:move.type,amount:result.n,text:result.text,hp:target.hp,max:target.max});
 if(target.hp===0){events.push({kind:'ko',pid:targetPid,key:target.key});if(targetPid!=='boss'){const t=battle.teams.find(t=>t.pid===targetPid),next=t.mons.findIndex(m=>m.hp>0);if(next>=0){t.active=next;events.push({kind:'swap',pid:t.pid,key:t.mons[next].key})}}}
 }
 for(const t of battle.teams){const p=t.mons[t.active];if(p.hp>0&&p.regen)p.hp=Math.min(p.max,p.hp+Math.ceil(p.regen*3));if(p.moves.every(m=>m.left<=0))p.moves=[{name:'Lutte',type:'normal',power:50,accuracy:100,special:false,pp:999,left:999}]}
 if(battle.boss.hp===0&&battle.enemyParty&&battle.enemyIndex<battle.enemyParty.length-1){battle.enemyIndex++;battle.boss=structuredClone(battle.enemyParty[battle.enemyIndex]);events.push({kind:'enemy-swap',mon:structuredClone(battle.boss)})}battle.turn++;battle.actions={};battle.over=battle.boss.hp===0||!battle.teams.some(t=>t.mons.some(m=>m.hp>0));battle.win=battle.boss.hp===0;return events;
}
