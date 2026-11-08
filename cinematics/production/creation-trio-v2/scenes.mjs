const ID=Number(new URLSearchParams(location.search).get('id'))||483;
const FILM_DURATION=32,REVEAL=24,CRY=25.4;
const CONFIG={483:{name:'Dialga',title:'Le Premier Battement',plate:'time.png',color:'#87e7ff',dark:'#082a42'},484:{name:'Palkia',title:'Au-delà des frontières',plate:'space.png',color:'#ffb4ed',dark:'#372145'},487:{name:'Giratina',title:'De l’autre côté',plate:'distortion.png',color:'#edc469',dark:'#171324'}};
const cfg=CONFIG[ID];
function ring(x,y,rx,ry,t,color,alpha=1){const pts=[];for(let i=0;i<=90;i++){const a=i/90*Math.PI*2;pts.push([x+Math.cos(a)*rx,y+Math.sin(a)*ry])}line(pts,color,2,alpha);for(let i=0;i<12;i++){const a=i*Math.PI/6+t;line([[x+Math.cos(a)*(rx-3),y+Math.sin(a)*(ry-3)],[x+Math.cos(a)*(rx+3),y+Math.sin(a)*(ry+3)]],color,1,alpha*.7)}}
function stars(t,color='#e7d4fa',flow=1){for(let i=0;i<86;i++){const z=.2+hash(i,7),x=(hash(i,6)*480+t*flow*z*8+4800)%480,y=hash(i,8)*200;spark(x,y,i%11===0?2:0,color,(.25+Math.sin(t*z+i)**2*.55))}}
function rift(t,color,p=1){const pts=[];for(let i=0;i<28;i++){const q=i/27;pts.push([240+Math.sin(q*16+t*3)*(2+q*4),mix(131,24+q*216,p)])}line(pts,color,7,p*.25);line(pts,'#fff1ff',2,p*.9)}
function debris(t,color,reverse=false,frozen=false){for(let i=0;i<22;i++){let q=(t*.19+hash(i,30))%1;if(reverse)q=1-q;if(frozen)q=hash(i,30);const a=hash(i,31)*Math.PI*2,x=240+Math.cos(a)*(14+q*156),y=143+Math.sin(a)*(12+q*94),s=2+hash(i,32)*7;polygon([[x-s,y],[x,y-s],[x+s,y],[x+s*.4,y+s]],i%3?'#344059':color,.8);line([[x-s,y],[x,y-s],[x+s,y]],color,1,.65)}}
function timeDial(t,x=240,y=124,r=71,a=1){ring(x,y,r,r,t*.25,'#65cfe9',a*.6);ring(x,y,r-8,r-8,-t*.35,'#d4f7ff',a*.35);for(let i=0;i<60;i++){const ang=i*Math.PI/30,rr=r-(i%5===0?8:4);line([[x+Math.sin(ang)*rr,y-Math.cos(ang)*rr],[x+Math.sin(ang)*r,y-Math.cos(ang)*r]],'#a7f4ff',1,a*.55)}const angle=t*1.3;line([[x,y],[x+Math.sin(angle)*r*.7,y-Math.cos(angle)*r*.7]],'#c2f7ff',2,a*.8);line([[x,y],[x+Math.sin(angle*.12)*r*.4,y-Math.cos(angle*.12)*r*.4]],'#a7e2fa',3,a*.8);lightBall(x,y,3,'#a3edff',a)}
function portal(t,x,y,rx,ry,color,p=1){ellipse(x,y,rx,ry,'#0a112a',p*.85);ring(x,y,rx,ry,t*.23,color,p);ring(x,y,rx+3,ry+3,-t*.2,'#e5d7ff',p*.4);for(let i=0;i<15;i++){const a=i/15*Math.PI*2+t*.5;spark(x+Math.cos(a)*rx,y+Math.sin(a)*ry,1,color,p*.65)}}
function opening(t){
 let rotation=0,darkness=0;
 if(ID===487){rotation=ease((t-2.4)/2.3)*Math.PI;c.save();c.translate(240,135);c.rotate(rotation);const s=1+Math.sin(rotation)*.9;c.scale(s,s);c.translate(-240,-135);forging(Math.min(t,4.6));c.restore();darkness=ease((t-4.35)/2.3);for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r=(1-darkness)*365;const x=240+Math.cos(a)*r,y=135+Math.sin(a)*r;ellipse(x,y,43+darkness*78,28+darkness*65,'#100c1d',.98);line([[x,y],[240+Math.cos(a)*r*.45,135+Math.sin(a)*r*.45]],'#251526',6,darkness*.4)}if(t>6.4)fade(ease((t-6.4)/.55))}
 else forging(t);
 return{rotation,darkness};
}
function timeFilmV1(t){
 if(t<9){background('pillar.png');const u=t-5,p=ease(u/3);redChain(t,1,240,147,82+u*8,29+u*3,1-p*.8);rift(t,cfg.color,p);debris(t,cfg.color);if(u<.35)fade(1-ease(u/.35),'#f2deef');return 2}
 if(t<14){const u=t-9;c.save();camera(1+u*.018,240,140);background('time.png');stars(0,'#92d7ea',0);timeDial(u<2?u:2);debris(2,cfg.color,false,true);for(let i=0;i<14;i++){const x=50+hash(i,3)*380,y=50+hash(i,4)*150;px(x,y,2,4,'#bceafb',.6)}c.restore();if(u<.45)fade(1-ease(u/.45),cfg.color);return 3}
 if(t<19){const u=t-14;background('pillar.png');fade(.26,'#082444');debris(u,cfg.color,true);timeDial(-u*3,240,125,89,.8);for(let i=0;i<8;i++){const p=ease(u/4.4),x=90+i*44,y=mix(210+hash(i,2)*30,90+hash(i,3)*80,p);polygon([[x,y],[x+13,y-6],[x+18,y+4],[x+3,y+9]],'#536f8b',.8)}glow(240,148,110,cfg.color,.35);if(u>4.4)fade(ease((u-4.4)/.6),cfg.color);return 4}
 background('time.png');const u=t-19;timeDial(-u*.4,240,117,78,1-ease(u/4.5));ring(240,130,70+u*14,70+u*14,u,cfg.color,.8*(1-u/5));spirit(ID,t,240,224,layouts[ID].scale,.2+ease(u/4)*.6,cfg.dark);glow(240,132,80,cfg.color,.4+ease(u/5)*.5);if(u>4.3)fade(ease((u-4.3)/.7),cfg.color);return 5;
}
function spaceFilmV1(t){
 if(t<9){const u=t-5;background('pillar.png');redChain(t,1,240,147,82,29,1-ease(u/3));for(let i=0;i<4;i++)portal(t,240+(i-1.5)*24,130,5+ease(u/3)*(25+i*14),20+ease(u/3)*(28+i*8),cfg.color,ease(u/2)*.7);rift(t,cfg.color,ease(u/3));if(u<.35)fade(1-ease(u/.35),'#f2deef');return 2}
 if(t<14){const u=t-9;background('space.png',1+u*.025,-u*2,0);stars(u,cfg.color,2);for(let i=3;i>=0;i--){const p=(u*.25+i*.25)%1;portal(t,240+Math.sin(u*.4+i)*25,124,15+p*245,22+p*180,cfg.color,(1-p)*.5)}if(u<.45)fade(1-ease(u/.45),cfg.color);return 3}
 if(t<19){const u=t-14;background('space.png',1.9,-80-u*3,95);fade(.5,'#101029');stars(u,cfg.color,8);for(let i=0;i<3;i++){const x=360-i*155-u*(8+i*9),y=50+i*65,r=17+i*10;glow(x,y,r*1.4,cfg.color,.25);ellipse(x,y,r,r,['#344e85','#805e9b','#bc8c94'][i],.9);for(let j=0;j<9;j++){const yy=-r+j*r/4,ww=Math.sqrt(Math.max(0,r*r-yy*yy));line([[x-ww,y+yy],[x+ww,y+yy]],j%2?'#535681':'#b1a0c0',2,.25)}ellipse(x+r*.35,y+r*.15,r*.7,r*.9,'#151c38',.55);ring(x,y,r*1.7,r*.4,u,cfg.color,.3)}for(let i=0;i<5;i++){const p=(u*.18+i*.2)%1;portal(t,240,132,5+p*350,9+p*230,cfg.color,(1-p)*.5)}if(u>4.4)fade(ease((u-4.4)/.6),'#fbe0ff');return 4}
 const u=t-19;background('space.png');stars(u,cfg.color,1);portal(t,240,133,57+u*7,80+u*5,cfg.color);spirit(ID,t,240,224,layouts[ID].scale,.2+ease(u/4)*.6,cfg.dark);lightBall(240,130,6+ease(u/5)*21,cfg.color,.8);if(u>4.3)fade(ease((u-4.3)/.7),cfg.color);return 5;
}
function waterfall(t,x,y,h,up=false){for(let i=0;i<6;i++){const yy=y+((t*(up?-31:31)+i*h/6+999*h)%h);line([[x-7,yy],[x-3,yy+12],[x+4,yy+19]],i%2?'#8baacf':'#455c91',2,.55)}}
function distortionFilm(t){
 if(t<12){const u=t-7;c.save();camera(1+u*.045,240,138);background('distortion.png');stars(t,'#ac8ba4',-.5);waterfall(u,328,70,108,true);c.restore();for(let i=0;i<4;i++){const x=50+i*140-u*(5+i*2),y=245-i%2*20;polygon([[x-35,y],[x+35,y-9],[x+48,y+7],[x,y+34]],'#191a30',.9)}if(u<.65)fade(1-ease(u/.65));return 3}
 if(t<17){const u=t-12;c.save();c.translate(240,135);c.rotate(-Math.PI/2+u*.035);c.scale(1.85,1.85);c.translate(-240,-135);background('distortion.png',1.04,u*3,-u*2);waterfall(u,328,70,125,true);c.restore();for(let i=0;i<20;i++){const x=(hash(i,14)*540-u*9+540)%540-30,y=hash(i,15)*270;px(x,y,2,2,'#e3c078',.4)}if(u<.3)fade(1-ease(u/.3));return 4}
 if(t<21){const u=t-17;background('distortion.png',1.23,25,12);fade(.53,'#080612');const x=mix(-65,545,ease(u/4)),y=154+Math.sin(u*1.2)*22;spirit(ID,t,x,y,layouts[ID].scale*.7,.75,'#03040c');glow(x,y-63,24,'#de455e',.65);ellipse(x-7,y-63,3,1,'#fa626b');ellipse(x+7,y-63,3,1,'#fa626b');if(u<.35)fade(1-ease(u/.35));if(u>3.6)fade(ease((u-3.6)/.4));return 5}
 const u=t-21;background('distortion.png');fade(.25,'#070512');portal(t,240,139,52+u*9,73+u*7,'#af273e',ease(u/1.8));debris(t,'#d49a48',true);spirit(ID,t,240,225,layouts[ID].scale,ease(u/2)*.8,'#090913');if(u>2.4)fade(ease((u-2.4)/.6),'#e8bd6b');return 6;
}
function revelation(t){
 const u=t-24,a=ease(u/.8);background(cfg.plate);stars(t,cfg.color,.4);glow(240,135,105,cfg.color,.32);
 if(ID===483){ring(240,137,103,103,t*.12,cfg.color,.3);for(let i=0;i<10;i++)spark(90+i*33,54+Math.sin(i+t*.3)*10,1,cfg.color,.6)}
 else if(ID===484){ring(240,132,88,106,t*.1,cfg.color,.35);ring(240,132,106,72,-t*.1,cfg.color,.2)}
 else{waterfall(t,328,70,108,true);ring(240,222,105,16,-t*.3,'#c39357',.4)}
 const x=240+Math.sin(u*.8)*2,y=224-(ID===487?Math.sin(u*1.4)*3:0);spirit(ID,t,x,y,layouts[ID].scale,a);motes(t,cfg.color,a*.8);if(u<.8)fade(1-ease(u/.8),ID===487?'#e8bd6b':cfg.color);if(u>7.4)fade(ease((u-7.4)/.6));return{alpha:a,x,y};
}
// Revised Dialga transition: an actual frozen scene followed by an exact backwards
// traversal of the opening's scene time, accompanied by reversed opening PCM.
function dialgaTransition(t){
 if(t<5.25){forging(4.25);return{shot:2,phase:'freeze',sceneTime:4.25,clock:false}}
 if(t<6.25){forging(4.25);const p=ease((t-5.25)/.7);fade(p*.28,'#08152a');timeDial(0,240,132,83,p);return{shot:2,phase:'clock',sceneTime:4.25,clock:true}}
 if(t<10.5){const q=Math.max(0,10.5-t);forging(q);if(q<.25)fade(1-ease(q/.25));fade(.12,'#08152a');timeDial(-(t-6.25)*6.5,240,132,83,.8);if(t>10.22)fade(ease((t-10.22)/.28),'#ffffff');return{shot:3,phase:'rewind',sceneTime:q,clock:true}}
 if(t<11){fade(1,'#ffffff');return{shot:4,phase:'flash',sceneTime:0,clock:false}}
 const u=t-11;
 if(t<19){c.save();camera(1+u*.008,240,140);background('time.png');stars(0,'#92d7ea',0);timeDial(u*.25,240,124,71,.75);debris(2,cfg.color,false,true);c.restore();if(u<1.2)fade(1-ease(u/1.2),'#ffffff');return{shot:4,phase:'dimension',sceneTime:null,clock:true}}
 background('time.png');const v=t-19;timeDial(-v*.4,240,117,78,1-ease(v/4.5));ring(240,130,70+v*14,70+v*14,v,cfg.color,.8*(1-v/5));spirit(ID,t,240,224,layouts[ID].scale,.2+ease(v/4)*.6,cfg.dark);glow(240,132,80,cfg.color,.4+ease(v/5)*.5);if(v>4.3)fade(ease((v-4.3)/.7),cfg.color);return{shot:5,phase:'omen',sceneTime:null,clock:true};
}
const GLASS_POINTS=Array.from({length:6},(_,row)=>Array.from({length:9},(_,col)=>[col===0?0:col===8?480:col*60+(hash(row*9+col,62)-.5)*35,row===0?0:row===5?270:row*54+(hash(row*9+col,63)-.5)*27]));
const SHARDS=[];
for(let row=0;row<5;row++)for(let col=0;col<8;col++){const a=GLASS_POINTS[row][col],b=GLASS_POINTS[row][col+1],d=GLASS_POINTS[row+1][col],e=GLASS_POINTS[row+1][col+1];for(const pts of [[a,b,e],[a,e,d]]){const x=pts.reduce((s,p)=>s+p[0],0)/3,y=pts.reduce((s,p)=>s+p[1],0)/3;SHARDS.push({pts,x,y,i:SHARDS.length})}}
function glassCracks(progress=1){
 const cx=240,cy=134;
 for(let i=0;i<13;i++){
  const a=i/13*Math.PI*2,limit=330,p=clamp((progress-i*.019)*1.5),pts=[[cx,cy]];
  for(let j=1;j<=7;j++){const r=limit*j/7*p,dev=(hash(i*7+j,55)-.5)*20;pts.push([cx+Math.cos(a)*r+Math.sin(a)*dev,cy+Math.sin(a)*r-Math.cos(a)*dev])}
  line(pts,'#302037',3,1);line(pts,'#fff6ff',1,1);
  if(progress>.32)for(let j=2;j<6;j++){const point=pts[j],aa=a+(j%2?1:-1)*.7,len=clamp((progress-.3-j*.035)*3)*35;line([point,[point[0]+Math.cos(aa)*len,point[1]+Math.sin(aa)*len]],'#f9e8ff',1,.85)}
 }
 if(progress>.18)for(let i=0;i<5;i++)ring(cx,cy,7+i*5,5+i*4,0,'#fff3ff',clamp((progress-.18)*2)*.5);
}
let glassPlate;
function shatteredGlass(t){
 if(!glassPlate){forging(4.25);glassCracks(1);glassPlate=document.createElement('canvas');glassPlate.width=W;glassPlate.height=H;glassPlate.getContext('2d').drawImage(stage,0,0)}
 fade(1,'#ffffff');
 for(const shard of SHARDS){
  const {x,y,i,pts}=shard,dx=x-240,dy=y-134,dist=Math.hypot(dx,dy)||1,age=Math.max(0,t-hash(i,83)*.12),travel=age*age*190+age*45;
  c.save();c.globalAlpha=1-ease((age-.85)/.65);c.translate(x+dx/dist*travel,y+dy/dist*travel+age*age*43);c.rotate((hash(i,84)-.5)*age*3);c.scale(Math.max(.25,Math.cos(age*(1+hash(i,85)))),1);c.beginPath();pts.forEach(([xx,yy],j)=>j?c.lineTo(xx-x,yy-y):c.moveTo(xx-x,yy-y));c.closePath();c.clip();c.drawImage(glassPlate,-x,-y);c.restore();
 }
}
function palkiaTransition(t){
 if(t<6.3){forging(4.25);glassCracks(ease((t-4.25)/1.8));return{shot:2,phase:'cracks',white:0,shards:0}}
 if(t<8){shatteredGlass(t-6.3);return{shot:3,phase:'shatter',white:1,shards:SHARDS.length}}
 if(t<8.5){fade(1,'#ffffff');return{shot:3,phase:'white',white:1,shards:0}}
 if(t<11){const u=t-8.5; background('space.png',1+u*.02,-u*1.5,0);stars(u,cfg.color,1);const white=1-ease(u/2.5);fade(white,'#ffffff');return{shot:4,phase:'emergence',white,shards:0}}
 return{shot:spaceFilmV1(t),phase:t<19?'dimension':'omen',white:0,shards:0};
}

function render(time){
 const t=clamp(time,0,31.9999);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,openingInfo=null,reveal=null,transition=null;
 if(t<(ID===487?7:4.25)){shot=1;openingInfo=opening(t)}else if(t<24){if(ID===487)shot=distortionFilm(t);else{transition=ID===483?dialgaTransition(t):palkiaTransition(t);shot=transition.shot}}else{shot=7;reveal=revelation(t)}
 if(t<.25)fade(1-ease(t/.25));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:ID,shot,opening:openingInfo,transition,heroVisible:!!reveal&&reveal.alpha>.01,location:t<7?'spear-pillar':cfg.plate,revealAt:REVEAL,cryAt:CRY};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['pillar.png','time.png','space.png','distortion.png'].map(load));layouts=Object.fromEntries([480,481,482,483,484,487].map(id=>[id,layout(id)]));document.title=cfg.name+' — '+cfg.title;document.querySelector('#status').hidden=true;render(.8)})();
window.creationFilm={ready,render,duration:32,id:ID,config:cfg,layout:()=>layouts[ID],cryAt:CRY,revealAt:REVEAL};await ready;
