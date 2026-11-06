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
