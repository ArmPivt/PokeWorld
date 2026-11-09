import {canEnterTower,towerFrontier,towerRewards,TOWER_FLOORS,towerDifficulty,normalizeTower} from './tower-data.mjs';
import {addXP} from './training.mjs';
export function awardTowerVictory(state,floor,keys=state.team,difficulty=towerDifficulty(state)){
 state.tower=normalizeTower(state.tower,state.floor);const progress=state.tower.tracks[difficulty];if(!progress)return null;
 if(!canEnterTower(state,floor,difficulty)||floor!==towerFrontier(state,difficulty)||progress.claimed.includes(floor))return null;
 const reward=towerRewards(floor,difficulty);progress.cleared.push(floor);progress.claimed.push(floor);progress.floor=Math.min(TOWER_FLOORS+1,floor+1);if(towerDifficulty(state)===difficulty){state.floor=progress.floor;state.tower.cleared=progress.cleared;state.tower.claimed=progress.claimed;}
 state.tickets+=reward.tickets;state.candies+=reward.candies;state.coins+=reward.coins;
 for(const key of new Set(keys))if(state.roster.includes(key))addXP(state,key,reward.xp);
 return reward;
}
