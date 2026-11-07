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

function fade(a,color='#000000'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=clamp(alpha);c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function line(points,color,width=1,alpha=1){c.save();c.globalAlpha=clamp(alpha);c.strokeStyle=color;c.lineWidth=width;c.lineJoin='miter';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.stroke();c.restore()}
function spark(x,y,r,color,a=1){px(x-r,y,2*r+1,1,color,a);px(x,y-r,1,2*r+1,color,a);px(x,y,1,1,'#ffffff',a)}
function imageOverlay(name,alpha){c.save();c.globalAlpha=clamp(alpha);c.drawImage(images.get(name),0,0,W,H);c.restore()}
function flames(t,power){
 if(power<=0)return;
 const rows=[[219,178,306,7],[174,192,287,6],[132,201,279,5],[95,205,276,5],[65,215,267,4]];
 for(let r=0;r<rows.length;r++){
  const [base,left,right,count]=rows[r];
  for(let i=0;i<count;i++){
   const x=mix(left,right,i/(count-1)),phase=t*6+i*2.4+r*1.8,hh=(17+hash(i,r)*22+Math.sin(phase)*5)*power,ww=5+hash(i,r+3)*5;
   for(let y=0;y<hh;y+=2){const q=y/hh,w=(1-q)*ww+1,xx=x+Math.sin(phase-q*7)*q*4-q*3;
    px(xx-w,base-y,w*2,2,'#d94529',.85);if(q<.88)px(xx-w*.6,base-y,w*1.2,2,'#ff9b35',.95);if(q<.64)px(xx-w*.28,base-y,w*.56+1,2,'#ffe19b',.95);
   }
  }
  glow((left+right)/2,base-7,(right-left)*.42,'#ff8439',power*.12);
 }
 for(let i=0;i<48;i++){const age=(hash(i,6)+t*.24)%1,x=164+hash(i,7)*150+Math.sin(age*7+i)*7,y=219-age*200;px(x,y,1,2,i%3?'#ff9a45':'#ffe8ab',power*(1-age)*.7)}
}
function towerSmoke(t,amount=.4){
 for(let i=0;i<11;i++){
  const age=(t*.12+i*.143)%1,x=195+(i%4)*29+age*18,y=188-(i%3)*31-age*104;
  cloud(x-20,y,40+age*35,17+age*11,amount>.7?'#373443':'#a8b5c3',i,amount*(1-age)*.12);
 }
}
function puddles(t,a=.25){for(let i=0;i<16;i++){const p=(t*.75+i*.19)%1,x=70+hash(i,2)*350,y=246+hash(i,3)*17;line([[x-5*p,y],[x+5*p,y]],'#b9d7eb',1,(1-p)*a)}}
function dancer(row,x,y,height,pose,alpha=1,mirror=false){
 const entry=dancers[row],r=entry.poses[pose],s=height/entry.referenceHeight;
 c.save();c.globalAlpha=alpha;c.translate(x,y);if(mirror)c.scale(-1,1);
 c.drawImage(images.get(entry.src),r.x,r.y,r.w,r.h,Math.round(-r.anchorX*s),Math.round(-r.anchorY*s),r.w*s,r.h*s);c.restore();
}
const FILM_DURATION=30,CUTS=[0,2.5,7.5,8,13,17,21],CRY=22.4,STORM_AT=3.6,REVEAL=18.25;
let dancers,birdLayout;
const WOMEN=[{row:0,x:168,y:230,h:32},{row:1,x:240,y:215,h:31},{row:2,x:312,y:230,h:32},{row:3,x:136,y:258,h:35},{row:4,x:344,y:258,h:35}],BELLS=[9.15,11.75,14.2,21.2,25.6];
function lugia(kind,dir,x,y,scale,time,alpha=1,oneShot=false){
 const f=frameInfo(249,kind,dir,time,oneShot),anchor=frameInfo(249,kind,dir,0);
 c.save();c.globalAlpha=alpha;c.drawImage(f.canvas,Math.round(x-anchor.cx*scale),Math.round(y-anchor.bottom*scale),f.mode.w*scale,f.mode.h*scale);c.restore();return f.index;
}
function calmFire(t){
 c.save();camera(1+ease(t/2.5)*.025,240,150);background('calm.png');flames(t,.8+ease(t/2.5)*.3);towerSmoke(t,.7);c.restore();
}
function energyRing(x,y,r,t,a=1){
 const pts=[];for(let i=0;i<=40;i++){const angle=i*Math.PI/20;pts.push([x+Math.cos(angle)*r,y+Math.sin(angle)*r*.7])}line(pts,'#c8f8ff',1,a);glow(x,y,r*.7,'#81ccff',a*.2);
}
function stormSummon(t){
 const storm=ease((t-1.1)/1.8),age=t-2.1;
 // One lightning pulse at 4.6 s, synchronized with the existing thunder.
 const flash=age>=0&&age<.32?Math.min(1,age/.035)*(1-ease((age-.035)/.285)):0;
 c.save();camera(1.025,240,150);background('calm.png');
 // Build weather from the calm plate: no permanently painted lightning bolts.
 fade(storm*.36,'#101329');
 for(let side=0;side<2;side++)for(let row=0;row<4;row++){
  const x=(side?314:-58)+Math.sin(t*.3+row)*8,y=-20+row*27;
  cloud(x,y,228,42,'#22233f',row+side*7,storm*(.55+row*.08));
  cloud(x+13,y+6,191,26,'#515275',row+4,storm*.17);
 }
 const fire=1-ease((t-2)/2.5);flames(t+2.5,fire*1.1);towerSmoke(t+2.5,.3+fire*.4);
 if(storm>0){rain(t+2.5,storm*.35);puddles(t,storm*.3)}
 if(flash>0){
  fade(flash*.28,'#d9eaff');
  cloud(312,-10,184,119,'#becbe6',5,flash*.85);
  cloud(5,-16,165,105,'#8d9fc4',4,flash*.6);
  line([[35,0],[44,17],[38,23],[53,40],[47,47],[63,69]],'#e4f4ff',2,flash);
  line([[52,40],[36,49],[29,61]],'#c7dfff',1,flash*.75);
  // Source-in tint removes every coloured pixel, including the eyes and belly.
  mon(249,'Walk',0,385+age*12,80-age*5,1.22,t*.22,{tint:'#080b18',alpha:flash*.97});
  cloud(333,67,133,20,'#7385a4',2,flash*.33);
 }
 c.restore();if(t>4.7)fade(ease((t-4.7)/.3));
 return{storm,lugiaVisible:false,silhouetteVisible:flash>.01,flash,fire};
}

function dance(t){
 const sequence=[0,1,2,1,3,0,2,1],poses=[];
 for(let i=0;i<WOMEN.length;i++){
  const w=WOMEN[i],phase=(t/.65+(i%2)*.3)%sequence.length,k=Math.floor(phase),f=phase-k,a=ease((f-.84)/.16),pose=sequence[k],next=sequence[(k+1)%sequence.length],x=w.x+Math.sin(t*.7+i*.4)*1.8;
  ellipse(x,w.y+1,6.5,1.5,'#0d2638',.3);dancer(w.row,x,w.y,w.h,pose,1-a,i>2);if(a>0)dancer(w.row,x,w.y,w.h,next,a,i>2);poses.push(pose);
 }
 return poses;
}
function bellLight(absolute){
 for(const at of BELLS){const age=absolute-at;if(age<0||age>1.8)continue;energyRing(240,229,5+age*34,age,(1-age/1.8)*.65);glow(240,229,19,'#e2fbff',(1-age/1.8)*.45)}
}
function silverFeathers(t,power=.5,cx=240,cy=151){
 for(let i=0;i<22;i++){
  const age=(hash(i,15)+t*.12)%1,a=i*2.399+t*.32,rr=28+age*153,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.46-age*13,s=.7+hash(i,16)*.7;
  c.save();c.translate(Math.round(x),Math.round(y));c.rotate(a*.4);polygon([[-2*s,5*s],[-3*s,0],[0,-5*s],[2*s,-6*s],[3*s,-1*s],[1*s,4*s]],'#e2f7ff',power*Math.sin(age*Math.PI));line([[0,5*s],[1*s,-4*s]],'#7dc2de',1,power*.6);c.restore();
 }
}
function poolWaves(t,power=1,close=false){
 const cx=240,cy=close?229:164,rx=close?178:129,ry=close?33:23;
 for(let ring=0;ring<4;ring++){
  const pts=[];for(let i=0;i<=90;i++){const a=i/90*Math.PI*2+t*(.25+ring*.08),r=.25+ring*.2;pts.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r])}
  line(pts,ring%2?'#8ee8f5':'#388cb6',1,(.12+power*.17));
 }
 for(let i=0;i<24;i++){
  const age=(t*.17+i*.073)%1,a=i*2.399+t*(.8+power*.5),r=.15+age*.8,x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  px(x,y,2+i%3,1,'#d0fbff',power*(1-age)*.5);
 }
}
function mist(t,amount=.3){for(let i=0;i<5;i++)cloud(37+i*91+Math.sin(t*.4+i)*7,183+Math.sin(t*.6+i)*4,113,13,'#c1eefa',i,amount*.12)}
function waterCurtain(t,power=1,gap=0){
 for(let x=132;x<348;x+=3){
  if(Math.abs(x-240)<gap/2)continue;
  const phase=hash(x,9),edge=1-Math.abs(x-240)/116,top=23+24*Math.pow(Math.abs(x-240)/108,1.6),bottom=185+Math.sin(x*.13+t*2)*2;
  const base=edge>.55?'#59cbe1':edge>.2?'#2cafd0':'#228bb7';
  px(x,top,3,bottom-top,base,power*.95);px(x,top,3,5,'#c9f9ff',power*.75);
  for(let i=0;i<7;i++){
   const y=top+((phase*170+t*94+i*25)%(bottom-top)),hh=Math.min(bottom-y,10+hash(x,i)*24),dx=Math.sin(t*2+i+x*.1)*.6;
   px(x+dx,y,2,hh,i%3?'#99eff7':'#ecffff',power*(.55+edge*.3));
  }
  if(x%9===0)ellipse(x,bottom,5,3,'#d8fcff',power*.6);
 }
 ellipse(240,188,108,5,'#bdf6ff',power*.32);
}
function ritual(t){
 c.save();camera(1+ease(t/5)*.025,240,220);background('shrine.png');const poses=dance(t);bellLight(t+8);glow(240,228,13,'#cfebff',.2+ease(t/5)*.12);poolWaves(t,.3);silverFeathers(t,ease(t/3)*.45,240,199);mist(t,.25);c.restore();if(t<.25)fade(1-ease(t/.25));return poses;
}
function whirlpool(t){
 c.save();camera(1+ease(t/4)*.055,240,180);background('waterfall.png');waterCurtain(t,.6+ease(t/4)*.25);poolWaves(t+5,.35+ease(t/4)*.65,true);silverFeathers(t+5,.65,240,160);mist(t,.6);glow(240,145,56,'#83dcf4',ease(t/4)*.3);c.restore();
}
function emergence(t){
 background('waterfall.png');const open=ease((t-.5)/2.6),alpha=ease((t-1.25)/.5);
 const scale=mix(.7,birdLayout.scale,ease((t-1.1)/2.8)),x=mix(264,240,ease(t/3.5)),y=mix(170,birdLayout.targetY,ease(t/4));
 glow(240,132,58,'#b8edff',open*.35);lugia('Walk',0,x,y,scale,t*.7,alpha);
 waterCurtain(t+4,.9*(1-open*.5),open*204);poolWaves(t+9,1,true);silverFeathers(t+9,.65,240,145);mist(t,.8);
 if(t>3.65)fade(ease((t-3.65)/.35),'#d8f7ff');
 return{alpha,opening:open,scale};
}
function revelation(t){
 background('shrine.png');const poses=dance(t+5);bellLight(t+21);poolWaves(t+13,.45);silverFeathers(t+13,.55,240,136);mist(t,.3);
 glow(240,95,79,'#a1e9ff',.25);const y=birdLayout.targetY+Math.sin(t*1.6)*1.4,x=240+Math.sin(t*1.15)*1.3;lugia('Walk',0,x,y,birdLayout.scale,t*.7);
 if(t<.7)fade(1-ease(t/.7),'#d8f7ff');return{bird:{x,y,scale:birdLayout.scale},poses};
}
function render(time){
 const t=clamp(time,0,FILM_DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,stormState=null,poses=[],emerge=null,reveal=null;
 if(t<2.5){shot=1;calmFire(t)}else if(t<7.5){shot=2;stormState=stormSummon(t-2.5)}else if(t<8){shot=3;fade(1)}else if(t<13){shot=4;poses=ritual(t-8)}else if(t<17){shot=5;whirlpool(t-13)}else if(t<21){shot=6;emerge=emergence(t-17)}else{shot=7;reveal=revelation(t-21);poses=reveal.poses}
 if(t<.4)fade(1-ease(t/.4));if(t>29.4)fade(ease((t-29.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:249,shot,stormStrength:stormState?.storm||0,introLugiaVisible:false,introSilhouetteVisible:!!stormState?.silhouetteVisible,lightningStrength:stormState?.flash||0,stormCalled:t>=STORM_AT&&t<7.5,blackTransition:shot===3,dancers:poses.length,poses,emerge,reveal,finalLugiaVisible:!!reveal||!!emerge&&emerge.alpha>.01,stormAt:STORM_AT,revealAt:REVEAL,cryAt:CRY};
}
const ready=(async()=>{
 [sprites,dancers,birdLayout]=await Promise.all(['sprites.json','dancers.json','bird-layout.json'].map(async src=>(await fetch(src)).json()));await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['calm.png','storm.png','shrine.png','waterfall.png','dancers.png'].map(load));document.querySelector('#status').hidden=true;render(1.2);
})();
window.lugiaFilm={ready,render,duration:FILM_DURATION,cuts:CUTS,stormAt:STORM_AT,cryAt:CRY,revealAt:REVEAL,women:WOMEN,layout:()=>birdLayout,spriteFrame:t=>frameInfo(249,'Walk',0,(t-21)*.7)};await ready;
