import {drawStyledAttack} from './styled-attack.mjs';
import {COLORS} from './art.mjs';
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function attackStyle(move={}){
 const id=norm(move.slug||move.move||move.name),type=move.type||'normal',palette=COLORS[type]||COLORS.normal;
 let kind=({fire:'flame',water:'water',grass:'leaves',electric:'lightning',ice:'ice',psychic:'rings',ghost:'orb',dark:'slash',dragon:'beam',fairy:'sparkles',fighting:'punch',flying:'gust',ground:'quake',rock:'rocks',bug:'swarm',poison:'sludge',steel:'slash',normal:move.special?'orb':'impact'})[type]||'impact';
 if(move.status||move.statusMove)kind=move.target===7?'aura':({electric:'lightning',poison:'sludge',grass:'leaves',psychic:'rings',ice:'ice',fire:'flame'})[type]||'aura';if(/recover|roost|synthesis|moonlight|rest|wish|heal|aromatherapy/.test(id))kind='heal';if(/protect|detect|reflect|lightscreen|auroraveil|substitute/.test(id))kind='shield';if(/growl|tailwhip|swordsdance|nastyplot|calmmind|agility|irondefense|bulkup|dragon?dance|supportaura/.test(id))kind='aura';
 let color=palette[0],light=palette[1],core=palette[2]||'#fff';
 if(/surf|surfs|muddywater|oceano|originpulse/.test(id)||move.moveId===57||move.id===57)kind='wave';
 else if(/hyperbeam|ultralaser|gigaimpact|judgment/.test(id)||[63,416].includes(move.moveId||move.id)){kind='beam';color='#b8c6e8';light='#e8f5ff';core='#fff'}
 else if(/energyball|ecosphere/.test(id)||[412].includes(move.moveId||move.id)){kind='orb';color='#36a54e';light='#a5f34e';core='#e7ffc2'}
 else if(/ball|sphere|bombe|pulse|pouls|focusblast/.test(id))kind='orb';
 else if(/beam|laser|ray|rayon|cannon|canon|luminocanon/.test(id))kind='beam';
 else if(/flamethrower|lanceflamme|fireblast|deflagration|incinerate|eruption/.test(id))kind='flame';
 else if(/hydropump|hydrocanon|watergun|pistoleta|aquajet|waterpulse/.test(id))kind='water';
 else if(/razorleaf|tranchherbe|magicalleaf|feuillemagik|leafstorm|tempeteverte/.test(id))kind='leaves';
 else if(/vinewhip|fouetliane|powerwhip|megawhip/.test(id))kind='vines';
 else if(/claw|slash|griffe|tranche|cutter|tail|queue|scissor|plaiecroix/.test(id))kind='slash';
 else if(/punch|poing|kick|pied|closecombat|mach|uppercut/.test(id))kind='punch';
 else if(/explosion|selfdestruct|destruction|bigbang/.test(id))kind='explosion';
 else if(/meteor|meteore|dracometeor|comet/.test(id))kind='meteor';
 else if(/bite|morsure|crunch|machouille|fang|crocs/.test(id))kind='fangs';
 else if(/earthquake|seisme|earthpower|telluriforce|bulldoze/.test(id))kind='quake';
 else if(/rock|stone|roc|roche|eboulement/.test(id))kind='rocks';
 else if(/gust|tornado|tornade|hurricane|vent/.test(id))kind='gust';
 const duration=kind==='wave'?1.25:kind==='beam'?1.1:['quake','explosion','meteor'].includes(kind)?1.15:.95;
 return{kind,color,light,core,duration,id,type};
}
function disk(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,Math.max(.01,r),0,TAU);c.fill()}
function line(c,points,color,width){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
function star(c,x,y,r,color){c.fillStyle=color;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.lineTo(x+Math.cos(a)*r*(i%2?.3:1),y+Math.sin(a)*r*(i%2?.3:1))}c.closePath();c.fill()}
function shards(c,x,y,t,style,count=15,radius=44){for(let i=0;i<count;i++){const a=i*2.399,r=(.25+hash(i)*.75)*radius*t,s=(1-t)*4+1;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;c.fillStyle=i%2?style.light:style.color;c.fillRect(Math.round(px),Math.round(py),s,s)}}
export function drawAttack(c,move,from,to,elapsed,{reducedMotion=false,scale=1}={}){
 const st=attackStyle(move);if(drawStyledAttack(c,move,st,from,to,elapsed,{reducedMotion,scale}))return;const t=elapsed/st.duration;if(t<0||t>1)return;const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx),travel=clamp((t-.16)/.53),envelope=Math.sin(clamp(t)*Math.PI),impact=clamp((t-.62)/.38),particles=reducedMotion?5:15;
 if(['heal','shield','aura'].includes(st.kind)){c.save();const center=st.kind==='heal'||st.kind==='shield'?from:to;c.globalAlpha=Math.sin(t*Math.PI);c.strokeStyle=st.kind==='heal'?'#b3f4bd':st.light;c.fillStyle=st.kind==='heal'?'#c9ffcc':st.color;c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(center.x,center.y-8,14+i*8+Math.sin(t*Math.PI)*8,(st.kind==='shield'?26:9)+i*5,0,0,TAU);c.stroke()}for(let i=0;i<8;i++){const a=i*2.399+t*2,r=24+i%3*7,x=center.x+Math.cos(a)*r,y=center.y+Math.sin(a)*r-t*15;c.fillRect(x-1,y-4,2,8);c.fillRect(x-4,y-1,8,2)}c.restore();return}
 c.save();c.globalAlpha=clamp(Math.min(t*9,(1-t)*7));c.translate(from.x,from.y);c.rotate(angle);c.scale(scale,scale);const len=length/scale;
 // A charged origin precedes every projectile; shapes remain in logical pixel coordinates.
 if(t<.3){disk(c,0,0,5+Math.sin(t/.3*Math.PI)*11,st.color+'88');shards(c,0,0,1-t/.3,st,particles,23)}
 if(st.kind==='beam'){
  if(t>.16&&t<.88){const end=len*clamp((t-.16)/.2),thickness=(14+8*Math.sin(t*45))*Math.sin(clamp((t-.16)/.13)*Math.PI/2);line(c,[[0,0],[end,0]],st.color,thickness+12);line(c,[[0,0],[end,0]],st.light,thickness);line(c,[[0,0],[end,0]],st.core,Math.max(3,thickness*.48));for(let i=0;i<particles;i++){const x=hash(i*3+t)*end;star(c,x,(hash(i+4)-.5)*40,3,st.core)}disk(c,0,0,thickness*.8,st.light)}
 }else if(st.kind==='wave'){
  const x=travel*len,width=50+65*travel;c.globalAlpha*=.9;c.fillStyle='#2369ba';c.beginPath();c.moveTo(x-48,-width);c.lineTo(x-48,width);for(let i=16;i>=0;i--){const y=(i/16*2-1)*width;c.lineTo(x+Math.cos(i*.85+t*18)*7+15*(1-Math.abs(y/width)),y)}c.closePath();c.fill();for(let j=0;j<3;j++){const pts=[];for(let i=0;i<=24;i++){const y=(i/24*2-1)*width;pts.push([x+Math.sin(i*.8-t*16+j)*5-j*9,y])}line(c,pts,['#e2fcff','#8ee2fc','#40b4e8'][j],j?5:7)}for(let i=0;i<particles;i++)disk(c,x+hash(i)*34,(hash(i+30)-.5)*width*2,1+hash(i+2)*3,'#c2f8ff');
 }else if(st.kind==='orb'||st.kind==='sludge'){
  const x=len*travel,r=11+Math.sin(t*35)*1.4;for(let i=5;i>0;i--)disk(c,x-i*8,Math.sin(t*28-i)*2,Math.max(1,r-i*1.6),st.color+'55');disk(c,x,0,r+7,st.color+'55');disk(c,x,0,r,st.color);disk(c,x-2,-2,r*.72,st.light);disk(c,x-4,-4,r*.32,st.core);for(let i=0;i<particles;i++){const a=t*13+i*TAU/particles;star(c,x+Math.cos(a)*(r+4),Math.sin(a)*(r+4),2,st.light)}
 }else if(st.kind==='water'||st.kind==='flame'){
  const end=len*travel;for(let i=0;i<24;i++){const q=i/24,x=end*q,y=Math.sin(q*18-t*32)*8*q,r=(st.kind==='flame'?9:6)+q*10;disk(c,x,y,r,st.color);disk(c,x-1,y-r*.15,r*.6,st.light);if(i%3===0)disk(c,x,y-2,r*.25,st.core)}
 }else if(st.kind==='lightning'){
  if(t>.16){const points=[[0,0]];for(let i=1;i<14;i++)points.push([len*i/14,(hash(Math.floor(t*18)*17+i)-.5)*30]);points.push([len,0]);line(c,points,st.color,9);line(c,points,st.light,4);line(c,points,'#fffbd7',1.5);for(let i=0;i<6;i++){const x=hash(i)*len;line(c,[[x,0],[x+13,-20],[x+7,-31]],st.light,2)}}
 }else if(st.kind==='leaves'||st.kind==='swarm'){
  for(let i=0;i<particles;i++){const q=clamp(travel*1.3-i*.025),x=q*len,y=Math.sin(q*10+i*.8)*24;c.save();c.translate(x,y);c.rotate(t*12+i);c.fillStyle=i%2?st.light:st.color;c.beginPath();c.ellipse(0,0,st.kind==='leaves'?8:3,3,0,0,TAU);c.fill();c.restore()}
 }else if(st.kind==='vines'){
  for(let j=-1;j<=1;j+=2){const points=[];for(let i=0;i<=28;i++){const q=i/28;points.push([q*len*travel,Math.sin(q*Math.PI*2-t*12)*20*j*q])}line(c,points,'#397c49',5);line(c,points,'#91c75c',2)}
 }else if(st.kind==='ice'){
  for(let i=0;i<particles;i++){const q=clamp(travel*1.4-i*.025);c.save();c.translate(q*len,(hash(i)-.5)*55);c.rotate(t*3+i);c.fillStyle=i%2?'#dcfdff':'#75d4ee';c.beginPath();c.moveTo(0,-11);c.lineTo(5,0);c.lineTo(0,11);c.lineTo(-5,0);c.closePath();c.fill();c.restore()}
 }else if(st.kind==='rings'||st.kind==='gust'){
  for(let i=0;i<7;i++){const q=clamp(travel*1.5-i*.08),x=q*len,r=8+q*22;c.strokeStyle=i%2?st.light:st.color;c.lineWidth=st.kind==='gust'?2:3;c.beginPath();c.ellipse(x,0,r*.35,r,0,0,TAU);c.stroke()}
 }else if(st.kind==='rocks'||st.kind==='meteor'){
  for(let i=0;i<7;i++){const q=clamp((t-i*.055)/.65),x=st.kind==='meteor'?len-65+q*65:len*travel+(hash(i)-.5)*30,y=st.kind==='meteor'?-105*(1-q)+(hash(i)-.5)*50:Math.sin(t*10+i)*15;c.save();c.translate(x,y);c.rotate(i+t);c.fillStyle=st.color;c.beginPath();for(let j=0;j<6;j++)c.lineTo(Math.cos(j*TAU/6)*10,Math.sin(j*TAU/6)*8);c.closePath();c.fill();line(c,[[-5,-3],[0,-5],[5,-2]],st.light,2);c.restore()}
 }else if(st.kind==='quake'||st.kind==='explosion'){
  c.translate(len,0);for(let i=0;i<4;i++){const q=clamp(t*1.5-i*.12);c.strokeStyle=i%2?st.light:st.color;c.lineWidth=4*(1-q)+1;c.beginPath();c.ellipse(0,0,q*95,q*(st.kind==='quake'?32:95),0,0,TAU);c.stroke()}shards(c,0,0,clamp(t*1.2),st,particles,90);if(st.kind==='explosion')disk(c,0,0,Math.sin(t*Math.PI)*35,st.core+'aa');
 }else if(st.kind==='slash'){
  if(t>.2){for(let i=-1;i<=1;i++){const q=clamp((t-.2)/.35),x=len-28+q*56;line(c,[[len-25+i*11,-28],[x+i*11,24*q]],st.color,7);line(c,[[len-25+i*11,-28],[x+i*11,24*q]],st.light,3)}}
 }else if(st.kind==='fangs'){
  if(t>.2)for(let i=-1;i<=1;i++)for(const sign of[-1,1]){const y=sign*(18-12*envelope);c.fillStyle=st.light;c.beginPath();c.moveTo(len+i*12-5,y-sign*7);c.lineTo(len+i*12+5,y-sign*7);c.lineTo(len+i*12,y+sign*7);c.closePath();c.fill()}
 }else if(st.kind==='punch'){
  for(let i=0;i<4;i++){const q=clamp((t-i*.07)/.5),x=len*q,y=(i%2?1:-1)*10;disk(c,x,y,9,st.color);c.fillStyle=st.light;c.fillRect(x-7,y-6,15,11);for(let j=0;j<3;j++)c.fillRect(x+3,y-8+j*5,6,4)}
 }else if(st.kind==='sparkles'){
  for(let i=0;i<particles;i++){const q=clamp(travel*1.5-i*.025);star(c,q*len,Math.sin(i+t*12)*26,4+hash(i)*4,i%2?st.light:st.core)}
 }else{
  line(c,[[0,0],[len*travel,0]],st.color+'77',5);if(t>.3)star(c,len,0,Math.sin(clamp((t-.3)/.7)*Math.PI)*32,st.light);
 }
 c.restore();if(impact>0){c.save();c.globalAlpha=1-impact;shards(c,to.x,to.y,impact,st,particles,36*scale);if(!reducedMotion){c.strokeStyle=st.light;c.lineWidth=2;c.beginPath();c.arc(to.x,to.y,impact*25*scale,0,TAU);c.stroke()}c.restore()}
}
export function drawPokeball(c,x,y,size,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);const r=size/2;c.fillStyle='#fff2da';c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.fillStyle='#e65f60';c.beginPath();c.arc(0,0,r,Math.PI,TAU);c.fill();c.strokeStyle='#24394b';c.lineWidth=Math.max(1,size*.09);c.beginPath();c.arc(0,0,r,0,TAU);c.moveTo(-r,0);c.lineTo(r,0);c.stroke();disk(c,0,0,size*.19,'#24394b');disk(c,0,0,size*.1,'#fff5df');c.restore()}
export function drawRelease(c,from,to,t,{reducedMotion=false}={}){if(t<0||t>1)return;const flight=clamp(t/.55),x=from.x+(to.x-from.x)*flight,y=from.y+(to.y-from.y)*flight-Math.sin(flight*Math.PI)*(reducedMotion?8:58);if(t<.56)drawPokeball(c,x,y,12,flight*Math.PI*4);if(t>.48){const q=clamp((t-.48)/.52);c.save();c.globalAlpha=1-q;c.strokeStyle='#a6e9ff';c.lineWidth=3;c.beginPath();c.arc(to.x,to.y,8+q*43,0,TAU);c.stroke();shards(c,to.x,to.y,q,{color:'#7dd7fa',light:'#fff5bd'},reducedMotion?6:18,55);disk(c,to.x,to.y,(1-q)*15,'#d4f5ff');c.restore()}}
