import {drawPixel,drawFlight,drawStream,drawWave,drawImpact,drawCharge} from './pixel-fx.mjs';
const TAU=Math.PI*2,clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
// The first visible contact is always at 67% of the attack, matching HP playback.
export function drawStyledAttack(c,move,st,from,to,elapsed,{scale=1,reducedMotion=false}={}){
 const kinds=['beam','wave','orb','sludge','flame','water','ice','leaves','swarm','slash','punch','fangs','impact','rocks','meteor','lightning'];if(!kinds.includes(st.kind))return false;
 const t=elapsed/st.duration;if(t<0||t>1)return true;const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx),q=smooth((t-.18)/.49),at={x:from.x+dx*q,y:from.y+dy*q},fade=clamp((1-t)/.18),opts={scale,reducedMotion};
 c.save();if(t<.22)drawCharge(c,move,from,t/.22,opts);
 if(t>=.18&&t<.72){
  if(st.kind==='beam'||st.kind==='lightning'||st.kind==='flame'&&/thrower|blast|incinerate|eruption/.test(st.id)||st.kind==='water'&&/pump|gun|cannon/.test(st.id)){c.globalAlpha*=fade;drawStream(c,move,from,at,elapsed,{width:(st.kind==='beam'?24:st.kind==='lightning'?13:20)*scale,reducedMotion});}
  else if(st.kind==='wave')drawWave(c,move,at,angle,elapsed,{width:(65+q*50)*scale,reducedMotion});
  else if(['orb','sludge','flame','water','ice'].includes(st.kind))drawFlight(c,move,at,angle,elapsed,{size:(st.kind==='orb'?57:46)*scale,reducedMotion});
  else if(st.kind==='leaves'||st.kind==='swarm'){for(let i=0;i<(reducedMotion?4:9);i++){const p=smooth((t-.18-i*.012)/.49),a=angle+Math.sin(elapsed*5+i)*.12,x=from.x+dx*p-Math.sin(angle)*Math.sin(p*7+i)*14*scale,y=from.y+dy*p+Math.cos(angle)*Math.sin(p*7+i)*14*scale;drawPixel(c,'leaf',move.type,x,y,35*scale,elapsed,a+i)}}
  else if(st.kind==='rocks'||st.kind==='meteor'){for(let i=0;i<(reducedMotion?3:5);i++){const p=smooth((t-.18-i*.012)/.49),x=st.kind==='meteor'?to.x-(1-p)*85*scale:from.x+dx*p,y=st.kind==='meteor'?to.y-(1-p)*160*scale:from.y+dy*p-Math.sin(p*Math.PI)*(25+i*5)*scale;drawPixel(c,'rock',move.type,x+Math.sin(i*2.399)*18*scale,y+Math.cos(i*2.399)*12*scale,45*scale,elapsed,elapsed*3+i)}}
  else if(st.kind==='slash'&&/airslash|aircutter|psychocut/.test(st.id))drawPixel(c,'slash',move.type,at.x,at.y,80*scale,elapsed,angle);else if(st.kind==='punch'&&t>.38)drawPixel(c,'punch',move.type,at.x,at.y,60*scale,elapsed,angle);else if(t>.38){const p=clamp((t-.38)/.29),x=from.x+dx*p,y=from.y+dy*p;for(let i=0;i<3;i++){c.globalAlpha=(1-i*.25)*.6;c.strokeStyle=st.light;c.lineWidth=(3-i*.6)*scale;c.beginPath();c.moveTo(x-Math.cos(angle)*(20+i*7)*scale-Math.sin(angle)*i*6*scale,y-Math.sin(angle)*(20+i*7)*scale+Math.cos(angle)*i*6*scale);c.lineTo(x,y);c.stroke()}}
 }
 if(t>=.67){const impact=(t-.67)/.33;if(['slash','punch','fangs'].includes(st.kind)){for(let i=0;i<(st.kind==='slash'?3:1);i++)drawPixel(c,st.kind==='fangs'?'fangs':st.kind==='punch'?'punch':'slash',move.type,to.x+Math.sin(angle)*i*8*scale,to.y-Math.cos(angle)*i*8*scale,100*scale,impact,angle-Math.PI/4+i*.13,{once:true,alpha:1-impact})}drawImpact(c,move,to,impact,opts)}c.restore();return true;
}
