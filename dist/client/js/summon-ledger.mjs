import {profile} from './training.mjs';
import {DUST,bestIVs,rollIVs} from './genetics.mjs';
export function receiveSummon(state,result){
 const key=result.key,shiny=key.endsWith('s');result.iv||=rollIVs();result.duplicate=state.roster.includes(key);result.fresh=!result.duplicate;
 if(!result.duplicate)state.roster.push(key);
 const p=profile(state,key),old=[...p.iv];p.iv=result.duplicate?bestIVs(p.iv,result.iv):[...result.iv];result.bestIV=[...p.iv];result.ivUpgrades=result.duplicate?p.iv.filter((v,i)=>v>old[i]).length:0;
 result.fragments=result.duplicate&&!shiny?(DUST[result.rarity]||25):0;state.coins+=result.fragments;
 state.shinyCopies||={};if(shiny)state.shinyCopies[key]=(state.shinyCopies[key]||(result.duplicate?1:0))+1;
 return result;
}
