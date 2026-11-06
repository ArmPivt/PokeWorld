const W=480,H=270,DURATION=26;
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

const species=Number(new URLSearchParams(location.search).get('species'))===383?383:382;
const water=species===382,colors=water?['#2067e8','#52d6ff','#e3faff']:['#b32528','#ff633d','#ffebac'];
const CUTS=[0,3.8,12,15.4,19],CRY=20.2;
function fade(alpha,color='#020612'){px(0,0,W,H,color,clamp(alpha))}
function opening(t){
 c.save();camera(1+ease(t/3.8)*.24,water?327:150,143);background('mural.png');
 for(const x of [14,466]){glow(x,108,21,'#ffa947',.55+.15*Math.sin(t*9));ellipse(x,109,3,6+Math.sin(t*10)*2,'#ff9d4b');px(x-1,105,2,5,'#ffe4a2')}
 for(let i=0;i<25;i++)px((hash(i,1)*W+t*5)%W,hash(i,2)*H,1,1,'#e6c48b',.18);
 if(t>2.3){const a=ease((t-2.3)/1.1);glow(water?328:151,140,50,colors[1],a*.35)}
 c.restore();if(t<.4)fade(1-t/.4);if(t>3.4)fade((t-3.4)/.4);
}
function descent(t){
 const p=ease(t/8.2),im=images.get(water?'ocean.png':'volcano.png'),height=im.height/im.width*W,scroll=p*(height-H);
 c.drawImage(im,0,-scroll,W,height);
 if(water){
  const fish=[{id:170,x:110+t*10,y:159,scale:1.5,dir:2},{id:320,x:405-t*15,y:357,scale:1.9,dir:6},{id:369,x:82+t*19,y:621,scale:1.8,dir:2}];
  for(const f of fish){const yy=f.y-scroll+Math.sin(t*2+f.id)*3;if(yy>-60&&yy<H+60){mon(f.id,'Walk',f.dir,f.x,yy,f.scale,t*.8);if(f.id===170){glow(f.x+15,yy-20,9,'#c7ffb1',.65);glow(f.x-15,yy-15,7,'#c7ffb1',.5)}}}
  for(let i=0;i<46;i++){const yy=(hash(i,8)*1000-t*22-scroll+1100)%1000-80,xx=hash(i,9)*W+Math.sin(t*1.3+i)*3;if(yy<H&&yy>0){const r=i%4?1:3;c.strokeStyle='#9adceb';c.globalAlpha=.3;c.strokeRect(Math.round(xx),Math.round(yy),r*2,r*2);c.globalAlpha=1}}
  fade(.16*p,'#000915');
 }else{
  for(const f of [{id:218,x:64,y:169,scale:1.25,dir:2},{id:219,x:417,y:342,scale:1.35,dir:6},{id:218,x:85,y:483,scale:1.4,dir:2}]){const yy=f.y-scroll;if(yy>-55&&yy<H+55){glow(f.x,yy-15,24,'#fa682e',.35);mon(f.id,'Idle',f.dir,f.x,yy,f.scale,t)}}
  for(let i=0;i<65;i++){const yy=(hash(i,6)*1050-t*(25+hash(i,3)*35)-scroll+1300)%1050-100,xx=hash(i,4)*W+Math.sin(t*2+i)*5;if(yy>0&&yy<H)px(xx,yy,i%4?1:2,3,i%3?'#f58a3d':'#ffd175',.45)}
  glow(240,270,200,'#ff5324',.2+.3*p);
 }
 if(t<.45)fade(1-t/.45);if(t>7.65)fade((t-7.65)/.55);
}
function eyes(power=1){
 const yy=water?145:61,positions=water?[207,273]:[225,252];
 for(const x of positions){glow(x,yy,8,colors[1],power*.8);px(x-4,yy,8,2,colors[1],power);px(x-2,yy,4,1,colors[2],power)}
}
function shrine(t){
 background(water?'kyogreChamber.png':'groudonChamber.png',1+ease(t/3.4)*.018);
 fade(.98,'#01030b');eyes(ease(t/.6)*(.78+.14*Math.sin(t*3)));
 if(t>2.5){const a=ease((t-2.5)/.9);glow(240,217,7,colors[1],a*.35);ellipse(240,217,4,4,colors[0],a*.25)}
 if(t<.35)fade(1-t/.35);
}
function awakening(t){
 const p=ease(t/3.6),charge=ease(t/1.8),y=217-ease((t-1.2)/1.6)*25;
 background(water?'kyogreChamber.png':'groudonChamber.png',1.018);
 fade(.98-p*.78,'#01030b');eyes(.95);
 ellipse(240,222,25+charge*12,6,colors[0],.3*charge);glow(240,y,22+charge*36,colors[1],charge);
 ellipse(240,y,7+charge*4,8+charge*4,colors[0],.45+charge*.55);
 ellipse(239,y-2,5+charge*2,5+charge*2,colors[1],charge);px(237,y-6,3,3,colors[2],charge);
 // The circular motif on the orb is revealed as it charges.
 c.strokeStyle=colors[2];c.globalAlpha=charge*.8;c.lineWidth=1;c.beginPath();c.arc(240,y,4,0,Math.PI*1.8);c.stroke();c.globalAlpha=1;
 for(let i=0;i<35;i++){const a=i*2.4+t*3,r=(13+hash(i,3)*43)*(1-.35*charge);px(240+Math.cos(a)*r,y+Math.sin(a)*r*.65,2,2,colors[i%3],charge*.8)}
 if(t>1.8){const lift=ease((t-1.8)/1.4);beam(240,y,240,y-lift*330,water?'water':'fire',t,.9*lift,10+lift*14);burst(240,y,t-2.85,colors[2],1.5)}
 if(t>3.0)fade(ease((t-3.0)/.6),colors[1]);
}
function bolt(x,t,at,seed=1){
 const age=t-at;if(age<0||age>.32)return;
 c.save();c.globalAlpha=1-age/.32;c.strokeStyle='#c8f2ff';c.lineWidth=3;c.beginPath();let xx=x;c.moveTo(xx,-4);
 for(let y=12;y<=150;y+=18){xx=x+(hash(y,seed)-.5)*45;c.lineTo(Math.round(xx),y)}c.stroke();
 c.lineWidth=1;c.strokeStyle='#ffffff';c.stroke();c.restore();fade((1-age/.32)*.16,'#dbf7ff');
}
function sea(t){
 c.save();camera(1+ease(t/7)*.035,240,180);background('kyogreSurface.png',1.025);
 for(let i=0;i<11;i++){const x=(i*47+t*28)%530-25,y=147+i%4*20;px(x,y+Math.sin(t*4+i)*2,24+i%3*9,2,'#268ca8',.48)}
 const arrive=ease(t/1.15),roaring=t>1.2&&t<2.8;
 ellipse(240,236,93,9,'#03182c',.75);glow(240,229,78,'#2589e5',.4);
 mon(382,roaring?'Swell':'Idle',0,240,mix(264,236,arrive)+Math.sin(t*2)*2,3.5,roaring?(t-1.2)*.28:t*.85,{alpha:arrive,oneShot:roaring});
 // A foreground waterline places the whale at the surface rather than in midair.
 for(let x=-4;x<W+4;x+=4){const y=218+Math.sin(x*.046-t*4.2)*3+Math.sin(x*.09+t*3)*1.5;px(x,y,4,H-y,'#082447');if((x+Math.floor(t*18))%52<28)px(x,y,5,2,'#6bd8e6',.8)}
 for(let i=0;i<30;i++){const a=i*Math.PI/15,r=arrive*110+Math.sin(t*3)*8;px(240+Math.cos(a)*r,218+Math.sin(a)*r*.1,7,2,'#a4ecf6',.65)}
 rain(t, .55);rain(t+.7,.22);bolt(111,t,.65,1);bolt(371,t,3.35,2);bolt(62,t,5.4,3);c.restore();
 if(t<.7)fade(1-ease(t/.7),colors[1]);
}
function continent(t){
 const arrive=ease(t/.9),impact=Math.exp(-Math.abs(t-.9)*9);
 c.save();camera(1+ease(t/7)*.055,240,190,impact*.8,t);background('groudonSurface.png',1.025);
 for(let i=0;i<8;i++){const y=142+i*7;px(5+Math.sin(t*3+i)*9,y,470,1,'#ffda82',.045)}
 ellipse(240,231,71,8,'#542d25',.6);
 const roaring=t>1.2&&t<2.8;
 mon(383,roaring?'Emit':'Idle',1,240,232+Math.sin(t*2)*.4,3.15,roaring?(t-1.2)*.33:t*.8,{alpha:arrive,oneShot:roaring});
 burst(240,232,t-.65,'#f5bc73',1.5);
 for(let i=0;i<22;i++){const xx=hash(i,4)*W,yy=225+hash(i,3)*35;if(t<2.4){const a=Math.sin(clamp((t-.2)/2.2)*Math.PI);px(xx,yy-a*(5+hash(i,2)*19),3,3,'#683c2c',a*.7)}}
 // Restrained sun haze, no dark storm or falling rain in Groudon's scene.
 glow(373,51,68,'#fff5bd',.45+.1*Math.sin(t*.9));
 c.restore();if(t<.7)fade(1-ease(t/.7),'#ffad65');
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;if(t<3.8){shot=1;opening(t)}else if(t<12){shot=2;descent(t-3.8)}else if(t<15.4){shot=3;shrine(t-12)}else if(t<19){shot=4;awakening(t-15.4)}else{shot=5;water?sea(t-19):continent(t-19)}
 if(t>25.5)fade(ease((t-25.5)/.5));
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {species,time:t,shot,legendaryVisible:t>=19,cryAt:CRY};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(modes=>Object.values(modes).map(m=>m.src)))].map(load));await Promise.all(['mural','ocean','volcano','kyogreChamber','groudonChamber','kyogreSurface','groudonSurface'].map(n=>load(n+'.png')));document.querySelector('#status').hidden=true;render(0)})();
window.primalFilm={ready,duration:DURATION,species,render,cuts:CUTS,cryAt:CRY};await ready;
