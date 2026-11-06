const W=480,H=270,DURATION=32;
const output=document.querySelector('canvas'),out=output.getContext('2d');
const stage=document.createElement('canvas');stage.width=W;stage.height=H;
const c=stage.getContext('2d'),images=new Map(),geometry=new Map();
let sprites;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
const hash=(n,k=0)=>{const v=Math.sin(n*91.173+k*37.449)*43758.5453;return v-Math.floor(v)};
const px=(x,y,w,h,color,alpha=1)=>{c.globalAlpha=alpha;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));c.globalAlpha=1};
function ellipse(x,y,rx,ry,color,alpha=1){c.globalAlpha=alpha;c.fillStyle=color;for(let yy=-ry;yy<=ry;yy+=2){const ww=rx*Math.sqrt(Math.max(0,1-(yy/ry)**2));c.fillRect(Math.round(x-ww),Math.round(y+yy),Math.round(ww*2),2)}c.globalAlpha=1}
async function load(src){if(images.has(src))return images.get(src);const image=new Image();image.src=src;await image.decode();images.set(src,image);return image}
function frameInfo(id,kind,dir,time,oneShot=false){
 const mode=sprites[id][kind]||sprites[id].Idle,im=images.get(mode.src),sum=mode.durations.reduce((a,b)=>a+b,0);
 let tt=oneShot?clamp(time/sum)*sum:((time%sum)+sum)%sum,index=0;
 while(index<mode.frames-1&&tt>=mode.durations[index])tt-=mode.durations[index++];
 const key=id+':'+kind+':'+dir+':'+index;
 if(!geometry.has(key)){
  const a=document.createElement('canvas');a.width=mode.w;a.height=mode.h;const ac=a.getContext('2d',{willReadFrequently:true});
  ac.drawImage(im,index*mode.w,dir*mode.h,mode.w,mode.h,0,0,mode.w,mode.h);
  const data=ac.getImageData(0,0,a.width,a.height).data;let min=mode.w,max=0,bottom=0,top=mode.h;
  for(let y=0;y<mode.h;y++)for(let x=0;x<mode.w;x++)if(data[(y*mode.w+x)*4+3]>32){min=Math.min(min,x);max=Math.max(max,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
  geometry.set(key,{canvas:a,cx:(min+max+1)/2,bottom:bottom+1,top});
 }
 return {...geometry.get(key),mode,index};
}
function mon(id,kind,dir,x,y,scale,time,options={}){
 const f=frameInfo(id,kind,dir,time,options.oneShot),xx=x-f.cx*scale,yy=y-f.bottom*scale;
 c.save();c.globalAlpha=options.alpha??1;
 if(options.tint){
  const mask=document.createElement('canvas');mask.width=f.mode.w;mask.height=f.mode.h;const mc=mask.getContext('2d');
  mc.drawImage(f.canvas,0,0);mc.globalCompositeOperation='source-in';mc.fillStyle=options.tint;mc.fillRect(0,0,mask.width,mask.height);
  c.drawImage(mask,Math.round(xx),Math.round(yy),f.mode.w*scale,f.mode.h*scale);
 }else c.drawImage(f.canvas,Math.round(xx),Math.round(yy),f.mode.w*scale,f.mode.h*scale);
 c.restore();
 return f.index;
}
function background(name,scale=1,x=0,y=0){
 c.fillStyle='#131a3d';c.fillRect(0,0,W,H);
 const im=images.get(name);c.drawImage(im,(W-W*scale)/2+x,(H-H*scale)/2+y,W*scale,H*scale);
}
function camera(scale,x=240,y=140,shake=0,t=0){c.translate(x,y);c.scale(scale,scale);c.translate(-x+Math.sin(t*71)*shake,-y+Math.cos(t*83)*shake*.55)}
function cloud(x,y,w,h,color,seed=0,alpha=1){
 c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();
 const steps=Math.ceil(w/4),edge=(p,bottom=false)=>{
  const envelope=Math.sin(p*Math.PI)**.55;
  const lobes=.35+.30*Math.sin(p*13+seed)**2+.22*Math.sin(p*7+seed*.5)**2;
  return Math.round((y+h*.48+(bottom?1:-1)*h*envelope*lobes)/2)*2;
 };
 for(let k=0;k<=steps;k++){const p=k/steps,xx=Math.round(x+p*w),yy=edge(p);if(k===0)c.moveTo(xx,yy);else{c.lineTo(xx,edge((k-1)/steps));c.lineTo(xx,yy)}}
 for(let k=steps;k>=0;k--){const p=k/steps,xx=Math.round(x+p*w),yy=edge(p,true);c.lineTo(xx,yy);if(k)c.lineTo(Math.round(x+(k-1)/steps*w),yy)}
 c.closePath();c.fill();
 c.globalAlpha=1;
}
function burst(x,y,age,color='#e2f9ff',strength=1){
 if(age<0||age>1.2)return;
 for(let i=0;i<26;i++){const a=hash(i,2)*Math.PI*2,speed=(18+hash(i,3)*66)*strength,xx=x+Math.cos(a)*speed*age,yy=y+Math.sin(a)*speed*age+age*age*26,size=(i%3===0?4:2)*(1-age*.55);px(xx,yy,size,size,color,(1-age/1.2)*.9)}
 if(age<.2){const r=(8+age*140)*strength;for(let i=0;i<12;i++){const a=i*Math.PI/6;px(x+Math.cos(a)*r,y+Math.sin(a)*r,5,3,color,1-age/.2)}ellipse(x,y,15*(1-age/.2),11*(1-age/.2),'#efffff',.8*(1-age/.2))}
}
function glow(x,y,r,color='#69ff8a',a=1){
 ellipse(x,y,r*1.6,r*1.2,color,a*.07);ellipse(x,y,r*1.18,r*.9,color,a*.13);ellipse(x,y,r,r*.72,color,a*.2);
}
function orb(x,y,color,core,tail=0,alpha=1){
 c.save();c.globalAlpha=alpha;
 for(let i=tail;i>0;i--){px(x-i*4,y-i*.15,5,5,color,(1-i/(tail+1))*.7*alpha)}
 glow(x,y,11,color,.8*alpha);ellipse(x,y,8,7,color,alpha);px(x-4,y-4,8,8,core,alpha);px(x-2,y-5,3,3,'#ffffff',alpha);
 c.restore();
}
function beam(x1,y1,x2,y2,type,t,a=1,width=12){
 const colors=type==='water'?['#2258b3','#3fbdf8','#ddfaff']:type==='green'?['#116f51','#51f5a4','#f2ffe0']:['#ab252a','#ff873b','#fff0a7'];
 const d=Math.hypot(x2-x1,y2-y1),steps=Math.ceil(d/4);
 for(let i=0;i<=steps;i++){const p=i/steps,x=mix(x1,x2,p),y=mix(y1,y2,p)+Math.sin(p*18-t*22)*1.1;px(x-width/2,y-width/2,width,width,colors[0],a*.8);px(x-width*.34,y-width*.28,width*.68,width*.56,colors[1],a);if((i+Math.floor(t*40))%6<4)px(x-width*.13,y-width*.13,width*.26,width*.26,colors[2],a)}
}
function wave(t,power=1){
 if(t<0||t>1)return;const x=mix(326,137,t),base=232;
 for(let j=0;j<13;j++){const z=j/12,top=base-Math.sin(z*Math.PI)*58*power;px(x-42+j*6,top,7,base-top,'#2252b2',.9);px(x-42+j*6,top+5,7,Math.max(4,(base-top)*.55),'#3f9bda',.9);px(x-42+j*6,top-3,8,5,'#b9f5ff',.95)}
 for(let i=0;i<12;i++)px(x-32+hash(i,4)*60,base-20-hash(i,5)*70,3,5,'#b9f5ff',Math.sin(t*Math.PI));
}
function steam(x,y,age,size=1){
 if(age<0||age>2.5)return;const a=Math.sin(clamp(age/2.5)*Math.PI)*.7;
 for(let k=0;k<8;k++){const xx=x+Math.sin(k*3.7)*age*19,yy=y-age*18+Math.cos(k*2.5)*9;ellipse(xx,yy,(10+age*12)*size,(8+age*9)*size,k%2?'#aabbd0':'#e7f4ed',a*(k%2?.5:.4))}
}
function rain(t,a=.25){for(let i=0;i<95;i++){const x=(hash(i,8)*W-t*75+W*20)%W,y=(hash(i,9)*H+t*(135+hash(i,6)*45))%H;px(x,y,1,7,'#8aa8d5',a)}}
function lavaSpikes(age){
 if(age<0||age>1.6)return;const e=Math.sin(clamp(age/1.6)*Math.PI);
 for(let i=0;i<5;i++){const x=201+i*27,hh=(25+hash(i,1)*40)*e;for(let y=0;y<hh;y+=3){const ww=(1-y/hh)*18+3;px(x-ww/2,229-y,ww,3,'#f46b31',.96);px(x-ww*.2,229-y,ww*.4,3,'#ffcc6c',.9)}}
}

const CUTS=[0,6,12,18,24],REVEAL=24.35,CRY=25.3;
function fade(a,color='#000000'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function spark(x,y,r,color,a=1){px(x-r,y,2*r+1,1,color,a);px(x,y-r,1,2*r+1,color,a);px(x,y,1,1,'#ffffff',a)}
// The approved opening shot is preserved; no encounter or DNA collection is reused.
function discovery(t){
 c.save();camera(1+ease(t/6)*.065,240,140);background('mural.png');
 for(let i=0;i<14;i++){const x=(hash(i,3)*100+t*3)%100,y=132+hash(i,4)*25;px(x,y,4,1,'#d9fff9',.35)}
 for(let i=0;i<16;i++){const x=hash(i,5)*480,y=140+(hash(i,6)*120+t*4)%120;px(x,y,1,1,'#fff9c6',.25)}
 px(124,176,4,3,'#a8ffe1',.3+.2*Math.sin(t*3)**2);c.restore();
 if(t<.5)fade(1-t/.5);if(t>5.7)fade(ease((t-5.7)/.3));
}
// Catmull-Rom paths keep velocity continuous across bends; the sprite itself never
// changes proportions. All eight directional native frames are available.
const FLOOR_PATH=[[-32,172],[76,153],[171,186],[284,151],[350,174],[251,184],[379,141],[520,134]];
const CANOPY_PATH=[[8,176],[99,143],[183,117],[278,104],[378,87],[293,85],[386,86],[510,90]];
const APPROACH_PATH=[[46,216],[119,193],[202,174],[310,165],[331,150],[274,157],[243,164]];
function pathAt(points,u){
 const p=clamp(u)*(points.length-1),i=Math.min(points.length-2,Math.floor(p)),v=p-i;
 const a=points[Math.max(0,i-1)],b=points[i],d=points[i+1],e=points[Math.min(points.length-1,i+2)];
 return [0,1].map(k=>.5*((2*b[k])+(-a[k]+d[k])*v+(2*a[k]-5*b[k]+4*d[k]-e[k])*v*v+(-a[k]+3*b[k]-3*d[k]+e[k])*v*v*v));
}
function silhouette(x,y,scale,t,dir=6,alpha=1){
 mon(151,'Walk',dir,x,y,scale,t*.82,{tint:'#081824',alpha});
}
function direction(points,u){return pathAt(points,Math.min(.999,u+.003))[0]>=pathAt(points,Math.max(0,u-.003))[0]?6:2}
function cutout(name,points,dx=0,dy=0){
 c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x+dx,y+dy):c.moveTo(x+dx,y+dy));c.closePath();c.clip();c.drawImage(images.get(name),dx,dy,W,H);c.restore();
}
function leaves(t,x,y,density=10,wind=1,alpha=.8){
 for(let i=0;i<density;i++){
  const age=(t*.4+i*.17)%1,xx=x+(age-.5)*92*wind+Math.sin(i*2.8+t)*7,yy=y+(i%3-1)*10+Math.sin(age*6.28+i)*8;
  polygon([[xx-3,yy],[xx,yy-2],[xx+5,yy+1],[xx+1,yy+3]],i%2?'#477e3b':'#9ac655',Math.sin(age*Math.PI)*alpha);
 }
}
function motes(t,bright=false){
 for(let i=0;i<24;i++){const x=(hash(i,51)*480+t*(1.2+hash(i,52)*3))%480,y=35+(hash(i,53)*210-t*2+600)%210;px(x,y,1,i%5?1:2,bright?'#fff5b2':'#b4e6b5',.12+.16*Math.sin(t+i)**2)}
}
function jungleFloor(t){
 const u=t/6,[x,y]=pathAt(FLOOR_PATH,u),dir=direction(FLOOR_PATH,u);
 c.save();camera(1.13,240,153);c.translate(-8+u*16,0);background('floor.png');
 // Native dark body + long tail, no pink or blue details before the clearing.
 silhouette(x,y,1.62,t,dir);
 // Original tree pixels pass in FRONT of the moving shadow.
 cutout('floor.png',[[21,0],[88,0],[84,106],[119,151],[151,174],[37,176],[38,100]]);
 cutout('floor.png',[[394,0],[459,0],[455,161],[367,175],[393,130]]);
 cutout('floor.png',[[0,199],[50,196],[105,224],[148,270],[0,270]],Math.sin(t)*2,0);
 cutout('floor.png',[[395,192],[480,181],[480,270],[354,270]],-Math.sin(t*.8)*2,0);
 leaves(t,x-12,y+3,9,dir===6?1:-1,.8);motes(t);c.restore();
 if(t<.25)fade(1-t/.25);
 return {x,y,dir};
}
function canopy(t){
 const u=t/6,[x,y]=pathAt(CANOPY_PATH,u),dir=direction(CANOPY_PATH,u);
 c.save();camera(1.12,240,120);c.translate(-5+u*10,3-u*6);background('canopy.png');
 silhouette(x,y,1.62,t+6,dir);
 cutout('canopy.png',[[0,0],[83,0],[108,44],[97,119],[48,147],[0,150]]);
 cutout('canopy.png',[[413,0],[480,0],[480,139],[456,116],[434,71]]);
 leaves(t,x-8,y+6,12,dir===6?1:-1,.85);
 // Distant river shimmer; foreground vines sway by at most two pixels.
 for(let i=0;i<13;i++)px(191+hash(i,8)*37,185+hash(i,9)*31,2+(i%2),1,'#cefff2',.15+.14*Math.sin(t*2+i)**2);
 cutout('canopy.png',[[136,0],[149,0],[148,124],[139,122]],Math.sin(t*.9)*1.4,0);
 motes(t+6);c.restore();return {x,y,dir};
}
function approach(t){
 const u=t/6,[x,y]=pathAt(APPROACH_PATH,u),scale=mix(1.65,1.25,ease(u));
 c.save();camera(1+ease(u)*.24,240,158);background('clearing.png');
 silhouette(x,y,scale,t+12,direction(APPROACH_PATH,u));
 cutout('clearing.png',[[0,0],[56,0],[77,94],[76,174],[103,227],[0,270]]);
 cutout('clearing.png',[[420,0],[480,0],[480,270],[375,235],[403,185],[417,100]]);
 cutout('clearing.png',[[0,222],[108,217],[185,270],[0,270]],Math.sin(t*.6)*2,0);
 leaves(t,x,y+5,6,1,.55*(1-u));motes(t+12,true);c.restore();return {x,y,dir:0};
}
function reveal(t){
 const p=ease((t-.12)/.8),entry=ease((t-.35)/2.4);
 // Continuous with the last approach frame, then Mew floats closer to the viewer.
 c.save();camera(1.24,240,158);background('clearing.png');
 const x=mix(243,240,entry)+Math.sin(t*1.35)*3*entry,y=mix(164,194,entry)+Math.sin(t*1.9)*2,scale=mix(1.25,3.9,entry);
 ellipse(x,209,10+entry*17,3,'#245941',.16+entry*.12);
 glow(x,y-27,25+entry*13,'#ffd3ec',.14*p);
 // A silhouette becomes the real native sprite; this is the first colored Mew.
 mon(151,'Idle',0,x,y,scale,t*.55,{tint:'#081824',alpha:1-p});
 mon(151,'Idle',0,x,y,scale,t*.55,{alpha:p});
 if(t>.1&&t<2){for(let i=0;i<12;i++){const age=t-.1,a=i*2.399,r=12+age*21;spark(x+Math.cos(a)*r,y-23+Math.sin(a)*r*.7,1+i%2,i%2?'#f8c6e5':'#fff5c9',Math.max(0,1-age/1.9)*.7)}}
 for(let i=0;i<15;i++)px(142+hash(i,5)*192,122+hash(i,9)*12,2,1,'#d8ffdf',.1+.1*Math.sin(t*2+i)**2);
 motes(t+18,true);c.restore();
 return {x,y,scale,colorAlpha:p};
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot,shadow=null,revealed=null;
 if(t<6){shot=1;discovery(t)}else if(t<12){shot=2;shadow=jungleFloor(t-6)}else if(t<18){shot=3;shadow=canopy(t-12)}else if(t<24){shot=4;shadow=approach(t-18)}else{shot=5;revealed=reveal(t-24)}
 if(t>31.4)fade(ease((t-31.4)/.6));
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,shot,species:151,shadow,shadowOnly:t>=6&&t<24.12,mewVisible:t>=REVEAL,revealed,dnaCollection:false,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['mural.png','floor.png','canopy.png','clearing.png'].map(load));document.querySelector('#status').hidden=true;render(0)})();
window.mewFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,paths:{floor:FLOOR_PATH,canopy:CANOPY_PATH,approach:APPROACH_PATH}};await ready;
