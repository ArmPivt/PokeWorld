// A seeded, persistent arrival field makes the whole shared border advance.
// The clicked cell selects a target territory; it never steers a narrow column.
function noise(cell,order){let h=Math.imul(cell+17,374761393)^Math.imul(order.id+order.owner*31,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
export function advanceWave(s,o,front,budget,{neighbors,cost,capture}){
 const valid=new Set(front),edge=new Map((o.wave||[]).filter(([cell,time])=>valid.has(cell)&&Number.isFinite(time)));
 o.waveTime=Number.isFinite(o.waveTime)?o.waveTime:0;
 const enters=cell=>{const friendly=neighbors(cell).filter(n=>s.owners[n]===o.owner).length;return o.waveTime+1+noise(cell,o)*.6+(s.map.terrain[cell]===3?.45:s.map.terrain[cell]===2?.15:0)-Math.min(3,friendly)*.18};
 for(const cell of front)if(!edge.has(cell))edge.set(cell,enters(cell));
 let taken=0;
 while(edge.size&&taken<budget){
  let cell=-1,arrival=Infinity;
  for(const [candidate,time]of edge)if(time<arrival||(time===arrival&&candidate<cell)){cell=candidate;arrival=time}
  edge.delete(cell);
  if(s.owners[cell]!==o.target||!neighbors(cell).some(n=>s.owners[n]===o.owner))continue;
  const price=cost(cell);if(o.left+1e-8<price){o.done=true;break}
  o.left-=price;o.waveTime=Math.max(o.waveTime,arrival);capture(cell,price);o.last=cell;taken++;
  for(const n of neighbors(cell))if(s.owners[n]===o.target&&s.map.terrain[n]&&(!o.component||s.map.landComponents[n]===o.component)){
   const time=enters(n);edge.set(n,Math.min(edge.get(n)??Infinity,time));
  }
 }
 o.wave=[...edge];return taken;
}
