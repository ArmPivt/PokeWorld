// Presentation is interpolated independently of authoritative damage/collisions.
export const ARENA_STEP=.05;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const lerp=(a,b,t)=>a+(b-a)*t;
export function captureScene(s){return {...s,actors:s.actors.map(a=>({...a})),projectiles:s.projectiles.map(p=>({...p,from:{...p.from},aim:{...p.aim},end:p.end&&{...p.end}})),effects:s.effects.map(e=>({...e})),cover:s.cover.map(c=>({...c})),marks:s.marks.map(m=>({...m})),teams:s.teams.map(t=>({...t,mons:t.mons.map(m=>({...m}))}))}}
function point(a,b,t){return a&&b?{x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t)}:b||a}
export function interpolateScene(a,b,time){
 const span=b.time-a.time,t=span>0?clamp((time-a.time)/span):1,base=t<1?a:b,actors=new Map(a.actors.map(x=>[x.pid,x])),shots=new Map(b.projectiles.map(x=>[x.id,x]));
 const result={...base,time:lerp(a.time,b.time,t),actors:b.actors.map(next=>{const old=actors.get(next.pid);if(!old||old.slot!==next.slot||old.disabled!==next.disabled)return t<1&&old?{...old}:{...next};const out={...(t<1?old:next)};for(const k of ['x','y','vx','vy','aimX','aimY'])if(Number.isFinite(old[k])&&Number.isFinite(next[k]))out[k]=lerp(old[k],next[k],t);return out}),projectiles:[]};
 for(const old of a.projectiles){const next=shots.get(old.id);if(!next){if(t<1)result.projectiles.push({...old,age:old.age+(result.time-a.time),x:old.x+(old.kind==='orb'||old.kind==='wave'?old.dx*old.speed*(result.time-a.time):0),y:old.y+(old.kind==='orb'||old.kind==='wave'?old.dy*old.speed*(result.time-a.time):0)});continue}shots.delete(old.id);result.projectiles.push({...next,x:lerp(old.x,next.x,t),y:lerp(old.y,next.y,t),age:lerp(old.age,next.age,t),from:point(old.from,next.from,t),end:point(old.end,next.end,t)})}
 for(const next of shots.values()){const born=b.time-next.age;if(born<=result.time+1e-6){const age=Math.max(0,result.time-born),back=next.age-age;result.projectiles.push({...next,age,x:next.x-(next.kind==='orb'||next.kind==='wave'?next.dx*next.speed*Math.min(back,Math.max(0,next.age-next.delay)):0),y:next.y-(next.kind==='orb'||next.kind==='wave'?next.dy*next.speed*Math.min(back,Math.max(0,next.age-next.delay)):0)})}}
 const effects=new Map([...a.effects,...b.effects].map(e=>[e.id,e]));result.effects=[...effects.values()].filter(e=>e.start<=result.time+1e-6&&result.time-e.start<e.duration);result.marks=[...new Map([...a.marks,...b.marks].map(e=>[e.id,e])).values()].filter(e=>(e.start||0)<=result.time&&e.until>result.time);return result;
}
export class ArenaMotion{
 constructor(state){this.previous=this.current=captureScene(state);this.buffer=[];this.playhead=state.time;this.lastNow=null;this.receivedAt=0}
 beforeStep(state){this.previous=captureScene(state)}
 afterStep(state){this.current=captureScene(state)}
 receive(state,now){const scene=captureScene(state);if(this.buffer.length&&scene.time<this.buffer.at(-1).scene.time)return;this.buffer.push({scene,now});this.buffer=this.buffer.slice(-12);this.receivedAt=now;if(this.buffer.length===1||state.paused||state.over){this.playhead=state.time;this.lastNow=now}}
 sample(state,alpha,now,guest=false){
  if(state.paused||state.over){this.lastNow=now;return captureScene(state)}
  if(!guest)return interpolateScene(this.previous,this.current,this.previous.time+(this.current.time-this.previous.time)*clamp(alpha));
  if(!this.buffer.length)return captureScene(state);const latest=this.buffer.at(-1),elapsed=clamp((now-latest.now)/1000,0,.15),target=latest.scene.time+elapsed-.10,dt=this.lastNow===null?0:clamp((now-this.lastNow)/1000,0,.05);this.lastNow=now;
  this.playhead=clamp(Math.max(this.playhead,this.playhead+dt+clamp((target-this.playhead)*dt*5,-dt*.35,dt*.35)),this.buffer[0].scene.time,latest.scene.time);
  let a=this.buffer[0].scene,b=a;for(const entry of this.buffer){b=entry.scene;if(b.time>=this.playhead)break;a=b}return interpolateScene(a,b,this.playhead);
 }
}
