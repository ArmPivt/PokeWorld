import {canEnterTower,towerFrontier,towerRewards,TOWER_FLOORS} from './tower-data.mjs';
import {addXP} from './training.mjs';
export function awardTowerVictory(state,floor,keys=state.team){
 if(!canEnterTower(state,floor)||floor!==towerFrontier(state)||state.tower.claimed.includes(floor))return null;
 const reward=towerRewards(floor);state.tower.cleared.push(floor);state.tower.claimed.push(floor);state.floor=Math.min(TOWER_FLOORS+1,floor+1);
 state.tickets+=reward.tickets;state.candies+=reward.candies;state.coins+=reward.coins;
 for(const key of new Set(keys))if(state.roster.includes(key))addXP(state,key,reward.xp);
 return reward;
}
