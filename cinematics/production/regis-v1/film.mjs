const W=480,H=270,DURATION=28;
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

const CUTS=[0,5,12,15,18,21.5],CRY=22.2,REVEAL=21.5;
const selected=Number(new URLSearchParams(location.search).get('id')||377),IDS=[377,378,379];
if(!IDS.includes(selected))throw Error('Unknown Regi');
const THEMES={
377:{name:'Regirock',color:'#ffb86a',door:[148,94,184,111],plaque:[145,47,190,24],scale:5.4,inscription:'Deux pas à droite, deux en arrière. Puis Force.',word:'FORCE'},
378:{name:'Regice',color:'#c5f0ff',door:[151,101,180,112],plaque:[145,54,190,24],scale:5.6,inscription:'Face au sceau, laisse passer deux minutes.',word:'PATIENCE'},
379:{name:'Registeel',color:'#ff8e87',door:[165,94,158,85],plaque:[148,45,183,25],scale:5.7,inscription:'Au centre du cercle, appelle les airs avec Vol.',word:'VOL'}
};
const theme=THEMES[selected],maskCache=new Map();let eyeGeometry;
function fade(a,color='#000000'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y,col],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function caption(text,alpha=1){
 c.save();c.globalAlpha=clamp(alpha);c.font='8px monospace';c.textAlign='center';c.fillStyle='#070b13';c.fillRect(22,241,436,18);c.fillStyle='#e9e1ce';c.fillText(text,240,253);c.restore();
}
const BRAILLE={a:'1',b:'12',c:'14',d:'145',e:'15',f:'124',g:'1245',h:'125',i:'24',j:'245',k:'13',l:'123',m:'134',n:'1345',o:'135',p:'1234',q:'12345',r:'1235',s:'234',t:'2345',u:'136',v:'1236',w:'2456',x:'1346',y:'13456',z:'1356'};
const RUNES={377:['droite droite','recule recule','force'],378:['reste immobile','deux minutes'],379:['au centre','utilise vol']};
function dotsGlyphs(t){
 const [x,y,w,h]=theme.plaque,lines=RUNES[selected];
 lines.forEach((line,row)=>{
  const start=x+(w-line.length*6)/2,top=y+(h-(lines.length*7-2))/2+row*7;
  [...line].forEach((letter,i)=>{for(const d of BRAILLE[letter]||''){
   const n=Number(d)-1,xx=start+i*6+Math.floor(n/3)*2,yy=top+n%3*2;
   px(xx,yy,1,1,'#c7c4af',.85);
  }});
 });
}
function lampMask(x,y,r=100,strength=1){
 // Quantized falloff keeps the moving torch light consistent with pixel art.
 for(let yy=0;yy<H;yy+=4)for(let xx=0;xx<W;xx+=4){
  const dist=Math.sqrt(((xx-x)/1.2)**2+(yy-y)**2),p=clamp((dist-r*.26)/(r*.85));
  const dark=(.17+Math.round(p*7)/7*.82)*strength;
  px(xx,yy,4,4,'#010307',dark);
 }
}
function torch(t,alpha=1){
 c.save();c.globalAlpha=alpha;c.translate(Math.sin(t*2.4)*2,Math.cos(t*2)*1);
 polygon([[405,270],[384,244],[399,231],[432,270]],'#694c3b',alpha);
 polygon([[392,256],[378,238],[389,229],[408,250]],'#bb946c',alpha);
 polygon([[382,242],[354,218],[362,207],[393,229]],'#1a2630',alpha);
 polygon([[354,218],[351,209],[360,201],[370,204],[363,216]],'#667584',alpha);
 polygon([[354,209],[359,204],[365,206],[360,212]],'#f7dfaa',alpha);
 px(371,222,9,3,'#3d5260',alpha);c.restore();
}
function puzzleCamera(t){
 if(t<5)return {zoom:mix(.91,1.03,ease(t/5)),x:Math.sin(t*2)*1.4,y:Math.abs(Math.sin(t*3.1))*1.1};
 const q=t-5;
 if(selected===377){
  const steps=[clamp((q-1)/.45),clamp((q-2)/.45),clamp((q-3)/.45),clamp((q-4)/.45)];
  return {zoom:1.03-(ease(steps[2])+ease(steps[3]))*.045,x:-12*(ease(steps[0])+ease(steps[1])),y:Math.sin(q*6)*steps.some(p=>p>0&&p<1)*1.8};
 }
 if(selected===378)return {zoom:1.03,x:0,y:0};
 return {zoom:1.03+ease(q/3.4)*.09,x:0,y:ease(q/3.4)*-12+Math.sin(q*5)*Math.max(0,1-q/3)*1.3};
}
function doorImage(open){
 const [x,y,w,h]=theme.door,im=images.get(selected+'-puzzle.png'),gap=ease(open)*w*.54;
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();px(x,y,w,h,'#000000');
 for(const side of [0,1]){
  const sx=x+side*w/2,xx=sx+(side?gap:-gap);
  c.drawImage(im,sx/W*im.width,y/H*im.height,w/2/W*im.width,h/H*im.height,xx,y,w/2,h);
 }
 c.restore();
}
function wind(t){
 const p=ease((t-8.4)/2.2);if(!p)return;
 c.save();c.globalAlpha=p*.55;c.strokeStyle='#c3d4db';c.lineWidth=1;
 for(let i=0;i<5;i++){const y=220-((t*55+i*28)%120),r=12+(220-y)*.3;c.beginPath();c.ellipse(240+Math.sin(t*3+i)*7,y,r,r*.2,t*.4,0,Math.PI*1.6);c.stroke()}
 c.restore();
 for(let i=0;i<7;i++){const y=225-((t*42+i*19)%135),x=240+Math.sin(t*3+i)*30;px(x,y,5,1,'#d6e7e6',p*.6)}
}
function pocketWatch(t){
 const p=clamp((t-5.7)/5.3),angle=p*4*Math.PI-Math.PI/2;
 polygon([[40,242],[42,214],[62,211],[70,242]],'#7b5d42');ellipse(56,213,17,19,'#786e53');ellipse(56,212,14,15,'#c9b989');ellipse(56,212,11,12,'#243648');
 for(let i=0;i<12;i++){const a=i*Math.PI/6;px(56+Math.cos(a)*10,212+Math.sin(a)*10,1,1,'#d4cca7')}
 c.save();c.strokeStyle='#fff2bc';c.lineWidth=1;c.beginPath();c.moveTo(56,212);c.lineTo(56+Math.cos(angle)*9,212+Math.sin(angle)*10);c.stroke();c.restore();
}
function strength(t){
 const age=t-10;if(age<0||age>1.8)return;
 const p=Math.sin(clamp(age/1.8)*Math.PI);
 polygon([[111,270],[128,205],[147,193],[169,208],[163,237],[145,270]],'#a6805f',p);
 for(let i=0;i<4;i++)px(132+i*7,198+(i%2)*2,6,10,'#d3ad82',p);
 const [x,y,w,h]=theme.door;glow(x+w/2,y+h*.6,30,'#f0b267',p*.4);
}
function opening(t){
 const cam=puzzleCamera(Math.min(t,11.99)),op=clamp((t-12)/2.3);
 if(t>=12){const center=ease((t-12)/3);cam.x*=1-center;cam.y*=1-center;cam.zoom=mix(cam.zoom,1,center)}
 c.save();camera(cam.zoom,240,145);c.translate(cam.x,cam.y);
 if(selected===377&&t>10&&t<12.8)c.translate(Math.sin(t*79)*1.2,Math.cos(t*63)*.6);
 background(selected+'-puzzle.png');dotsGlyphs(t);if(t>=12)doorImage(op);
 if(selected===379&&t>8.4&&t<12.8)wind(t);
 c.restore();
 let lx,ly,r;
 if(t<3){lx=170+Math.sin(t*1.5)*100;ly=125+Math.cos(t*1.8)*35;r=105}
 else if(t<5){const p=ease((t-3)/2);lx=mix(100,240,p);ly=mix(110,64,p);r=mix(105,124,p)}
 else{lx=240+Math.sin(t*.7)*4;ly=94;r=135;if(selected===379&&t>6.5&&t<12){ly=94+Math.sin(clamp((t-6.5)/5.5)*Math.PI)*105;r=150}}
 lampMask(lx,ly,r);
 if(t>=5&&t<8.8)caption(theme.inscription,ease((t-5)/.3)*(1-ease((t-8.4)/.4)));
 if(selected===377&&t>9.8&&t<11.8){strength(t);caption('Force.',Math.sin((t-9.8)/2*Math.PI))}
 if(selected===378&&t>6&&t<11.8){pocketWatch(t);if(t>10.6)caption('Deux minutes plus tard…',ease((t-10.6)/.3))}
 if(selected===379&&t>9.1&&t<11.8)caption('Vol.',Math.sin((t-9.1)/2.7*Math.PI));
 torch(t);
 if(t<.45)fade(1-t/.45);
}
function entering(t){
 const [x,y,w,h]=theme.door;
 c.save();camera(1+ease(t/3)*4,240,y+h*.56);background(selected+'-puzzle.png');dotsGlyphs(t+15);doorImage(1);c.restore();
 const power=1-ease((t-1.1)/1.5);
 if(t<2.2){lampMask(240,125,110,1);torch(t+15,power)}
 if(t>1.25)fade(ease((t-1.25)/1.35));
}
function zeroFrame(id){return frameInfo(id,'Idle',0,0,true)}
function luminousPixels(){
 const f=zeroFrame(selected),key=String(selected);
 if(!maskCache.has(key)){
  const data=f.canvas.getContext('2d').getImageData(0,0,f.mode.w,f.mode.h).data,g=eyeGeometry[key],points=[];
  for(let y=0;y<f.mode.h;y++)for(let x=0;x<f.mode.w;x++){
   const at=(y*f.mode.w+x)*4,col=Array.from(data.slice(at,at+3));
   if(y<g.maxY&&data[at+3]>32&&g.colors.some(v=>v.every((n,i)=>n===col[i])))points.push([x,y,col]);
  }
  if(points.length!==7)throw Error('A Regi must have exactly seven aligned face points: '+key+' got '+points.length);
  maskCache.set(key,points);
 }
 return {f,points:maskCache.get(key)};
}
function eyes(t){
 const {f,points}=luminousPixels(),scale=theme.scale,count=Math.floor(clamp((t-.25)/1.75)*7);
 const xx=240-f.cx*scale,yy=208-f.bottom*scale;
 points.forEach(([x,y,col],i)=>{if(i>=count)return;const wx=xx+(x+.5)*scale,wy=yy+(y+.5)*scale;
  glow(wx,wy,scale*1.25,theme.color,.11);px(xx+x*scale,yy+y*scale,scale,scale,'rgb('+col.join(',')+')',.85+.15*Math.sin(t*3+i)**2);
 });
}
function darkChamber(t){fade(1);eyes(t)}
function revelation(t){
 const light=ease(t/.22);
 background(selected+'-chamber.png');
 const kind=t>.7&&t<2.7?'Charge':'Idle',ft=kind==='Charge'?(t-.7)*.28:(t<.7?0:(t-2.7)*.55);
 const bob=t>2.7?Math.sin((t-2.7)*1.5)*.7:0;
 ellipse(240,210,58,9,'#090b12',.5);
 mon(selected,kind,0,240,208+bob,theme.scale,ft,{oneShot:kind==='Charge'||t<.7});
 if(selected===378)for(let i=0;i<28;i++){const x=hash(i,3)*480,y=(hash(i,5)*270+t*8)%270;px(x,y,1,2,'#d2f5ff',.25)}
 if(selected===377)for(let i=0;i<19;i++){const x=hash(i,7)*480,y=(hash(i,8)*270+t*5)%270;px(x,y,1,1,'#ffe1b4',.2)}
 if(selected===379&&t<1.8){const a=(1-t/1.8)*.5;for(let i=0;i<11;i++)px(170+i*14,213,5,1,'#ffc5a4',a)}
 fade(1-light);
 if(t<.22)eyes(t+3.5);
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;if(t<5){shot=1;opening(t)}else if(t<12){shot=2;opening(t)}else if(t<15){shot=3;opening(t)}else if(t<18){shot=4;entering(t-15)}else if(t<21.5){shot=5;darkChamber(t-18)}else{shot=6;revelation(t-21.5)}
 if(t>27.4)fade(ease((t-27.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,species:selected,shot,onlyFaceLights:t>=18&&t<21.5,pointCount:luminousPixels().points.length,revealAt:REVEAL,cryAt:CRY};
}
const ready=(async()=>{
 sprites=await(await fetch('sprites.json')).json();eyeGeometry=await(await fetch('eye-geometry.json')).json();
 await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));
 await Promise.all(IDS.flatMap(id=>[id+'-puzzle.png',id+'-chamber.png']).map(load));
 luminousPixels();document.querySelector('#status').hidden=true;render(0);
})();
window.regisFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,species:selected,eyePoints:()=>luminousPixels().points};await ready;

