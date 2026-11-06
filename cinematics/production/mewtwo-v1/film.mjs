const W=480,H=270,DURATION=40;
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

const CUTS=[0,6,12,19,25,26,32,34],CRY=35,EXPLOSION=25.3,REVEAL=34;
const CAST=[
 {key:'132',x:116,y:139,start:.15,scale:3.25},
 {key:'132',x:360,y:145,start:.7,scale:3.3},
 {key:'132',x:82,y:230,start:1.25,scale:3.2},
 {key:'132',x:237,y:237,start:1.8,scale:3.6},
 {key:'132',x:399,y:233,start:2.35,scale:3.25},
 {key:'132s',x:240,y:126,start:2.9,scale:3.7}
];
function fade(a,color='#000000'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function caption(text,alpha=1){
 c.save();c.globalAlpha=clamp(alpha);c.font='7px monospace';c.textAlign='center';c.fillStyle='#07141b';c.fillRect(135,245,210,15);c.fillStyle='#d6f5ed';c.fillText(text,240,255);c.restore();
}
function spark(x,y,r,color,a=1){px(x-r,y,2*r+1,1,color,a);px(x,y-r,1,2*r+1,color,a);px(x,y,1,1,'#ffffff',a)}
function discovery(t){
 c.save();camera(1+ease(t/6)*.065,240,140);background('mural.png');
 for(let i=0;i<14;i++){const x=(hash(i,3)*100+t*3)%100,y=132+hash(i,4)*25;px(x,y,4,1,'#d9fff9',.35)}
 for(let i=0;i<16;i++){const x=hash(i,5)*480,y=140+(hash(i,6)*120+t*4)%120;px(x,y,1,1,'#fff9c6',.25)}
 // Glint on the scanner already held by the expedition scientist.
 px(124,176,4,3,'#a8ffe1',.3+.2*Math.sin(t*3)**2);c.restore();
 if(t<.5)fade(1-t/.5);if(t>5.7)fade(ease((t-5.7)/.3));
}
function sampleVial(x,y,fill,t){
 polygon([[x-3,y-7],[x+3,y-7],[x+3,y+5],[x+1,y+7],[x-2,y+6]],'#183e51');
 px(x-2,y-5,4,10,'#68a3ba',.75);px(x-1,y+5-fill*8,3,Math.max(1,fill*8),'#ed91d9',.9);
 px(x-2,y-8,6,2,'#adcbd2');px(x-1,y-4,1,7,'#e2ffff',.75);glow(x,y,8,'#ec8acf',fill*.18);
}
function dnaStream(x0,y0,x1,y1,progress,t){
 if(!progress)return;
 for(let j=0;j<18;j++){
  const u=((j/18+t*.22)%1)*clamp(progress*1.5),x=mix(x0,x1,u),y=mix(y0,y1,u),wave=Math.sin(u*22-t*5)*3;
  px(x,y+wave,2,1,'#efacdf',.65);px(x,y-wave,1,1,'#e8e3ff',.6);
  if(j%3===0)px(x,y-Math.abs(wave),1,Math.max(1,Math.abs(wave)*2),'#aa75c4',.45);
 }
}
function encounter(t){
 const p=ease(t/6),zoom=1.08+ease((t-2.2)/3.8)*.6;
 c.save();camera(zoom,180,165);background('mural.png');
 const mx=mix(289,216,ease(t/2.4)),my=171+Math.sin(t*2)*3,appear=ease((t-.2)/.65);
 glow(mx,my-28,27,'#f4acd9',appear*.17);
 mon(151,'Idle',0,mx,my,2.65,t*.55,{alpha:appear});
 const collect=ease((t-2)/2.4);
 if(t>2){
  c.save();c.strokeStyle='#8cf9dc';c.globalAlpha=.14*collect;c.lineWidth=1;c.beginPath();c.moveTo(124,178);c.lineTo(mx,my-25);c.stroke();c.restore();
  dnaStream(mx,my-25,115,180,collect,t);
 }
 sampleVial(115,180,collect,t);
 if(t>4.3)spark(115,180,5,'#ffd3ef',Math.sin(clamp((t-4.3)/1.4)*Math.PI)*.8);
 c.restore();
 if(t>3.3&&t<5.8)caption('ADN de Mew · échantillon recueilli',ease((t-3.3)/.4)*(1-ease((t-5.4)/.4)));
 if(t<.25)fade(1-t/.25);if(t>5.75)fade(ease((t-5.75)/.25));
}
function blobShape(x,y,rx,ry,t,color,alpha=1,phase=0){
 const points=[];
 for(let i=0;i<22;i++){const a=i*Math.PI/11,pulse=1+.13*Math.sin(i*2.1+t*2.8+phase)+.08*Math.sin(i*1.2-t*3.3);points.push([x+Math.cos(a)*rx*pulse,y+Math.sin(a)*ry*pulse])}
 polygon(points,color,alpha);
}
function incubatorMass(t){
 const grow=ease(t/7),x=240+Math.sin(t*1.5)*2,y=137+Math.cos(t*1.2)*2,rx=21+grow*10,ry=27+grow*12;
 c.save();c.beginPath();c.rect(192,75,96,124);c.clip();
 glow(240,137,43,'#a560e3',.18+grow*.17);
 blobShape(x,y,rx+2,ry+2,t,'#34254f');
 blobShape(x,y,rx,ry,t,'#7043a7',1,.6);
 blobShape(x-5,y-5,rx*.64,ry*.62,t,'#a66cd0',.85,1.1);
 blobShape(x+3,y+4,rx*.37,ry*.31,t,'#c58ddc',.75,2);
 for(let i=0;i<13;i++){const yy=190-((t*15+i*9)%105),xx=202+hash(i,4)*75;px(xx,yy,2,2,i%3?'#a673c9':'#e6b6f7',.3)}
 c.restore();
 // Two small glass glints are in front of the living mass.
 px(190,85,1,95,'#b3f8ff',.21);px(289,81,1,108,'#b3f8ff',.15);
}
function monitorReadings(t){
 for(const [x,y,w]of[[97,108,19],[400,111,37]]){
  for(let i=0;i<5;i++)px(x,y+i*5,(8+Math.sin(t*3+i)*5+i)%w,1,'#66e8e5',.55);
 }
 for(let i=0;i<9;i++)px(42+i*4,166+Math.sin(i+t*4)*3,2,1,'#71e3da',.6);
}
function laboratory(t){
 c.save();camera(1+ease(t/7)*.035,240,139, t>5?(t-5)*.12:0,t);
 background('lab.png');monitorReadings(t);incubatorMass(t);
 if(t>5.1){const a=ease((t-5.1)/1.9);glow(240,137,65,'#c180fa',a*.12);px(235,43,10,2,'#eb83db',a*.8)}
 c.restore();if(t<.35)fade(1-t/.35);
}
function clones(t){
 fade(1);
 for(let i=0;i<CAST.length;i++){
  const item=CAST[i],age=t-item.start;if(age<0)continue;
  const a=ease(age/.45),scale=item.scale*(.75+.25*a),y=item.y+Math.sin(t*2+i)*1.7;
  glow(item.x,y-14,27,item.key==='132s'?'#8fd7f6':'#b886c7',a*.085);
  mon(item.key,'Idle',0,item.x,y,scale,t*.7+i*.3,{alpha:a});
  if(item.key==='132s'&&age<1.5){
   for(let k=0;k<4;k++){const ang=k*Math.PI/2+t,r=17+age*20;spark(item.x+Math.cos(ang)*r,y-20+Math.sin(ang)*r*.6,2,'#b7eeff',Math.max(0,1-age/1.5))}
  }
 }
}
function debrisSmoke(t){
 for(let i=0;i<5;i++){
  const age=(t*.16+i*.24)%1,x=i%2?320+i*9:133-i*6,y=234-age*110;
  cloud(x-17,y,36+age*30,14+age*16,'#404052',i,.13*(1-age));
 }
 for(const [x,y]of[[321,112],[448,183],[100,225]]){
  for(let i=0;i<3;i++){const age=(t*1.3+i*.3)%1;px(x+Math.sin(t*10+i)*age*7,y+age*12,1,2,'#ffd588',(1-age)*.6)}
 }
}
function ruinedLab(t){
 c.save();camera(1+ease(t/8)*.045,240,139,t<1.2?(1-t/1.2)*2:0,t);background('ruins.png');debrisSmoke(t);
 c.restore();
 if(t<.55)fade((1-ease(t/.55))*.65);
}
function blackPulse(t){return [[.08,.31],[.68,.94],[1.26,1.51],[1.77,2]].some(([a,b])=>t>=a&&t<b)}
function flicker(t){ruinedLab(t+6);if(blackPulse(t))fade(1)}
function revelation(t){
 background('ruins.png');debrisSmoke(t+8);
 const appear=ease((t-.14)/.58);
 glow(240,143,84,'#b064ee',.22+appear*.13);
 for(let i=0;i<15;i++){const a=i*2.399,r=24+t*(11+hash(i,3)*13);px(240+Math.cos(a)*r,144+Math.sin(a)*r*.7,2,2,i%3?'#bd87ec':'#ead4ff',Math.max(0,1-t/3)*.7)}
 const kind=t>1&&t<2.8?'Charge':'Idle',ft=kind==='Charge'?(t-1)*.28:t*.65;
 ellipse(240,224,54,6,'#100e23',.5);
 mon(150,kind,0,240,224+Math.sin(t*1.6)*1.4,5.4,ft,{alpha:appear,oneShot:kind==='Charge'});
 for(let i=0;i<5;i++){
  const x=180+i*30+(i%2?-7:3),y=223-Math.sin(t*1.7+i)*4-appear*(7+i%3*5);
  polygon([[x-3,y],[x,y-3],[x+4,y-1],[x+3,y+3],[x-2,y+3]],i%2?'#657087':'#40465f',appear*.7);
 }
 if(t<.38)fade(1-ease(t/.38),'#b871ed');
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;
 if(t<6){shot=1;discovery(t)}else if(t<12){shot=2;encounter(t-6)}else if(t<19){shot=3;laboratory(t-12)}else if(t<25){shot=4;clones(t-19)}else if(t<26){shot=5;fade(1)}else if(t<32){shot=6;ruinedLab(t-26)}else if(t<34){shot=7;flicker(t-32)}else{shot=8;revelation(t-34)}
 if(t>39.45)fade(ease((t-39.45)/.55));
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,shot,species:150,liveMew:t>=6.2&&t<12,dnaCollected:t>=10.4&&t<12,blobInTank:t>=12&&t<19,shinyDittoVisible:t>=21.9&&t<25,normalDittoCount:t>=19&&t<25?CAST.filter(p=>p.key==='132'&&t-19>=p.start).length:0,explosionAt:EXPLOSION,ruinsVisible:t>=26,mewtwoVisible:t>=34.28,blackPulse:t>=32&&t<34?blackPulse(t-32):false,revealAt:REVEAL,cryAt:CRY};
}
const ready=(async()=>{
 sprites=await(await fetch('sprites.json')).json();
 await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));
 await Promise.all(['mural.png','lab.png','ruins.png'].map(load));document.querySelector('#status').hidden=true;render(0);
})();
window.mewtwoFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,explosionAt:EXPLOSION,revealAt:REVEAL,cast:CAST};await ready;

