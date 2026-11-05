export const DUST={common:25,rare:75,epic:200,legendary:600};
export const rollIVs=(random=Math.random)=>Array.from({length:6},()=>Math.max(0,Math.min(31,Math.floor((Number(random())||0)*32))));
export const bestIVs=(a,b)=>Array.from({length:6},(_,i)=>Math.max(a?.[i]||0,b?.[i]||0));
export function applyReleaseGift(state,raw){const gift='pw15-owner-1000';state.claimedGifts||=[];if(!raw?.starter||!(Number(raw.version)<=8)||state.claimedGifts.includes(gift))return false;state.tickets+=1000;state.claimedGifts.push(gift);return true}
