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

const selected=486,REVEAL=21.5,CRY=22.2,CUTS=[0,5,7,11.2,13,16,18,21.5];
const FACE=[[32,17],[30,19],[34,19],[32,22],[32,25]],SCALE=4,FOOT=232;
const colors=['#f8b268','#a8ebff','#dce6eb'];
function fade(a,color='#000'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.restore()}
function caption(text,alpha=1){c.save();c.globalAlpha=clamp(alpha);c.font='8px monospace';c.textAlign='center';c.fillStyle='#070b13';c.fillRect(12,241,456,18);c.fillStyle='#ece5c9';c.fillText(text,240,253);c.restore()}
function lampMask(x,y,r=125){for(let yy=0;yy<H;yy+=4)for(let xx=0;xx<W;xx+=4){const dist=Math.hypot((xx-x)/1.2,yy-y),p=clamp((dist-r*.26)/(r*.85));px(xx,yy,4,4,'#010307',.2+Math.round(p*7)/7*.78)}}
function torch(t,alpha=1){c.save();c.translate(Math.sin(t*2.4)*2,Math.cos(t*2));polygon([[405,270],[384,244],[399,231],[432,270]],'#694c3b',alpha);polygon([[392,256],[378,238],[389,229],[408,250]],'#bb946c',alpha);polygon([[382,242],[354,218],[362,207],[393,229]],'#1a2630',alpha);polygon([[354,218],[351,209],[360,201],[370,204],[363,216]],'#667584',alpha);polygon([[354,209],[359,204],[365,206],[360,212]],'#f7dfaa',alpha);c.restore()}
const BRAILLE={a:'1',b:'12',c:'14',d:'145',e:'15',f:'124',g:'1245',h:'125',i:'24',j:'245',k:'13',l:'123',m:'134',n:'1345',o:'135',p:'1234',q:'12345',r:'1235',s:'234',t:'2345',u:'136',v:'1236',w:'2456',x:'1346',y:'13456',z:'1356'};
function runes(){['roche glace acier','reunis le colosse'].forEach((line,row)=>{const x=240-line.length*3;[...line].forEach((a,i)=>{for(const d of BRAILLE[a]||''){const n=+d-1;px(x+i*6+Math.floor(n/3)*2,113+row*9+n%3*2,1,1,'#d4d8ce')}})})}
function arch(){c.beginPath();c.moveTo(169,174);c.lineTo(169,102);c.bezierCurveTo(169,34,309,34,309,102);c.lineTo(309,174);c.closePath()}
function gate(p,t){c.save();arch();c.clip();px(168,46,142,130,'#000');for(let side=0;side<2;side++){c.save();c.translate((side?1:-1)*ease(p)*78,0);const x=169+side*70;px(x,47,70,127,'#434d67');for(let y=50;y<174;y+=17){for(let xx=x-10+(Math.floor(y/17)%2)*20;xx<x+70;xx+=35){px(xx,y,33,15,'#515d79');px(xx,y,33,1,'#7a88a3');px(xx,y+14,33,1,'#27384e')}}px(side?240:237,49,3,125,'#263245');c.save();c.beginPath();c.rect(x,47,70,127);c.clip();runes();c.restore();c.restore()}c.restore();
 if(t>=11.2&&p<.95){const power=ease((t-11.2)/1.4)*(1-p);glow(240,94,24,'#fff0ac',power);ellipse(240,94,7,7,'#faf1c2',power);for(let i=0;i<12;i++){const a=i*Math.PI/6+t*.5;px(240+Math.cos(a)*20,94+Math.sin(a)*20,2,2,'#fff1bc',power)}}}
