const W=480,H=270,DURATION=21.6;
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
function battle(t){
 let gkind='Idle',gtime=t,kkind='Idle',ktime=t,gon=false,kon=false;
 if(t>=.65&&t<1.45){gkind='Shoot';gtime=(t-.65)*.8;gon=true}
 if(t>=1.35&&t<2.25){kkind='Swell';ktime=(t-1.35)*.65;kon=true}
 if(t>=2.65&&t<3.05){gkind='Hurt';gtime=t-2.65;gon=true}
 if(t>=3.1&&t<4.15){gkind='Emit';gtime=(t-3.1)*.68;gon=true}
 if(t>=3.65&&t<4.65){kkind='Shoot';ktime=(t-3.65)*.65;kon=true}
 const hit=Math.exp(-Math.abs(t-1.72)*16)+Math.exp(-Math.abs(t-4.42)*12);
 c.save();camera(1.015,240,155,hit*.9,t);background('01-battlefield.png',1.025);
 for(let i=0;i<9;i++){const x=200+(i*41+t*12)%290,y=205+i%3*18;px(x,y,16+(i%3)*6,1,'#417bc3',.28)}
 glow(94,229,54,'#ff6b36',.5+.3*Math.sin(t*2));
 ellipse(105,222,46,6,'#0a1424',.6);
 ellipse(358,240,72+Math.sin(t*5)*4,8,'#3e7ac8',.48);
 mon(383,gkind,1,104+(gkind==='Shoot'?Math.sin(clamp((t-.65)/.8)*Math.PI)*4:0),222,2.1,gtime,{oneShot:gon});
 mon(382,kkind,7,359,247+Math.sin(t*4)*2,2.2,ktime,{oneShot:kon});
 for(let i=0;i<4;i++){const xx=295+i*31;px(xx,239+Math.sin(t*6+i)*3,14,2,'#91cced',.58)}
 if(t>=1.01&&t<=1.74){const p=(t-1.01)/.73,x=mix(145,248,p),y=mix(139,175,p)-Math.sin(p*Math.PI)*22;orb(x,y,'#ff643c','#ffe18b',8)}
 wave((t-1.65)/1.15);
 burst(246,176,t-1.72,'#d5f5ff',1.3);burst(139,194,t-2.73,'#9edcff',.75);
 steam(247,164,t-1.75,.8);
 lavaSpikes(t-3.45);
 if(t>=3.94&&t<=4.67){const p=clamp((t-3.94)/.28),endX=mix(301,236,p),endY=mix(208,181,p);beam(301,208,endX,endY,'water',t,1,14)}
 if(t>=3.8&&t<=4.65){const p=clamp((t-3.8)/.65);beam(146,154,mix(146,241,p),mix(154,181,p),'fire',t,.9,10)}
 burst(240,180,t-4.42,'#ffe9ac',1.5);steam(240,173,t-4.45,1.3);
 rain(t,.18);c.restore();
 if(hit>.2)px(0,0,W,H,'#e5f6ff',hit*.075);
 if(t>5.73)px(0,0,W,H,'#080e20',clamp((t-5.73)/.27)*.18);
}
function summit(t){
 background('02-summit.png',1+ease(t/2.6)*.055,0,-ease(t/2.6)*2);
 cloud(-60+t*6,105,190,12,'#5c65a8',2,.12);cloud(345-t*4,130,200,14,'#8291c5',5,.1);
 if(t>1.95){const a=ease((t-1.95)/.65);glow(240,195,8,'#4bff9d',a*.45);px(239,193,2,2,'#a8ffd1',a*.7)}
}
function greenSpark(t,cx,cy,amplitude=1){
 for(let i=0;i<28;i++){const a=i*2.399+t*2.5,rr=(16+hash(i,4)*35)*(1-.45*ease(t/2));const xx=cx+Math.cos(a)*rr,yy=cy+Math.sin(a)*rr*.42;px(xx,yy,i%5?2:3,i%5?2:3,i%4?'#8dffc4':'#eeffe9',amplitude*(.45+.45*Math.sin(t*5+i)**2))}
}
function launch(t){
 const p=ease((t-.8)/1.9),follow=ease((t-1.6)/1.5)*150;
 background('02-summit.png',1.14,0,follow-3);
 cloud(-80+t*19,65+follow*.45,210,17,'#707ab9',2,.18);
 const baseY=196+follow,orbY=baseY-p*490;
 if(t<1.25){const a=ease(t/.7);glow(240,baseY,20+Math.sin(t*17)*2,'#61ffa5',a);ellipse(240,baseY,23+Math.sin(t*12)*3,6,'#4cd894',a*.45);greenSpark(t,240,baseY,a)}
 if(t>.75){const a=clamp((t-.75)/.45);beam(240,baseY,240,Math.max(-90,orbY),'green',t,a*(1-.25*p),10+p*8);glow(240,orbY,18,'#65ffc1',.85);ellipse(240,orbY,8,11,'#96ffd0',1);px(237,orbY-5,6,10,'#f2fff0')}
 if(t>1.25)for(let i=0;i<32;i++){const yy=((hash(i,1)*390+t*170)%450)-70;px(222+hash(i,2)*36,yy+follow*.1,2,8,'#8affc0',.6*(1-p*.5))}
 if(t>2.1){cloud(-30,30+(t-2.1)*180,W+60,50,'#444f87',0,.5);cloud(-30,-30+(t-2.1)*145,W+60,28,'#59659a',4,.45)}
 if(t>3.43)px(0,0,W,H,'#abffcd',Math.sin(clamp((t-3.43)/.37)*Math.PI)*.17);
}
// The same travelling light crosses the cloud layer, then reaches the bay.
function skyPath(t){
 const p=clamp(t/2.4);
 return {x:mix(110,429,ease(p)),y:mix(291,127,p)-Math.sin(p*Math.PI)*141};
}
function comet(t,path,tail=.38){
 const end=path(t);
 for(let i=22;i>0;i--){const p=path(Math.max(0,t-tail*i/22)),next=path(Math.max(0,t-tail*(i-1)/22));beam(p.x,p.y,next.x,next.y,'green',t,(1-i/24)*.85,Math.max(2,9-i*.28))}
 glow(end.x,end.y,22,'#60ffb1',.95);ellipse(end.x,end.y,7,9,'#abffd2');px(end.x-2,end.y-5,4,9,'#f4fff1');
 for(let i=0;i<16;i++){const p=path(Math.max(0,t-.05-hash(i,4)*tail));px(p.x+(hash(i,5)-.5)*20,p.y+(hash(i,6)-.5)*16,2,3,'#93ffbc',.6)}
 return end;
}
function crossing(t){
 background('04-clouds.png',1.04,-t*3,0);
 cloud(40-t*9,43,238,54,'#39497e',3,.7);
 comet(t,skyPath,.46);
 // Opaque foreground banks briefly hide the core: it actually passes through them.
 cloud(-18-t*17,173,264,74,'#536597',1,.98);
 cloud(176-t*12,50,235,72,'#465888',3,.98);
 const p=skyPath(t);
 if(t>.55&&t<1.8){const a=Math.sin(clamp((t-.55)/1.25)*Math.PI);glow(p.x,p.y,32,'#7dffc3',a*.8)}
 if(t>1.18&&t<1.72)burst(p.x-5,p.y+8,t-1.18,'#b3ffce',.65);
}
function arrivalPath(t){
 const p=ease(t/1.25);
 return {x:mix(430,240,p),y:mix(-31,91,p)-Math.sin(p*Math.PI)*15};
}
function reveal(t){
 const flashStart=1.45,flashPeak=1.72,flashEnd=2.32;
 const flash=t<flashStart?0:t<flashPeak?ease((t-flashStart)/(flashPeak-flashStart)):1-ease((t-1.84)/(flashEnd-1.84));
 const appear=ease((t-1.78)/.42),split=ease((t-1.25)/1.4);
 const shake=Math.exp(-Math.abs(t-1.75)*10)*1.5;
 c.save();camera(1.01,240,135,shake,t);background('01-battlefield.png',1.025);
 for(let i=0;i<9;i++){const x=190+(i*41+t*12)%300,y=210+i%3*17;px(x,y,18,1,'#417bc3',.28)}
 glow(83,236,43,'#ff6b36',.4);
 ellipse(90,239,34,5,'#0a1424',.65);
 ellipse(386,245,53+Math.sin(t*5)*3,6,'#3e7ac8',.5);
 mon(383,'Idle',1,90,239,1.62,t+6);
 mon(382,'Idle',7,386,251+Math.sin(t*3)*2,1.72,t+6);
 if(t<1.73)comet(t,arrivalPath,.33);
 if(t>1.05&&t<2.4)glow(240,92,30+clamp((t-1.05)/.65)*57,'#56ff9d',.9);
 cloud(118-split*215,45,253,64,'#465888',3,.92);
 cloud(280+split*160,75,204,45,'#344573',1,.8);
 if(appear>0){
  glow(240,100,70,'#50dc93',.42);
  const y=mix(194,183,appear)+Math.sin(t*2)*1.5;
  const roaring=t>=1.95&&t<3.5,kind=roaring?'RearUp':'Walk',at=roaring?(t-1.95)*.35:t*.55;
  mon(384,kind,1,240,y,2.21,at,{alpha:appear,oneShot:roaring});
 }
 if(t>1.72&&t<3.8){const age=t-1.72,r=15+age*130;for(let i=0;i<50;i++){const a=i*Math.PI/25;px(240+Math.cos(a)*r,98+Math.sin(a)*r*.7,5,3,i%3?'#8dffb3':'#f0ffe9',Math.max(0,1-age/2.08)*.85)}}
 rain(t+14,.12*(1-flash));c.restore();
 // One large green flash masks the change from light to Rayquaza.
 if(flash>0){px(0,0,W,H,'#68ff88',flash);ellipse(240,98,75+flash*250,45+flash*190,'#d5ffd2',flash*.92)}
 if(t>6.3)px(0,0,W,H,'#07101e',ease((t-6.3)/.5));
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;
 if(t<6){shot=1;battle(t)}else if(t<8.6){shot=2;summit(t-6)}else if(t<12.4){shot=3;launch(t-8.6)}else if(t<14.8){shot=4;crossing(t-12.4)}else{shot=5;reveal(t-14.8)}
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 window.rayFilm.current={time:t,shot,rayquazaVisible:t>=16.58,flashPeak:16.52,cryAt:16.85};return window.rayFilm.current;
}
const ready=(async()=>{sprites=await (await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(modes=>Object.values(modes).map(m=>m.src)))].map(load));await Promise.all(['01-battlefield.png','02-summit.png','04-clouds.png'].map(load));document.querySelector('#status').hidden=true;render(0)})();
window.rayFilm={ready,duration:DURATION,render,frameInfo,mon,stage,context:c};
await ready;
