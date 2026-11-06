const W=480,H=270,DURATION=27;
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

const CUTS=[0,5.5,11.5,16.5,20.2,22],CRY=22,FLASH=20.2;
function fade(a,color='#04091e'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function star(x,y,r,color='#ffedb0',alpha=1,rotation=0){
 const points=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5+rotation,rr=i%2?r*.43:r;points.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}polygon(points,color,alpha);
}
function twinkle(x,y,r,t,alpha=1){
 const a=(.25+.75*Math.sin(t*2+x)**2)*alpha;
 px(x-r,y,2*r+1,1,'#dbf6ff',a);px(x,y-r,1,2*r+1,'#fff3c5',a);px(x,y,1,1,'#ffffff',a);
}
function sky(t,zoom=1,x=0,y=0){
 background('sky.png',zoom,x,y);
 for(let i=0;i<35;i++)twinkle(hash(i,1)*480,hash(i,2)*230,i%9?1:2,t+hash(i,3)*4,.55);
}
const DIGITS=['11111100011000110001100011000111111','00100011000010000100001000010001110','11111000010000111111100001000011111','11111000010000101111000010000111111','10001100011000111111000010000100001','11111100001000011111000010000111111','11111100001000011111100011000111111','11111000010001000100010000100001000','11111100011000111111100011000111111','11111100011000111111000010000111111'];
function numeral(s,x,y,scale,color){
 [...s].forEach((digit,i)=>{const bitmap=DIGITS[Number(digit)];for(let j=0;j<35;j++)if(bitmap[j]==='1')px(x+i*30+j%5*scale,y+Math.floor(j/5)*scale,scale,scale,color)});
}
function counterValue(t){return 994+Math.min(6,Math.floor(Math.max(0,t)/.62))}
function counter(t){
 c.save();camera(1+.06*ease(t/5.5),240,146);background('counter.png');
 const value=counterValue(t),str=String(value).padStart(4,'0'),phase=(t%.62)/.62,roll=phase>.79&&value<1000?ease((phase-.79)/.21):0;
 c.save();c.beginPath();c.rect(142,128,196,39);c.clip();
 if(roll){numeral(str,185,135-roll*38,4,'#a9c9d8');numeral(String(value+1).padStart(4,'0'),185,173-roll*38,4,'#e3edcc')}
 else{numeral(str,185,135,4,value===1000?'#fff2aa':'#bddae3')}
 c.restore();
 const p=ease((t-3.72)/.5);
 if(p){
  glow(240,148,78,'#f8d882',p*.26);
  for(let i=0;i<16;i++){const a=i*Math.PI/8+t*.23,r=54+(t-3.72)*7;twinkle(240+Math.cos(a)*r,148+Math.sin(a)*r*.55,2,t,p*.8)}
 }
 c.restore();if(t<.45)fade(1-t/.45);if(t>5.18)fade(ease((t-5.18)/.32));
}
function smallMeteor(t,start,x,y,speed=125){
 const age=t-start;if(age<0||age>.85)return;
 const xx=x+age*speed,yy=y+age*speed*.4,a=Math.sin(age/.85*Math.PI);
 c.save();c.strokeStyle='#b8eaff';c.globalAlpha=a*.7;c.lineWidth=1;c.beginPath();c.moveTo(xx-25,yy-10);c.lineTo(xx,yy);c.stroke();c.restore();
 px(xx,yy,2,2,'#fffce2',a);
}
function comet(x,y,size,t,tail=150,alpha=1){
 const dx=.93,dy=.36;
 // Layered tapered ribbons with curved edges, square sparks and a solid star core.
 for(let j=0;j<3;j++){
  const w=size*(.42-j*.11),len=tail*(1-j*.15),col=['#547fae','#a9ddeb','#ffe49d'][j];
  polygon([[x,y-w],[x-len*dx,y-len*dy-w*.12],[x-len*dx+12,y-len*dy+w*.12],[x,y+w]],col,alpha*(.18+j*.15));
 }
 for(let i=0;i<32;i++){
  const p=((hash(i,8)+t*.38)%1),lag=p*tail,spread=size*(.2+p*.8);
  px(x-lag*dx,y-lag*dy+(hash(i,9)-.5)*spread,1+(i%5===0?2:0),1,i%3?'#b8e9ff':'#ffe7a1',alpha*(1-p)*.7);
 }
 glow(x,y,size*1.8,'#a8e5ff',alpha*.2);glow(x,y,size*.9,'#ffe7aa',alpha*.38);
 star(x,y,size,'#d6f2ff',alpha,t*.3);star(x,y,size*.7,'#ffe6a1',alpha,t*.3);star(x,y,size*.36,'#ffffff',alpha,t*.3);
}
function observers(t){
 c.save();camera(1+.035*ease(t/6),300,164);background('watchers.png');
 for(let i=0;i<20;i++)twinkle(hash(i,34)*420,hash(i,35)*118,1,t,.45);
 for(const [start,x,y,speed] of [[.3,20,18,110],[1.2,210,9,100],[2.1,70,57,135],[3.4,170,19,125],[4.1,15,72,110]])smallMeteor(t,start,x,y,speed);
 // Their clasped hands and gaze belong to the background illustration.
 if(t>2.1&&t<4.9){
  const alpha=ease((t-2.1)/.45)*(1-ease((t-4.4)/.5));c.save();c.globalAlpha=alpha;c.textAlign='center';c.font='italic 8px Georgia';c.fillStyle='#e4e8ef';c.shadowColor='#111e40';c.shadowBlur=3;c.fillText('Je fais un vœu…',231,204);c.restore();
 }
 const a=t-5.1;if(a>=0){
  const x=mix(-20,125,clamp(a/.9)),y=mix(24,70,clamp(a/.9));comet(x,y,7+a*4,t,120);
  glow(364,175,18,'#b3e9ff',a*.1);
 }
 c.restore();if(t<.35)fade(1-t/.35);
}
function crossing(t){
 sky(t);
 const p=clamp(t/5),x=mix(102,397,p),y=mix(65,147,p);
 for(let i=0;i<17;i++){const q=(hash(i,45)+t*.22)%1;px(q*530-30,hash(i,46)*270,4,1,'#cbe5ff',.25)}
 comet(x,y,mix(10,18,ease(p)),t,180);
}
function pursuit(t){
 const p=clamp(t/3.7),zoom=1+ease(p)*1.7;
 sky(t+5,zoom,-p*45,-p*25);
 for(let i=0;i<30;i++){
  const a=hash(i,52)*Math.PI*2,r=40+((hash(i,53)+t*.35)%1)*240;
  c.save();c.globalAlpha=.2+p*.35;c.strokeStyle=i%3?'#a7d9f1':'#fff1b8';c.lineWidth=1;c.beginPath();c.moveTo(240+Math.cos(a)*r,126+Math.sin(a)*r*.7);c.lineTo(240+Math.cos(a)*(r+10+p*15),126+Math.sin(a)*(r+10+p*15)*.7);c.stroke();c.restore();
 }
 comet(mix(334,240,ease(p)),mix(145,126,ease(p)),mix(20,72,p**1.5),t,180+p*80);
 if(t>3.05)fade(ease((t-3.05)/.65),'#ffffff');
}
function reveal(t){
 sky(t+9,1.1);
 const appear=ease((t-.2)/1.2),age=Math.max(0,t-.15),scale=mix(5.8,7.1,appear);
 for(let i=0;i<35;i++){
  const a=i*2.399,r=22+age*(13+hash(i,61)*12);
  twinkle(240+Math.cos(a)*r,128+Math.sin(a)*r*.7,1+(i%7===0),t+hash(i,62)*4,.65*(1-ease((age-4)/2)));
 }
 glow(240,132,72,'#f9e6a9',.24);
 const kind=t>1.6&&t<3.1?'Pose':'Idle',ft=kind==='Pose'?(t-1.6)*.28:t*.6;
 mon(385,kind,0,240,208+Math.sin(t*1.8)*4,scale,ft,{alpha:appear,oneShot:kind==='Pose'});
 // Flash begins fully white at the cut and clears into the animated Pokémon.
 if(t<.75)fade(1-ease(t/.75),'#ffffff');
 if(t<1.5){c.save();c.globalAlpha=(1-appear)*.5;c.strokeStyle='#fff0b5';c.lineWidth=2;c.beginPath();c.ellipse(240,128,24+t*110,18+t*72,0,0,Math.PI*2);c.stroke();c.restore()}
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;if(t<5.5){shot=1;counter(t)}else if(t<11.5){shot=2;observers(t-5.5)}else if(t<16.5){shot=3;crossing(t-11.5)}else if(t<20.2){shot=4;pursuit(t-16.5)}else{shot=t<22?5:6;reveal(t-20.2)}
 if(t>26.4)fade(ease((t-26.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,shot,counter:t<5.5?counterValue(t):null,flashAt:FLASH,cryAt:CRY,jirachiVisible:t>=20.65};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['counter.png','watchers.png','sky.png'].map(load));document.querySelector('#status').hidden=true;render(0)})();
window.jirachiFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,flashAt:FLASH,counterValue};await ready;

