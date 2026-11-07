export const TOWER_FLOORS=50;
const integer=v=>Number.isInteger(+v)?+v:0;
export function normalizeTower(raw,frontier=1){
 const completed=Math.max(0,Math.min(TOWER_FLOORS,integer(frontier)-1));
 const legacy=Array.from({length:completed},(_,i)=>i+1),valid=a=>Array.isArray(a)?a.map(integer).filter(n=>n>0&&n<=completed):[];
 // Older saves already received rewards below their next unbeaten floor.
 return {cleared:[...new Set([...legacy,...valid(raw?.cleared)])].sort((a,b)=>a-b),claimed:[...new Set([...legacy,...valid(raw?.claimed)])].sort((a,b)=>a-b)};
}
export function towerFrontier(state){return Math.max(1,Math.min(TOWER_FLOORS+1,integer(state.floor)||1))}
export function canEnterTower(state,floor){return Number.isInteger(floor)&&floor>0&&floor<=TOWER_FLOORS&&floor<=towerFrontier(state)}
export function towerRewards(floor){return floor===TOWER_FLOORS?{tickets:20,candies:20,coins:1000,xp:1000}:floor%10===0?{tickets:5,candies:5,coins:200,xp:30+floor*10}:{tickets:2,candies:2,coins:50,xp:30+floor*10}}
export function towerTrainer(floor,dex){
 const final=floor===TOWER_FLOORS,avatars=['leaf-gen3','brendan-gen3','dawn','ethan','hilda','hilbert'],names=['Camille','Mathis','Léna','Hugo','Jade','Noé'],pool=[19,16,25,133,74,4,7,1,41,92].filter(id=>dex[id]);
 const keys=final?[6,9,3,149,248,376].filter(id=>dex[id]):Array.from({length:Math.min(6,1+Math.ceil(floor/3))},(_,i)=>pool[(floor+i-1)%pool.length]);
 return {floor,name:final?'Maître Soren':names[(floor-1)%6],avatar:final?'red-gen3':avatars[(floor-1)%6],title:final?'Gardien du sommet':floor%10===0?'Dresseur d’élite':'Dresseur de la tour',level:Math.min(100,4+floor*2),keys:keys.map(String),final};
}