function sigil(x,y,i,p,t){const color=colors[i];glow(x,y,22,color,p*.5);c.save();c.globalAlpha=p*.8;c.strokeStyle=color;c.lineWidth=1;c.beginPath();c.ellipse(x,y,26,6,0,0,Math.PI*2);c.stroke();c.restore();for(let n=0;n<8;n++){const a=n*Math.PI/4+t*.5;px(x+Math.cos(a)*22,y+Math.sin(a)*5,2,1,color,p)}}
function seals(t){const ids=[377,378,379],xs=[120,240,360],ys=[207,220,207];ids.forEach((id,i)=>{const born=7+i*1.2,p=ease((t-born)/.65);if(!p)return;const y=ys[i];sigil(xs[i],y,i,p,t);const phase=t-born;mon(id,'Idle',0,xs[i],y,1.45,phase*.7,{alpha:p});if(phase<.8){glow(xs[i],y-22,29,colors[i],Math.sin(clamp(phase/.8)*Math.PI));for(let j=0;j<11;j++)px(xs[i]-18+j*3,y-(phase*65+j*7)%56,1,4,colors[i],1-phase/.8)}if(t>=11.2){const q=ease((t-11.2)/1.2),end=[mix(xs[i],240,q),mix(y-25,94,q)];c.save();c.globalAlpha=.6;c.strokeStyle=colors[i];c.lineWidth=2;c.beginPath();c.moveTo(xs[i],y-25);c.lineTo(...end);c.stroke();c.restore();glow(...end,6,colors[i],.5)}})}
function hall(t){const walk=clamp(t/5),zoom=mix(.94,1,ease(walk));c.save();camera(zoom,240,135,t<5?.45:t>12.9&&t<16?.7:0,t);background('486-temple.png');gate(clamp((t-13)/2.5),t);seals(t);c.restore();
 const lx=t<3?170+Math.sin(t*1.5)*105:t<7?240:t<11.2?mix(120,360,clamp((t-7)/3.2)):240,ly=t<5?110+Math.cos(t*1.8)*26:t<7?117:t<11.2?169:100;
 lampMask(lx,ly,t<7?125:180);torch(t);
 if(t>=5&&t<7)caption('Reunis la roche, la glace et l’acier.',Math.sin((t-5)/2*Math.PI));
 if(t>=7&&t<10.8){const i=Math.min(2,Math.floor((t-7)/1.2));caption(['Regirock…','Regice…','Registeel…'][i],Math.sin(clamp((t-(7+i*1.2))/1.2)*Math.PI))}
 if(t>=11.5&&t<13)caption('Les trois sceaux repondent.',Math.sin((t-11.5)/1.5*Math.PI));
 if(t<.5)fade(1-t/.5);
}
function enter(t){c.save();camera(1+ease(t/2)*4,240,108);background('486-temple.png');gate(1,16+t);c.restore();if(t<1.5){lampMask(240,110,110);torch(t+16,1-ease(t/1.5))}fade(ease((t-.65)/1.1))}
function faceLights(t,alpha=1){const f=frameInfo(486,'Idle',0,0,true),xx=240-f.cx*SCALE,yy=FOOT-f.bottom*SCALE,n=Math.floor(clamp(t/1.8)*FACE.length);FACE.forEach(([x,y],i)=>{if(i>=n)return;const wx=xx+(x+.5)*SCALE,wy=yy+(y+.5)*SCALE;glow(wx,wy,4,'#ffed95',alpha*.25);px(xx+x*SCALE,yy+y*SCALE,SCALE,SCALE,'#fff0b4',alpha*(.7+.3*Math.sin(t*3+i)**2))})}
function reveal(t){c.save();if(t>.7&&t<1.4)c.translate(Math.sin(t*75)*(1.4-t),Math.cos(t*62)*.35);background('486-temple.png',1.18,0,3);fade(.22,'#0a1019');ellipse(240,234,72,9,'#000',.6);const kind=t>.7&&t<2.2?'Charge':'Idle',ft=kind==='Charge'?(t-.7)*.18:t<.7?0:t-2.2;mon(486,kind,0,240,FOOT,SCALE,ft,{oneShot:kind==='Charge'||t<.7});c.restore();
 for(let i=0;i<24;i++){const x=hash(i,2)*480,y=(hash(i,3)*270+t*7)%270;px(x,y,1,1,'#c4d9e6',.25)}
 fade(1-ease(t/.35));if(t<.65)faceLights(3,1-ease((t-.25)/.4));if(t>.35&&t<1.05){const p=Math.sin((t-.35)/.7*Math.PI);glow(240,176,80,'#f6e3a5',p*.3)}
}
function render(time){const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot;if(t<16){shot=t<5?1:t<7?2:t<13?3:4;hall(t)}else if(t<18){shot=5;enter(t-16)}else if(t<REVEAL){shot=6;fade(1);faceLights(t-18)}else{shot=7;reveal(t-REVEAL)}if(t>27.4)fade(ease((t-27.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);return{time:t,shot,species:486,onlyFaceLights:t>=18&&t<REVEAL}}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await load('486-temple.png');document.querySelector('#status').hidden=true;render(0)})();
window.regisFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,species:selected,eyePoints:()=>FACE};await ready;
