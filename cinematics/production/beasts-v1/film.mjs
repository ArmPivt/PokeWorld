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

const RAINBOW=['#ed767b','#f6ad65','#f6dd85','#94d799','#73c6df','#8389d6','#b493d9'];
function rainbow(progress,alpha=1){
 if(progress<=0)return;
 for(let band=0;band<7;band++){
  const rx=222-band*3,ry=116-band*3,pts=[],steps=Math.max(2,Math.round(progress*180));
  for(let i=0;i<=steps;i++){const a=Math.PI-Math.PI*progress*i/steps;pts.push([240+Math.cos(a)*rx,151-Math.sin(a)*ry])}
  line(pts,RAINBOW[band],3.1,alpha*.68);
 }
}
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

const ID=Number(new URLSearchParams(location.search).get('id'))||245;
const FILM_DURATION=30,CUTS=[0,2.5,7.5,8,13.5,14,20,22],REVEAL=21.25,CRY=23.1;
const CONFIG={243:{name:'Raikou',plate:'storm.png',color:'#ffeb97',ground:230,title:'Le Rugissement du tonnerre'},244:{name:'Entei',plate:'volcano.png',color:'#ffb16d',ground:230,title:'Le Souffle du volcan'},245:{name:'Suicune',plate:'lake.png',color:'#b5f6ff',ground:188,title:'Le Miroir de la nuit'}};
const cfg=CONFIG[ID];let beasts,heroLayout;
function makeLayout(){
 const mode=sprites[ID].Idle,frames=Array.from({length:mode.frames},(_,i)=>frameInfo(ID,'Idle',1,mode.durations.slice(0,i).reduce((a,b)=>a+b,0)+.001));
 const anchor={x:frames[0].cx,y:frames[0].bottom};let left=999,right=-999,top=999,bottom=-999;
 for(const f of frames){const a=f.canvas.getContext('2d').getImageData(0,0,mode.w,mode.h).data;for(let y=0;y<mode.h;y++)for(let x=0;x<mode.w;x++)if(a[(y*mode.w+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1)}}
 const scale=Math.min(142/(right-left),108/(bottom-top));return{anchor,scale,width:(right-left)*scale,height:(bottom-top)*scale,bounds:{left:240+(left-anchor.x)*scale,right:240+(right-anchor.x)*scale,top:cfg.ground+(top-anchor.y)*scale,bottom:cfg.ground+(bottom-anchor.y)*scale}};
}
function hero(t,x=240,y=cfg.ground,alpha=1,tint=null){
 const f=frameInfo(ID,'Idle',1,t*.8),s=heroLayout.scale;c.save();c.globalAlpha=alpha;
 if(tint){const mask=document.createElement('canvas');mask.width=f.mode.w;mask.height=f.mode.h;const m=mask.getContext('2d');m.drawImage(f.canvas,0,0);m.globalCompositeOperation='source-in';m.fillStyle=tint;m.fillRect(0,0,mask.width,mask.height);c.drawImage(mask,Math.round(x-heroLayout.anchor.x*s),Math.round(y-heroLayout.anchor.y*s),f.mode.w*s,f.mode.h*s)}
 else c.drawImage(f.canvas,Math.round(x-heroLayout.anchor.x*s),Math.round(y-heroLayout.anchor.y*s),f.mode.w*s,f.mode.h*s);c.restore();
}
function ripples(t,y=188,a=.4){
 for(let i=0;i<5;i++){const p=(t*.24+i*.2)%1,rx=15+p*90,ry=3+p*13;ellipse(240,y,rx,ry,'#80c7dd',a*(1-p)*.35);ellipse(240,y-1,Math.max(2,rx-3),Math.max(1,ry-1),'#163c70',a*(1-p)*.4)}
 for(let i=0;i<15;i++){const p=(t*.15+i*.13)%1,x=160+hash(i,6)*160;line([[x-7,p*72+y],[x+8,p*72+y]],'#6cc7e8',1,a*.2)}
}
function reflection(t,y=188,a=.55){
 c.save();c.beginPath();c.rect(145,y,190,Math.min(270-y,77));c.clip();c.translate(240,y);c.scale(1,-.52);hero(t,0,0,a,'#020b20');c.restore();
 for(let i=0;i<13;i++){const yy=y+4+i*4,dx=Math.sin(t*2+i*.7)*4;line([[161+dx,yy],[318+dx,yy]],'#15497e',1,a*.65)}
}
function motes(t,color,amount=1){for(let i=0;i<30;i++){const age=(hash(i,27)+t*.14)%1,x=150+hash(i,18)*190+Math.sin(t+i)*7,y=238-age*154;px(x,y,1+i%2,2,color,amount*Math.sin(age*Math.PI)*.55)}}
function lightning(t,at,a=1){
 const age=t-at,p=age>=0&&age<.34?Math.min(1,age/.025)*(1-ease((age-.025)/.315))*a:0;
 if(!p)return 0;fade(p*.33,'#e8e5ff');
 line([[355,0],[338,29],[351,37],[319,67],[330,72],[301,109]],'#faf4c8',3,p);line([[319,67],[344,81],[350,96]],'#e0d9ff',1,p);glow(256,134,113,'#e6deff',p*.9);return p;
}
function volcanoSmoke(t,power=1,clear=0){
 for(let layer=0;layer<3;layer++)for(let i=0;i<7;i++){
  const age=(t*.15+i*.177+layer*.13)%1,side=i%2?1:-1,x=240+side*(13+i*8+clear*128)+Math.sin(t*.6+i)*13,y=245-age*123-layer*12;
  cloud(x-59,y,118+age*53,44+age*25,layer===0?'#302533':layer===1?'#58404b':'#86605c',i+layer*8,power*(1-age)*(.6-layer*.11));
 }
}
function lakeScene(t){
 c.save();camera(1+ease(t/16)*.035,240,166);background(cfg.plate);
 const visible=ease((t-7.25)/1.05),shadow=ease((t-.65)/1.7)*(1-ease((t-6.4)/1.2));
 reflection(t,cfg.ground,visible>.01?.35:shadow*.82);ripples(t,cfg.ground,.15+shadow*.65+visible*.3);
 if(t>4.8){const p=ease((t-4.8)/2.6);glow(240,177,62,cfg.color,p*.3);for(let i=0;i<10;i++){const age=(t*.33+i*.1)%1,x=185+i*12;line([[x,191],[x+Math.sin(t+i)*5,191-age*74]],'#8ad4ed',1,p*(1-age)*.22)}}
 if(visible>0){glow(240,165,78,cfg.color,visible*.23);hero(t,240,cfg.ground,visible);motes(t,cfg.color,visible*.6)}
 // A low sheet of lake mist opens away from the creature as it materialises.
 const mist=(.12+shadow*.08)*(1-visible*.8);cloud(78-visible*50,177,148,10,'#8abbd5',1,mist);cloud(282+visible*50,183,152,9,'#bedce9',3,mist);
 if(t<.35)fade(1-ease(t/.35));const flash=Math.sin(Math.PI*clamp((t-6.9)/.55));if(t>=6.9&&t<7.45)fade(flash*.82,'#d9faff');c.restore();
 return{heroAlpha:visible,shadowAlpha:shadow,reflectionOnly:t<7.25,feetY:cfg.ground};
}
function stormScene(t){
 background(cfg.plate);fade(.28*(1-ease((t-7.25)/1.1)),'#100b24');rain(t+20,.38);
 const p=Math.max(lightning(t,2.2),lightning(t,4),lightning(t,5.5)),visible=ease((t-7.25)/.65);
 if(p>0&&visible===0)hero(t,240,cfg.ground,p,'#0b0a17');
 if(visible>0){const leap=1-ease((t-7.25)/.75),x=240+leap*40,y=cfg.ground-leap*32;ellipse(x,cfg.ground+1,57,6,'#100d21',visible*.45);hero(t,x,y,visible);motes(t,cfg.color,visible*.65)}
 for(let i=0;i<8;i++){const age=(t*.7+i*.125)%1,x=173+hash(i,7)*138;if(visible>.5)line([[x,231-age*68],[x+3,223-age*68],[x-2,217-age*68]],'#fce3a1',1,(1-age)*visible*.45)}
 if(t>=7.1&&t<7.55)fade(Math.sin(Math.PI*(t-7.1)/.45)*.9,'#fff0c8');if(t<.35)fade(1-ease(t/.35));
 return{heroAlpha:visible,shadowAlpha:p,reflectionOnly:false,feetY:cfg.ground};
}
function volcanoScene(t){
 background(cfg.plate);const visible=ease((t-7.25)/1.1),shadow=ease((t-2.4)/1.4)*(1-visible),clear=ease((t-6.5)/2.2);
 glow(240,176,102,'#ff9f54',.24+shadow*.37);ellipse(240,cfg.ground+2,58,6,'#1c1124',.5);
 if(shadow>.01)hero(t,240,cfg.ground,shadow*.94,'#160e1b');
 if(visible>0)hero(t,240,cfg.ground,visible);
 volcanoSmoke(t,1-clear*.6,clear);motes(t,'#ffb760',.45+visible*.45);
 if(t>=7.05&&t<7.55)fade(Math.sin(Math.PI*(t-7.05)/.5)*.65,'#ffcf97');if(t<.35)fade(1-ease(t/.35));
 return{heroAlpha:visible,shadowAlpha:shadow,reflectionOnly:false,feetY:cfg.ground,smokeClear:clear};
}
function render(time){
 const t=clamp(time,0,29.9999);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,storm=null,res=null,personal=null;
 if(t<2.5){shot=1;calmFire(t)}else if(t<7.5){shot=2;storm=stormSummon(t-2.5)}else if(t<8){shot=3;fade(1)}else if(t<13.5){shot=4;res=resurrection(t-8)}else if(t<14){shot=5;fade(1)}else{shot=t<20?6:t<22?7:8;personal=(ID===245?lakeScene:ID===243?stormScene:volcanoScene)(t-14)}
 if(t<.4)fade(1-ease(t/.4));if(t>29.4)fade(ease((t-29.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:ID,shot,blackTransition:shot===3||shot===5,beastIds:res&&res.appear>.01?beasts.map(b=>b.id):[],rainbow:res?.arc||0,stormStrength:storm?.storm||0,lugiaSilhouette:!!storm?.silhouetteVisible,heroVisible:(personal?.heroAlpha||0)>.01,personal,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{[sprites,beasts]=await Promise.all(['sprites.json','beasts.json'].map(async src=>(await fetch(src)).json()));await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['calm.png','ruins.png','lake.png','storm.png','volcano.png'].map(load));heroLayout=makeLayout();document.title=cfg.name+' — '+cfg.title;document.querySelector('#status').hidden=true;render(1.2)})();
window.beastFilm={ready,render,duration:FILM_DURATION,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,id:ID,config:cfg,layout:()=>heroLayout};await ready;
