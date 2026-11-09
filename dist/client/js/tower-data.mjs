import {TRAINER_CATALOG} from './trainer-catalog.mjs';
export const TOWER_FLOORS=50;
export const TOWER_DIFFICULTIES=[
 {id:'trainer',name:'Dresseur',label:'Débutant',description:'Une ascension progressive : niveaux 5 à 75, équipes de un à six Pokémon.'},
 {id:'gym',name:'Champions d’arènes',label:'Intermédiaire',description:'Des équipes thématiques de quatre à six Pokémon, niveaux 36 à 95.'},
 {id:'master',name:'Maître de ligue',label:'Impossible',description:'Six Pokémon niveau 100, IV parfaits, EV et natures optimisés dès le premier étage.'}
];
const integer=v=>Number.isInteger(+v)?+v:0;
export const towerDifficulty=state=>TOWER_DIFFICULTIES.find(d=>d.id===state?.tower?.difficulty)?.id||'trainer';
export const towerDifficultyInfo=id=>TOWER_DIFFICULTIES.find(d=>d.id===id)||TOWER_DIFFICULTIES[0];
const track=raw=>{const floor=Math.max(1,Math.min(51,integer(raw?.floor)||1)),done=Array.from({length:floor-1},(_,i)=>i+1);return{floor,cleared:[...done],claimed:[...done]}};
export function normalizeTower(raw,frontier=1){
 let difficulty=towerDifficulty({tower:raw});const tracks=Object.fromEntries(TOWER_DIFFICULTIES.map(d=>[d.id,track(raw?.tracks?.[d.id]||{floor:d.id==='trainer'?frontier:1})]));
 const candidate={tower:{tracks}};if(!isTowerDifficultyUnlocked(candidate,difficulty))difficulty=isTowerDifficultyUnlocked(candidate,'gym')?'gym':'trainer';
 return{difficulty,tracks,cleared:tracks[difficulty].cleared,claimed:tracks[difficulty].claimed};
}
export function towerFrontier(state,difficulty=towerDifficulty(state)){return Math.max(1,Math.min(51,integer(state.tower?.tracks?.[difficulty]?.floor)||(difficulty==='trainer'?integer(state.floor):1)||1))}
export function isTowerDifficultyUnlocked(state,id){if(id==='trainer')return true;if(id==='gym')return towerFrontier(state,'trainer')>TOWER_FLOORS;if(id==='master')return towerFrontier(state,'trainer')>TOWER_FLOORS&&towerFrontier(state,'gym')>TOWER_FLOORS;return false}
export function towerUnlockHint(state,id){if(isTowerDifficultyUnlocked(state,id))return 'Disponible';const previous=id==='gym'?'trainer':'gym';return 'Termine '+towerDifficultyInfo(previous).name+' · '+Math.min(50,towerFrontier(state,previous)-1)+'/50 étages'}
export function setTowerDifficulty(state,id){if(!isTowerDifficultyUnlocked(state,id))return false;state.tower=normalizeTower(state.tower,state.floor);state.tower.difficulty=id;state.floor=state.tower.tracks[id].floor;state.tower.cleared=state.tower.tracks[id].cleared;state.tower.claimed=state.tower.tracks[id].claimed;return true}
export function canEnterTower(state,floor,difficulty=towerDifficulty(state)){return isTowerDifficultyUnlocked(state,difficulty)&&Number.isInteger(floor)&&floor>0&&floor<=50&&floor<=towerFrontier(state,difficulty)}
export function towerRewards(floor,difficulty='trainer'){const base=floor===50?{tickets:20,candies:20,coins:1000,xp:1000}:floor%10===0?{tickets:5,candies:5,coins:200,xp:30+floor*10}:{tickets:2,candies:2,coins:50,xp:30+floor*10},mult=difficulty==='master'?3:difficulty==='gym'?2:1;return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,v*mult]))}
const portrait=(name,fallback='red-gen3')=>TRAINER_CATALOG.find(([,label])=>label.split(' · ')[0].toLowerCase()===name.toLowerCase())?.[0]||fallback;
const gyms=[
 ['Pierre','Brock',[74,95,112,141,142,76]],['Ondine','Misty',[120,55,134,80,130,121]],['Major Bob','Lt. Surge',[25,101,125,82,135,26]],['Érika','Erika',[114,45,71,103,182,407]],['Koga','Koga',[89,110,49,73,169,94]],['Morgane','Sabrina',[122,97,124,103,196,65]],['Auguste','Blaine',[78,38,136,229,6,59]],['Giovanni','Giovanni',[51,105,31,34,112,464]]
];
const masters=[
 ['Peter','Lance',[130,142,6,230,248,149]],['Pierre Rochard','Steven',[227,344,306,346,348,376]],['Cynthia','Cynthia',[442,407,350,448,468,445]],['Blue','Blue',[18,65,112,103,130,6]],['Goyah','Alder',[617,143,589,621,584,637]],['Iris','Iris',[635,621,131,306,567,612]]
];
export function towerTrainer(floor,dex,difficulty='trainer'){
 const final=floor===50;
 if(difficulty==='gym'||difficulty==='master'){
  const row=difficulty==='gym'?gyms[final?7:(floor-1)%gyms.length]:masters[(floor-1)%masters.length],count=difficulty==='master'?6:floor<20?4:floor<35?5:6;
  const ids=difficulty==='master'&&final?[150,249,384,483,487,493]:row[2];
  return{floor,difficulty,name:difficulty==='master'&&final?'Maître Soren':row[0],avatar:difficulty==='master'&&final?'red-gen3':portrait(row[1]),title:difficulty==='gym'?'Champion d’arène':final?'Gardien ultime du sommet':'Maître de ligue',level:difficulty==='master'?100:Math.min(95,35+Math.floor(floor*1.2)),keys:ids.filter(id=>dex[id]).slice(0,count).map(String),final};
 }
 const avatars=['leaf-gen3','brendan-gen3','dawn','ethan','hilda','hilbert'],names=['Camille','Mathis','Léna','Hugo','Jade','Noé'],pool=(floor<15?[19,16,25,133,74,4,7,1,41,92]:floor<35?[20,17,26,75,5,8,2,42,93]:[18,26,76,6,9,3,169,94,59,65]).filter(id=>dex[id]);
 const keys=final?[6,9,3,149,248,376].filter(id=>dex[id]):Array.from({length:Math.min(6,1+Math.floor(floor/10))},(_,i)=>pool[(floor+i-1)%pool.length]);
 return{floor,difficulty:'trainer',name:final?'Maître Soren':names[(floor-1)%6],avatar:final?'red-gen3':avatars[(floor-1)%6],title:final?'Gardien du sommet':'Dresseur de la tour',level:Math.min(75,4+Math.floor(floor*1.42)),keys:keys.map(String),final};
}
export function towerTraining(trainer,key,dex){const hard=trainer.difficulty==='master',mid=trainer.difficulty==='gym',physical=dex[parseInt(key)].stats[1]>=dex[parseInt(key)].stats[3],ev=[0,0,0,0,0,0];if(hard){ev[0]=4;ev[physical?1:3]=252;ev[5]=252}else if(mid){ev[0]=80;ev[physical?1:3]=128;ev[5]=80}return{xp:trainer.level**3,iv:Array(6).fill(hard?31:mid?24:8),ev,nature:hard?(physical?'adamant':'modest'):mid?(physical?'jolly':'timid'):'hardy',moves:[],ability:0}}
