import {summonPool} from './summon-catalog.mjs';
import {rollIVs} from './genetics.mjs';
import {normalizeStories} from './legendary-stories.mjs';
import {equipmentAPI} from './equipment.mjs';
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
 const state={version:9,bag:Object.fromEntries(Object.entries(raw?.bag||{}).filter(([k])=>/^(tm-\d+|evo-[a-z-]+)$/.test(k)).map(([k,v])=>[k,n(v)])),shop:{purchases:raw?.shop?.purchases&&typeof raw.shop.purchases==='object'?raw.shop.purchases:{}},claimedGifts:Array.isArray(raw?.claimedGifts)?raw.claimedGifts:[],shinyCopies:Object.fromEntries(roster.filter(k=>k.endsWith('s')).map(k=>[k,Math.max(1,n(raw?.shinyCopies?.[k]))])),evolutionChecks:Array.isArray(raw?.evolutionChecks)?raw.evolutionChecks.filter(k=>roster.includes(k)):[],legendaryStories:normalizeStories(raw?.legendaryStories),conquest:raw?.conquest,materials:normalizeMaterials(raw?.materials),player:normalizePlayer(raw?.player),candies:n(raw?.candies??10),denFloor:Math.max(1,n(raw?.denFloor)),training:raw?.training&&typeof raw.training==='object'?raw.training:{},archivedRoster:Array.isArray(raw?.archivedRoster)?raw.archivedRoster:[],afk:normalizeAfk(raw?.afk),starter,roster,team:team.length?team:roster.slice(0,1),survivor:roster.includes(String(raw?.survivor))?String(raw.survivor):roster[0]||null,tickets,coins:n(raw?.coins),floor:Math.max(1,n(raw?.floor)),kills:n(raw?.kills),runs:n(raw?.runs),inventory:Array.isArray(raw?.inventory)?raw.inventory.filter(i=>i&&typeof i.uid==='string'&&ITEMS.some(d=>d.key===i.key)):[],equipment:raw?.equipment&&typeof raw.equipment==='object'?{...raw.equipment}:{},history:Array.isArray(raw?.history)?raw.history.slice(0,30):[],settings:{music:raw?.settings?.music??true,musicVolume:Number.isFinite(+raw?.settings?.musicVolume)?Math.max(0,Math.min(1,+raw.settings.musicVolume)):.22,arenaTheme:['grass','dirt','ruins','cavern'].includes(raw?.settings?.arenaTheme)?raw.settings.arenaTheme:'grass',arenaFormat:raw?.settings?.arenaFormat==='squad'?'squad':'duel',combatStyle:raw?.settings?.combatStyle==='arena'?'arena':'classic',sound:raw?.settings?.sound??false,reducedMotion:raw?.settings?.reducedMotion??false}};state.equipment=normalizeEquipment(state);return state;
}
export function selectRarity(random=Math.random){const v=random()*100;let acc=0;return RATES.find(r=>(acc+=r.rate)>v)?.key||'legendary'}
export function summonRoll(dex,gen,random=Math.random){const rarity=selectRarity(random),pool=summonPool(dex,gen,rarity);if(!pool.length)throw Error('Portail sans Pokémon pour cette rareté');const index=random(),shiny=random()<SHINY_RATE,eligible=shiny?pool.filter(p=>p.shiny!==false):pool;const choices=eligible.length?eligible:pool,pokemon=choices[Math.min(choices.length-1,Math.floor(index*choices.length))];return{key:keyOf(pokemon.id,shiny&&eligible.length>0),id:pokemon.id,rarity,gen,iv:rollIVs(random),at:Date.now()}}
export const {normalizeEquipment,heldItems,combineItems,held,equip,equipSlot,unequip}=equipmentAPI(ITEMS);
export function lootRoll(random=Math.random){let r=random()*100;const rarity=r<55?'common':r<83?'rare':r<97?'epic':'legendary';const pool=ITEMS.filter(d=>d.rarity===rarity);return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]}
export {calcDamage,resolveRaidRound as resolveRound} from './combat-core.mjs';
export function fighter(dex,key,item={}){const p=dex[idOf(key)];const max=Math.round((70+p.stats[0])*(1+(item.hp||0)));return{key,id:p.id,name:p.name,types:p.types,max,hp:max,atk:Math.round(p.stats[1]*(1+(item.atk||0))),def:Math.round(p.stats[2]*(1+(item.def||0))),spa:Math.round(p.stats[3]*(1+(item.atk||0))),spd:Math.round(p.stats[4]*(1+(item.def||0))),speed:Math.round(p.stats[5]*(1+(item.speed||0))),regen:item.regen||0,moves:p.moves.map(m=>({...m,left:m.pp}))}}
