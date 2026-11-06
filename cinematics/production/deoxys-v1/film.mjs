const W=480,H=270,DURATION=36;
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

const CUTS=[0,5.5,10.5,16.5,19,27],CRY=32;
let meteorBounds;
function fade(alpha,color='#030611'){px(0,0,W,H,color,clamp(alpha))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function entity(id,kind,dir,x,y,scale,t,options={}){
 const f=frameInfo(id,kind,dir,t,options.oneShot),mid=(f.top+f.bottom)/2;
 c.save();c.globalAlpha=options.alpha??1;if(options.angle){c.translate(x,y);c.rotate(options.angle);c.translate(-x,-y)}
 c.drawImage(f.canvas,Math.round(x-f.cx*scale),Math.round(y-mid*scale),f.mode.w*scale,f.mode.h*scale);c.restore();
}
function meteor(x,y,size,angle,t,alpha=1){
 const im=images.get('meteor.png'),[sx,sy,ex,ey]=meteorBounds,ww=ex-sx,hh=ey-sy;
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.drawImage(im,sx,sy,ww,hh,-size/2,-size*hh/ww/2,size,size*hh/ww);c.restore();
 glow(x,y,size*.4,'#a93ee8',(.25+.1*Math.sin(t*2))*alpha);
}
function stars(t,amount=.8){for(let i=0;i<85;i++){const x=hash(i,36)*W,y=hash(i,37)*H;px(x,y,i%17?1:2,i%17?1:2,i%5?'#c8e3ff':'#c795ff',(.2+.5*Math.sin(t*.6+i)**2)*amount)}}
function space(t,zoom=1){background('space.png',zoom);stars(t,.7)}
function laboratory(t){
 c.save();camera(1+ease(t/5.5)*.08,240,136);background('lab.png');
 // Animated readings and scanner establish active research around the sample.
 for(const [x,y,w,h] of [[43,83,80,34],[356,82,81,35],[65,145,24,15],[389,146,23,15]]){
  for(let k=0;k<7;k++)px(x+k*w/8,y+h/2+Math.sin(k*1.7+t*4)*h*.3,4,2,k%3?'#63d7dc':'#bb8cf1',.68);
  px(x,y+h-3,(t*24)%w,1,'#4a8eaf',.7);
 }
 const y=120+Math.sin(t*1.5)*2;ellipse(240,189,38,4,'#081d34',.5);meteor(240,y,82,Math.sin(t*.5)*.12,t);
 const scanY=82+((t*27)%95);beam(182,scanY,298,scanY,'water',t,.28,2);glow(240,scanY,35,'#58e3ed',.2);
 for(const x of [171,307]){px(x,88,1,89,'#72dce5',.2);px(x-2,scanY-2,5,4,'#c7ffff',.8)}
 if(t>3.5){const a=ease((t-3.5)/1.4);glow(240,31,25,'#cf5bf0',a*.6);glow(240,y,38,'#ab44e8',a*.5)}
 c.restore();if(t<.35)fade(1-t/.35);if(t>5.15)fade(ease((t-5.15)/.35));
}
function approach(t){
 const p=ease(t/5);space(t,1+p*.045);
 const x=mix(101,292,p),y=mix(57,125,p),size=mix(49,119,p);
 for(let i=18;i>0;i--){const k=i/18;glow(x-k*95,y-k*29,size*(.1+.12*(1-k)),'#9953ec',(1-k)*.09);px(x-k*86+Math.sin(i+t*4)*4,y-k*30,3,2,'#c480fd',(1-k)*.35)}
 meteor(x,y,size,t*.22,t);
 for(let i=0;i<20;i++){const lag=(hash(i,3)*100+t*15)%100;px(x-lag,y-lag*.34+(hash(i,4)-.5)*35,2,2,'#cf8bfa',(1-lag/100)*.45)}
 if(t<.35)fade(1-t/.35);
}
const HIT=4.3;
function rayPosition(t){if(t<1.5){const p=ease(t/1.5);return{x:mix(-80,40,p),y:mix(226,180,p)}}const p=clamp((t-1.5)/(HIT-1.5))**2.6;return{x:mix(40,205,p),y:mix(180,125,p)}}
function chargeCone(x,y,t){
 glow(x,y,39,'#73ffac',.35);
 for(const side of [-1,1])for(let j=0;j<3;j++){
  c.save();c.globalAlpha=.25-j*.055;c.strokeStyle=j%2?'#d6ffb0':'#50f9b4';c.lineWidth=3-j*.8;c.beginPath();c.moveTo(x+39,y-9);c.bezierCurveTo(x+6,y+side*(24+j*5),x-54,y+side*(19+j*7),x-126,y+side*9);c.stroke();c.restore();
 }
 for(let i=0;i<17;i++){const xx=x-16-i*7,yy=y+Math.sin(i*.8+t*11)*18;px(xx,yy,8,2,i%3?'#51efb4':'#d4ffaf',.5*(1-i/18))}
}
function debris(t,x=300,y=125){
 if(t<0)return;const im=images.get('meteor.png'),[sx,sy,ex,ey]=meteorBounds,sw=(ex-sx)/3,sh=(ey-sy)/3;
 for(let i=0;i<9;i++){
  const a=i*Math.PI*2/9+.3,speed=35+hash(i,5)*55,xx=x+Math.cos(a)*speed*t,yy=y+Math.sin(a)*speed*t+t*t*3,size=22+hash(i,6)*24;
  c.save();c.globalAlpha=clamp(1-(t-2.2)/2.7);c.translate(xx,yy);c.rotate(a+t*(hash(i,8)-.5));c.drawImage(im,sx+i%3*sw,sy+Math.floor(i/3)*sh,sw,sh,-size/2,-size/2,size,size);c.restore();
 }
}
function explosion(t){
 if(t<0)return;const a=clamp(1-t/.9);
 glow(300,125,22+t*90,'#d5ffcc',a);burst(300,125,t,'#c7ffd8',2.2);
 for(let i=0;i<52;i++){const ang=i*2.399,speed=55+hash(i,3)*130;px(300+Math.cos(ang)*speed*t,125+Math.sin(ang)*speed*t,3,3,i%3?'#dfffe6':'#b18aff',Math.max(0,1-t/1.9)*.8)}
 if(t<.42)fade(Math.sin(clamp(t/.42)*Math.PI)*.78,'#dcffe0');
}
function intercept(t){
 space(t+5,1.045);
 if(t<HIT)meteor(300,125,119,t*.1,t);
 let p=rayPosition(t);
 if(t>HIT){const q=ease((t-HIT)/1.2);p={x:mix(205,660,q),y:mix(125,-35,q)}}
 if(t>.4&&t<5.7){
  if(t>1.5)chargeCone(p.x,p.y,t);
  const attack=t>HIT-.55&&t<HIT+.2;
  entity(384,attack?'Attack':'Walk',2,p.x,p.y,1.45+ease(t/4.5)*.2,attack?(t-(HIT-.55))*.58:t*.8,{angle:-.14,oneShot:attack});
 }
 if(t>=HIT){debris(t-HIT);explosion(t-HIT)}
}
function triangle(x,y,size,red=0,alpha=1){
 const h=size*.866,front=`rgb(${Math.round(22+red*125)},${Math.round(30-red*19)},${Math.round(34-red*11)})`;
 polygon([[x,y-h*.6],[x-size/2,y+h*.4],[x+size/2,y+h*.4]],front,alpha);
 polygon([[x,y-h*.6],[x-size/2,y+h*.4],[x-size*.32,y+h*.28]],red>.3?'#b3333e':'#354445',alpha*.65);
 polygon([[x,y-h*.6],[x+size/2,y+h*.4],[x+size*.32,y+h*.28]],red>.3?'#6d152a':'#0f1926',alpha*.85);
}
function aftermath(t){
 space(t+11,1.045);debris(t+1.5);
 const appear=ease((t-.15)/1.05);glow(240,125,27,'#9a70ba',appear*.2);triangle(240,125,34*appear,0,appear);
}
// Relative motion observed in the user-supplied video, approx. 90.8–97.2 s.
// Same order of fast straight hops and holds, fitted to the pixel-art framing.
const TRIANGLE_PATH=[
 [0,240,125],[.6,240,125],[1.1,48,225],[1.85,48,225],
 [2.4,240,43],[2.85,240,43],[3.35,432,225],[3.6,432,225],
 [4.1,91,82],[4.35,91,82],[4.85,391,101],[5.1,391,101],
 [5.35,240,222],[5.6,116,171],[6.1,366,171],[6.35,240,208],[6.6,240,125],[8,240,125]
];
function trianglePosition(t){
 let i=0;while(i<TRIANGLE_PATH.length-2&&t>=TRIANGLE_PATH[i+1][0])i++;
 const a=TRIANGLE_PATH[i],b=TRIANGLE_PATH[i+1],p=ease((t-a[0])/(b[0]-a[0]));return{x:mix(a[1],b[1],p),y:mix(a[2],b[2],p)};
}
function movements(t){
 space(t+14,1.045);const p=trianglePosition(t),red=ease((t-3.5)/4.5);
 for(let i=3;i>0;i--){const old=trianglePosition(Math.max(0,t-i*.035));if(Math.hypot(old.x-p.x,old.y-p.y)>2)triangle(old.x,old.y,34,red,.08*(4-i))}
 glow(p.x,p.y,20,'#b64f8f',red*.17);triangle(p.x,p.y,34,red);
}
function tentacles(t,size,alpha=1){
 const grow=ease((t-2.15)/1.25);if(!grow)return;
 c.save();c.globalAlpha=alpha;c.lineCap='square';
 for(const side of [-1,1])for(let j=0;j<2;j++){
  const x=240+side*(size*.26+j*5),y=133+j*10,endX=x+side*(16+j*12)*grow,endY=y-(32-j*8)*grow;
  c.strokeStyle='#0a111c';c.lineWidth=4;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+side*30*grow,y-10,x-side*7,y-46,endX,endY);c.stroke();
  c.strokeStyle='#20536a';c.lineWidth=1;c.stroke();
 }c.restore();
}
function revelation(t){
 space(t+22,1.045+ease(t/9)*.025);
 const size=mix(34,118,ease(t/3.1)),breakAt=4.3,appear=ease((t-breakAt)/.85);
 if(t<breakAt+.35){glow(240,125,40,'#d350a2',ease(t/3)*.25);tentacles(t,size,1-appear);triangle(240,125,size,1,1-appear)}
 const age=t-breakAt;
 if(age>=0){
  burst(240,125,age,'#e3c6ff',1.6);glow(240,139,66,'#b36fe2',.45*(1-appear*.45));
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7,r=age*(35+hash(i,11)*38);triangle(240+Math.cos(a)*r,125+Math.sin(a)*r+age*age*12,15+hash(i,12)*14,1,Math.max(0,1-age/1.8))}
  const roaring=t>5&&t<6.45,kind=roaring?'SpAttack':'Idle';
  mon(386,kind,0,240,mix(249,234,appear)+Math.sin(t*1.8)*1.4,5.8,roaring?(t-5)*.33:t*.8,{alpha:appear,oneShot:roaring});
  if(age<.5)fade(Math.sin(age/.5*Math.PI)*.72,'#d7baff');
 }
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;if(t<5.5){shot=1;laboratory(t)}else if(t<10.5){shot=2;approach(t-5.5)}else if(t<16.5){shot=3;intercept(t-10.5)}else if(t<19){shot=4;aftermath(t-16.5)}else if(t<27){shot=5;movements(t-19)}else{shot=6;revelation(t-27)}
 if(t>35.5)fade(ease((t-35.5)/.5));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,shot,cryAt:CRY,deoxysVisible:t>=31.3,triangle:t>=19&&t<27?trianglePosition(t-19):null};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();meteorBounds=(await(await fetch('meteor-geometry.json')).json()).bounds;await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['lab.png','space.png','meteor.png'].map(load));document.querySelector('#status').hidden=true;render(0)})();
window.deoxysFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,trianglePath:TRIANGLE_PATH};await ready;
