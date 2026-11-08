export const RAID_TURN_LIMIT=20;
export function applyRaidLimits(b,events=[]){
 if(!b.raid)return events;
 for(const team of b.teams){if(!team.expelled&&team.mons.every(m=>m.hp<=0)){team.expelled=true;delete b.actions[team.pid];events.push({kind:'message',pid:team.pid,key:team.mons[team.active].key,hp:0,text:team.name+' est expulsé par la faille ! Les autres alliés continuent.'})}}
 b.turnLimit=RAID_TURN_LIMIT;b.turnsUsed=Math.max(0,b.turn-1);
 if(b.turnsUsed>=RAID_TURN_LIMIT&&!b.over){b.over=true;b.win=false;b.raidOutcome='timeout';b.actions={};events.push({kind:'message',pid:'boss',key:b.boss.key,hp:b.boss.hp,text:'Les 20 tours sont écoulés. La faille se referme et expulse le groupe !'})}
 return events;
}
export function raidRarity(rarity){return ({common:{label:'Une présence résonne dans la grotte…',color:'#89b6c4',strength:.32,duration:4},rare:{label:'Une énergie rare s’éveille !',color:'#69baff',strength:.55,duration:4.5},epic:{label:'Une puissance exceptionnelle fait trembler la grotte !',color:'#c78bfa',strength:.78,duration:5},legendary:{label:'Une présence légendaire déchire la faille !',color:'#f4cf74',strength:1,duration:5.8}})[rarity]||raidRarity('common')}
