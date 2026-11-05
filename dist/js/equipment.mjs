// Equipment policy shared by saves, the bag, the lab and network offers.
export function equipmentAPI(ITEMS){
 const definition=key=>ITEMS.find(i=>i.key===key);
 const list=value=>Array.isArray(value)?value:typeof value==='string'?[value]:[];
 function normalizeEquipment(state){const result={},used=new Set();for(const key of state.roster||[]){const types=new Set(),uids=[];for(const uid of list(state.equipment?.[key])){const instance=state.inventory?.find(i=>i.uid===uid);if(!instance||!definition(instance.key)||used.has(uid)||types.has(instance.key)||uids.length===3)continue;uids.push(uid);types.add(instance.key);used.add(uid)}if(uids.length)result[key]=uids}return result}
 function heldItems(state,key){const uids=list(state.equipment?.[key]),types=new Set(),out=[];for(const uid of uids){const instance=state.inventory?.find(i=>i.uid===uid),d=definition(instance?.key);if(d&&!types.has(d.key)&&out.length<3){out.push({...d,uid});types.add(d.key)}}return out}
 function combineItems(keys){const defs=[...new Set(list(keys))].map(definition).filter(Boolean).slice(0,3),total={items:defs,keys:defs.map(i=>i.key),key:defs[0]?.key,name:defs.map(i=>i.name).join(' · '),desc:defs.map(i=>i.desc).join(' · ')};for(const stat of['atk','def','speed','hp','regen','cadence'])total[stat]=defs.reduce((n,i)=>n+(i[stat]||0),0);return total}
 function held(state,key){return combineItems(heldItems(state,key).map(i=>i.key))}
 function equip(state,uid,key){if(!state.roster.includes(key))return false;const instance=state.inventory.find(i=>i.uid===uid);if(!instance||!definition(instance.key))return false;const next=normalizeEquipment(state),target=heldItems({...state,equipment:next},key);if(target.some(i=>i.uid===uid||i.key===instance.key)||target.length>=3)return false;for(const k of Object.keys(next)){next[k]=next[k].filter(id=>id!==uid);if(!next[k].length)delete next[k]}next[key]=[...(next[key]||[]),uid];state.equipment=next;return true}
 function unequip(state,key,uid=null){const next=normalizeEquipment(state);if(!next[key])return false;if(uid!==null&&!next[key].includes(uid))return false;if(uid===null)delete next[key];else{next[key]=next[key].filter(id=>id!==uid);if(!next[key].length)delete next[key]}state.equipment=next;return true}
 return{normalizeEquipment,heldItems,combineItems,held,equip,unequip};
}
