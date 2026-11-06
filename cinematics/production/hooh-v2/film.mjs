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

const FILM_DURATION=30,CUTS=[0,3.5,4,9.5,10,15,21],REVEAL=21.2,CRY=23.15;
let dancers,birdLayout;
const WOMEN=[{row:0,x:155,y:216,h:35},{row:1,x:240,y:219,h:36},{row:2,x:325,y:216,h:35},{row:3,x:105,y:234,h:39},{row:4,x:375,y:234,h:39}];
const BELL_TIMES=[21.6,24.1,26.6,28.2,35.1,39.2];
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
function burning(t){
 c.save();camera(1+ease(t/7)*.075,240,150,.15,t);background('tower.png');flames(t,.75+ease(t/7)*.4);towerSmoke(t,.95);rain(t,.15);puddles(t);c.restore();
}
function extinguishing(t){
 c.save();camera(1.075*(1-ease(t/6))+.999*ease(t/6),240,150);background('tower.png');
 imageOverlay('ruins.png',ease((t-2)/2.6));const p=1-ease(t/4.8);flames(t+7,p*1.15);towerSmoke(t+7,.4+p*.6);
 // Wet smoke hides the collapsing upper stories, then clears above the ruins.
 const smoke=Math.sin(Math.PI*clamp((t-1.8)/3.3));
 for(let i=0;i<8;i++)cloud(112+(i%3)*49+Math.sin(t+i)*8,49+Math.floor(i/3)*52,160,65,'#788394',i,smoke*.2);
 rain(t+7,.35*(1-ease((t-4)/2)));puddles(t+7,.4);c.restore();
}
const RAINBOW=['#ed767b','#f6ad65','#f6dd85','#94d799','#73c6df','#8389d6','#b493d9'];
function rainbow(progress,alpha=1){
 if(progress<=0)return;
 for(let band=0;band<7;band++){
  const rx=222-band*3,ry=116-band*3,pts=[],steps=Math.max(2,Math.round(progress*180));
  for(let i=0;i<=steps;i++){const a=Math.PI-Math.PI*progress*i/steps;pts.push([240+Math.cos(a)*rx,151-Math.sin(a)*ry])}
  line(pts,RAINBOW[band],3.1,alpha*.68);
 }
}
function rainbowOverRuins(t){
 c.save();camera(1.004+ease(t/7)*.025,240,165);background('ruins.png');const p=ease((t-1.15)/3.2),warm=ease((t-2.7)/3.2);
 rainbow(p,.92);towerSmoke(t+13,.17*(1-t/7));
 for(let i=0;i<7;i++)polygon([[150+i*25,81-i%3*5],[171+i*25,79-i%3*5],[286+i*10,238],[181+i*9,238]],RAINBOW[i],warm*.045);
 glow(240,197,82,'#ffdb99',warm*.31);fade(warm*.1,'#f3c484');
 for(let i=0;i<18;i++)spark(164+hash(i,8)*151,156+hash(i,9)*79,1,'#ffeabb',warm*(.12+.15*Math.sin(t*2+i)**6));
 c.restore();
}
function goldenLeaves(t,amount=.5){
 for(let i=0;i<22;i++){
  const age=(hash(i,8)+t*.1)%1,x=(hash(i,7)*590+t*15)%590-50,y=age*290-20,s=1+i%2;
  polygon([[x-s*2,y],[x,y-s*2],[x+s*2,y+s],[x,y+s*2],[x-s,y+s]],i%3?'#dc9c57':'#f3cc7a',Math.sin(age*Math.PI)*amount);
 }
}
function dancer(row,x,y,height,pose,alpha=1,mirror=false){
 const entry=dancers[row],r=entry.poses[pose],s=height/entry.referenceHeight;
 c.save();c.globalAlpha=alpha;c.translate(x,y);if(mirror)c.scale(-1,1);
 c.drawImage(images.get(entry.src),r.x,r.y,r.w,r.h,Math.round(-r.anchorX*s),Math.round(-r.anchorY*s),r.w*s,r.h*s);c.restore();
}
function dance(t,absolute){
 const sequence=[0,1,2,1,3,0,2,1],beat=.64;
 const poses=[];
 for(let i=0;i<WOMEN.length;i++){
  const w=WOMEN[i],phase=(t/beat+(i%2)*.35)%sequence.length,k=Math.floor(phase),f=phase-k,pose=sequence[k],next=sequence[(k+1)%sequence.length],transition=ease((f-.83)/.17);
  const x=w.x+Math.sin(t*.7+i*.4)*2.4,y=w.y;ellipse(x,y+1,7,1.8,'#452237',.24);
  dancer(w.row,x,y,w.h,pose,1-transition,i>2);if(transition>0)dancer(w.row,x,y,w.h,next,transition,i>2);poses.push(pose);
 }
 return poses;
}
function bellWaves(absolute){
 for(let i=0;i<BELL_TIMES.length;i++){
  const age=absolute-BELL_TIMES[i];if(age<0||age>1.6)continue;
  for(const x of [74,405]){
   const rr=5+age*40,pts=[];for(let k=0;k<=40;k++){const a=k*Math.PI/20;pts.push([x+Math.cos(a)*rr,139+Math.sin(a)*rr*.7])}
   line(pts,'#ffe5a0',1.2,(1-age/1.6)*.55);glow(x,138,17,'#ffe8a3',(1-age/1.6)*.25);
  }
 }
}
function ritual(t){
 const close=ease((t-3.2)/1.2)*(1-ease((t-6.1)/1.5));
 c.save();camera(1+ease(t/9)*.035+close*.22,240,199);background('terrace.png');const poses=dance(t,t+20);bellWaves(t+20);goldenLeaves(t+20,.5);
 for(let i=0;i<12;i++)px(153+hash(i,3)*175,210-hash(i,4)*70-t*1.4,1,1,'#ffebba',.2);
 c.restore();return poses;
}
function skyArrival(t){
 c.save();camera(1+ease(t/6)*.13,240,132);background('sky.png');
 const p=ease(t/5.4),x=mix(81,240,p),y=mix(179,123,p)+Math.sin(t*1.1)*8,r=mix(3,27,p);
 for(let band=6;band>=0;band--){const pts=[];for(let k=0;k<28;k++){const q=k/27,xx=x-q*(55+p*55),yy=y+q*36+Math.sin(q*4-t)*4;pts.push([xx,yy+band*.8])}line(pts,RAINBOW[band],1.4,.32*p)}
 glow(x,y,r*1.8,'#ffe5a5',.65);ellipse(x,y,r*.65,r*.65,'#fff5ce',.9);spark(x,y,r,'#ffedb7',.9);
 for(let i=0;i<18;i++){const age=(t*.45+i*.13)%1,a=i*2.399; spark(x+Math.cos(a)*age*(32+r),y+Math.sin(a)*age*(22+r),1+i%2,'#fff0bc',(1-age)*p*.7)}
 goldenLeaves(t+29,.25);c.restore();if(t>5.35)fade(ease((t-5.35)/.65),'#fff3cf');
}
function hoohBird(t,alpha){
 const f=frameInfo(250,'Walk',0,t*.73),s=birdLayout.scale,x=240+Math.sin(t*1.2)*1.3,y=mix(-28,birdLayout.targetY,ease(t/2.05))+Math.sin(t*1.7)*1.3;
 c.save();c.globalAlpha=alpha;c.drawImage(f.canvas,Math.round(x-birdLayout.anchor.x*s),Math.round(y-birdLayout.anchor.y*s),f.mode.w*s,f.mode.h*s);c.restore();return{x,y,scale:s,frame:f.index};
}
function revelation(t){
 background('terrace.png');const poses=dance(t+9,t+35);bellWaves(t+35);goldenLeaves(t+35,.6);
 const alpha=ease((t-.2)/.65);glow(240,100,72,'#ffe4a5',alpha*.22);
 const bird=hoohBird(t,alpha);
 for(let i=0;i<18;i++){const a=i*2.399,r=36+hash(i,4)*83;spark(240+Math.cos(a+t*.25)*r,105+Math.sin(a+t*.25)*r*.62,1+i%3,'#ffedb7',alpha*(.13+.18*Math.sin(t*2+i)**4))}
 if(t<.9)fade(1-ease(t/.9),'#fff3cf');return{bird,poses,alpha};
}
let beasts;
function resurrection(t){
 c.save();camera(1.015+ease(t/5.5)*.025,240,180);background('ruins.png');
 const arc=ease((t-.3)/2.6),light=ease((t-.7)/1.7),appear=ease((t-1.6)/.65);
 rainbow(arc,.98);
 // Dense light stays behind the three opaque silhouettes, making each outline
 // readable while the rest of the burnt tower remains visible around the beam.
 polygon([[224,66],[256,66],[365,246],[115,246]],'#ffe4a5',light*.2);
 polygon([[232,72],[248,72],[333,243],[147,243]],'#fff8d9',light*.23);
 for(let i=0;i<7;i++)polygon([[196+i*12,77],[207+i*12,77],[330+i*8,245],[139+i*7,245]],RAINBOW[i],light*.05);
 glow(240,192,110,'#ffe9ab',light*.65);
 ellipse(240,200,99,49,'#fff4d4',light*.19);ellipse(240,227,116,13,'#fff1c1',light*.3);
 for(let i=0;i<18;i++){const x=137+hash(i,37)*207,y=124+((hash(i,38)*110-t*12+400)%110);px(x,y,1,4,'#fff6d4',light*.2)}
 for(const b of beasts){
  ellipse(b.x,237,25,3,'#1d1a2b',appear*.35);
  mon(b.id,'Idle',b.dir,b.x,b.y,b.scale,t*.55,{tint:'#100f19',alpha:appear});
 }
 c.restore();if(t<.25)fade(1-ease(t/.25));if(t>5.2)fade(ease((t-5.2)/.3));
 return{arc,light,appear};
}
function render(time){
 const t=clamp(time,0,FILM_DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,poses=[],reveal=null,resurrectionState=null;
 if(t<3.5){shot=1;burning(t*1.4);if(t>3.15)fade(ease((t-3.15)/.35))}
 else if(t<4){shot=2;fade(1)}
 else if(t<9.5){shot=3;resurrectionState=resurrection(t-4)}
 else if(t<10){shot=4;fade(1)}
 else if(t<15){shot=5;poses=ritual(t-10);if(t<10.25)fade(1-ease((t-10)/.25))}
 else if(t<21){shot=6;skyArrival(t-15)}
 else{shot=7;reveal=revelation(t-21);poses=reveal.poses}
 if(t<.45)fade(1-ease(t/.45));if(t>29.4)fade(ease((t-29.4)/.6));
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:250,shot,blackTransition:shot===2||shot===4,fireStrength:t<3.5?.75+ease(t/5)*.4:0,rainbowProgress:resurrectionState?.arc||0,lightStrength:resurrectionState?.light||0,beastIds:resurrectionState&&resurrectionState.appear>.01?beasts.map(b=>b.id):[],beastOpacity:resurrectionState?.appear||0,dancers:poses.length,poses,reveal,hoohVisible:!!reveal&&reveal.alpha>.01,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{
 [sprites,dancers,birdLayout,beasts]=await Promise.all(['sprites.json','dancers.json','bird-layout.json','beasts.json'].map(async src=>(await fetch(src)).json()));
 await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['tower.png','ruins.png','terrace.png','sky.png','dancers.png'].map(load));document.querySelector('#status').hidden=true;render(1.2);
})();
window.hoohFilm={ready,duration:FILM_DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,bellTimes:[11.6,14.1,21.1,25.2],women:WOMEN,beasts:()=>beasts,layout:()=>birdLayout,spriteFrame:t=>frameInfo(250,'Walk',0,(t-21)*.73)};await ready;
