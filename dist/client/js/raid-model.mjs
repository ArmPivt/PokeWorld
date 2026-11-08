import {trainedFighter,profile,level} from './training.mjs';
import {heldItems,combineItems} from './model.mjs';
import {prepareAiMoves,chooseAction} from './combat-ai.mjs';
import {receiveSummon} from './summon-ledger.mjs';
import {reserveStories} from './legendary-stories.mjs';

export const RAID_SHINY_RATE=.05;
import {normalizeRaids} from './raid-state.mjs';
export {normalizeRaids} from './raid-state.mjs';
export function raidPool(dex){return Object.values(dex).filter(d=>d.shiny).map(d=>String(d.id))}
export function newEncounter(dex,previous='',random=Math.random){const pool=raidPool(dex).filter(k=>k!==previous);return {id:crypto.randomUUID(),key:pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]||previous}}
export function ensureRaid(g){g.state.raids=normalizeRaids(g.state.raids);const r=g.state.raids;let changed=false;if(!g.state.roster.includes(r.partner)){r.partner=g.state.roster[0]||'';changed=true}if(!r.encounter||!g.dex[+r.encounter.key]?.shiny){r.encounter=newEncounter(g.dex);changed=true}if(changed)g.save();return r}
export function raidParty(g){const key=ensureRaid(g).partner;return {pid:g.net.myId,name:g.state.player.name,avatar:g.state.player.avatar,keys:[key],training:{[key]:structuredClone(profile(g.state,key))},items:{[key]:heldItems(g.state,key).map(i=>i.key)}}}
export function buildRaid(g,solo=false){const r=ensureRaid(g),parties=[raidParty(g),...(solo?[]:g.net.players)].slice(0,4),L=Math.max(5,Math.min(100,Math.round(parties.reduce((n,p)=>n+level(profile({training:p.training||{}},p.keys[0])),0)/parties.length))),encounter=solo?r.encounter:g.net.encounter||r.encounter;
 const teams=parties.map(p=>({pid:p.pid,name:p.name,avatar:p.avatar,bot:false,active:0,mons:[trainedFighter(g.dex,{training:p.training||{},roster:p.keys},p.keys[0],combineItems(p.items?.[p.keys[0]]))]}));
 const pool=[3,6,9,65,68,94,131,143,181,196,212,282,330,350,448].filter(id=>g.dex[id]);while(teams.length<4){const i=teams.length,key=String(pool[Math.floor(Math.random()*pool.length)]);const mon=trainedFighter(g.dex,{training:{[key]:{xp:L**3}},roster:[]},key,{},L);prepareAiMoves(mon,g.dex);teams.push({pid:'raid-bot-'+i,name:['','Flora · Bot','Pierre · Bot','Aurore · Bot'][i],avatar:['','may-gen3','brock','dawn-gen4'][i],bot:true,active:0,mons:[mon]})}
 const boss=trainedFighter(g.dex,{training:{[encounter.key]:{xp:L**3}},roster:[]},encounter.key,{},L);boss.max=boss.hp=Math.round(boss.max*6);prepareAiMoves(boss,g.dex);
 return {id:crypto.randomUUID(),kind:'den',raid:true,encounter:structuredClone(encounter),nextEncounter:newEncounter(g.dex,encounter.key),floor:1,teams,boss,enemyParty:null,enemyIndex:0,turn:1,turnLimit:20,actions:{},over:false,win:false,log:[]};
}
export function fillBotActions(b,chart){for(const team of b.teams)if(team.bot&&team.mons[team.active].hp>0&&!b.actions[team.pid])b.actions[team.pid]=chooseAction(team,{pid:'boss',active:0,mons:[b.boss]},chart,b.field||{},{turn:b.turn})}
export function settleRaid(state,b,pid,dex,random=Math.random){state.raids=normalizeRaids(state.raids);const r=state.raids;if(Object.hasOwn(r.claims,b.id))return r.claims[b.id];const team=b.teams.find(t=>t.pid===pid);if(!b.raid||!b.over||!team||team.bot)return null;
 const result={id:b.id,boss:b.boss.key,win:!!b.win&&!team.expelled,expelled:!!team.expelled,shiny:!!b.win&&!team.expelled&&random()<RAID_SHINY_RATE,key:null};r.completed++;if(result.win)r.wins++;
 if(result.shiny&&dex[parseInt(b.boss.key)]?.shiny){result.key=String(parseInt(b.boss.key))+'s';const mon={key:result.key,rarity:dex[parseInt(result.key)].rarity};reserveStories(state,[mon]);receiveSummon(state,mon);result.pokemon=mon;r.shinies++}else result.shiny=false;
 r.claims[b.id]=result;r.encounter=b.nextEncounter||newEncounter(dex,b.boss.key);return result;
}
