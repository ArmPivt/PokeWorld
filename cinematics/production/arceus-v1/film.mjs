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

const selected=493,REVEAL=25.2,CRY=26.3,CUTS=[0,5,9,12,14.2,16.4,18.6,20.8,22,25.2];
const letters='abcdefghijklmnopqrstuvwxyz',glyphCache=new Map();
const inscriptions=['AVANT LE TEMPS','AVANT L ESPACE','LA LUMIERE'];
const glyphPositions=inscriptions.flatMap((s,row)=>[...s].flatMap((a,i)=>a===' '?[]:[{letter:a.toLowerCase(),x:240+(i-(s.length-1)/2)*18,y:91+row*42}]));
function fade(a,color='#000'){px(0,0,W,H,color,clamp(a))}
function glyph(letter,x,y,size,color='#b5bac9',alpha=1,alive=0,angle=0){
 const key=letter+color;let im=glyphCache.get(key);
 if(!im){const src=images.get('unown/'+letter+'.png'),can=document.createElement('canvas');can.width=src.width;can.height=src.height;const mc=can.getContext('2d');mc.drawImage(src,0,0);let minX=can.width,maxX=0,minY=can.height,maxY=0;const data=mc.getImageData(0,0,can.width,can.height).data;for(let yy=0;yy<can.height;yy++)for(let xx=0;xx<can.width;xx++)if(data[(yy*can.width+xx)*4+3]>30){minX=Math.min(minX,xx);maxX=Math.max(maxX,xx);minY=Math.min(minY,yy);maxY=Math.max(maxY,yy)}
  const w=maxX-minX+1,h=maxY-minY+1;const ink=document.createElement('canvas');ink.width=w;ink.height=h;const ic=ink.getContext('2d');ic.drawImage(src,minX,minY,w,h,0,0,w,h);ic.globalCompositeOperation='source-in';ic.fillStyle=color;ic.fillRect(0,0,w,h);im={ink,original:src,minX,minY,w,h};glyphCache.set(key,im)}
 const scale=size/Math.max(im.w,im.h);c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.drawImage(im.ink,-im.w*scale/2,-im.h*scale/2,im.w*scale,im.h*scale);
 if(alive>0){c.globalAlpha=alpha*alive;c.drawImage(im.original,im.minX,im.minY,im.w,im.h,-im.w*scale/2,-im.h*scale/2,im.w*scale,im.h*scale)}c.restore();
}
function stars(t,count=200){for(let i=0;i<count;i++){const x=(hash(i,2)*480+t*(1+hash(i,1)*2))%480,y=hash(i,3)*270,a=.3+.6*Math.sin(t*.8+i)**2;px(x,y,i%19===0?2:1,1,'#b7cce8',a)}}
function line(points,color='#f1e7bc',a=1,width=1,close=false){c.save();c.globalAlpha=a;c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();c.stroke();c.restore()}
function ring(x,y,r,color,a=1,flat=1){c.save();c.globalAlpha=a;c.strokeStyle=color;c.lineWidth=1;c.beginPath();c.ellipse(x,y,r,r*flat,0,0,Math.PI*2);c.stroke();c.restore()}
function seal(t,scale=1,alpha=1){c.save();c.translate(240,135);c.scale(scale,scale);const color='#fff0ce';for(const r of [108,101,78,31])ring(0,0,r,color,alpha*.65);const nodes=[-Math.PI/2,Math.PI/6,Math.PI*5/6].map(a=>[Math.cos(a)*79,Math.sin(a)*79]);line(nodes,color,alpha*.75,1,true);for(const [x,y]of nodes){for(const r of [26,20,9])ring(x,y,r,color,alpha*.8);for(let n=0;n<3;n++){const a=n*Math.PI*2/3+t*.2;ring(x+Math.cos(a)*13,y+Math.sin(a)*13,7,color,alpha*.7)}}
 for(let i=0;i<13;i++){const a=i/13*Math.PI*2+t*.12;ring(Math.cos(a)*91,Math.sin(a)*91,2,color,alpha*.65)}c.restore()}
function orbitGlyphs(t,r=112,alpha=1){for(let i=0;i<26;i++){const a=i/26*Math.PI*2+t*.28;glyph(letters[i],240+Math.cos(a)*r,135+Math.sin(a)*r*.77,13,'#f4dd96',alpha,.25,-Math.sin(a)*.16)}}
function wall(t){const zoom=1+ease(Math.min(t,5)/5)*.08,detach=ease((t-5)/4);c.save();camera(zoom,240,135);background('493-ruins.png');fade(.24,'#02091d');if(t>5)fade(detach*.97,'#02030d');glyphPositions.forEach((g,i)=>{const a=i/glyphPositions.length*Math.PI*2+(t-5)*.15;const x=mix(g.x,240+Math.cos(a)*108,detach),y=mix(g.y,135+Math.sin(a)*91,detach),wake=ease((t-1.5-i*.04)/1.5);if(t>3)glow(x,y,10,'#edd99a',wake*.15);glyph(g.letter,x,y,21+detach*2,'#949fbe',1,ease((t-4.2)/1.3),detach*Math.sin(a)*.1)});c.restore();
 if(t>6.2){stars(t,90);seal(t,.6+detach*.15,detach*.35)}if(t<.65)fade(1-t/.65)}
function passage(t){fade(1,'#02030d');stars(t,180);const p=ease(t/3);seal(t,.76+p*.5,.85);orbitGlyphs(t,113+p*42,1-p*.35);glow(240,135,10+p*35,'#fff0c6',.5);ellipse(240,135,4+p*12,4+p*12,'#fff6dc',.7);for(let i=0;i<38;i++){const a=hash(i,4)*Math.PI*2,r=(hash(i,5)*130+t*35)%180;line([[240+Math.cos(a)*r,135+Math.sin(a)*r*.7],[240+Math.cos(a)*(r+6),135+Math.sin(a)*(r+6)*.7]],'#c9cee9',p*.5)}fade(ease((t-2.6)/.4)*.8,'#f9f3df')}
function galaxy(t){fade(1,'#070c22');stars(t);for(let i=0;i<950;i++){const r=hash(i,11)**.7*170,a=r*.038+(i%3)*Math.PI*2/3+t*.1+hash(i,12)*.45,x=240+Math.cos(a)*r,y=135+Math.sin(a)*r*.48;px(x,y,i%11===0?2:1,1,['#7c78c9','#b6a6e5','#79b4d8','#f7e4be'][i%4],.25+hash(i,13)*.6)}glow(240,135,55,'#c5b1e9',.4);ellipse(240,135,17,9,'#f7dfb9',.45)}
function planet(t){fade(1,'#030717');stars(t);const r=89,cx=240,cy=135;for(let yy=-r;yy<r;yy+=2)for(let xx=-r;xx<r;xx+=2){const z=1-(xx*xx+yy*yy)/(r*r);if(z<0)continue;const longitude=Math.atan2(xx,Math.sqrt(z)*r)+t*.11,lat=Math.asin(yy/r),land=Math.sin(longitude*4+Math.sin(lat*5)*2)+Math.cos(lat*8-longitude*2),clouds=Math.sin(longitude*12+lat*9)+Math.cos(lat*17-longitude*7),light=.35+.65*clamp((-xx/r*.6-yy/r*.4+Math.sqrt(z))/.9);let col=clouds>1.15?[212,226,229]:land>.58?[77,138,95]:[33,91,146];if(Math.abs(yy)>r*.86)col=[202,218,230];px(cx+xx,cy+yy,2,2,'rgb('+col.map(v=>Math.round(v*light)).join(',')+')')}ring(cx,cy,r+2,'#a4b9d3',.4);glow(cx-35,cy-25,90,'#7eacd0',.08)}
function livingWorld(t){background('world-forest.png',1.03+t*.017,Math.sin(t)*2,-t);fade(.12,'#09152e');for(let i=0;i<45;i++){const x=(hash(i,8)*480+t*7)%480,y=hash(i,9)*270;px(x,y,1,2,'#f4e3b6',.2)}}
function cells(t){fade(1,'#281e44');for(let i=0;i<53;i++){const x=(hash(i,10)*560+t*(5+hash(i,11)*8))%560-40,y=(hash(i,12)*340+Math.sin(t+i)*12)%340-35,r=7+hash(i,13)*16;ellipse(x,y,r,r*.65,'#8b5f88',.7);ellipse(x-1,y-1,r*.76,r*.43,'#c19ab2',.6);ellipse(x+1,y,r*.35,r*.22,'#655b97',.85);px(x-r*.4,y-r*.2,3,1,'#e3bcca',.6)}}
function montage(t){const local=t-12;let shot;if(t<14.2){galaxy(local);shot=4}else if(t<16.4){planet(t-14.2);shot=5}else if(t<18.6){livingWorld(t-16.4);shot=6}else if(t<20.8){cells(t-18.6);shot=7}else{galaxy(local);const p=ease((t-20.8)/1.2);fade(p*.8,'#f9f1de');glow(240,135,40+p*150,'#fff4cb',p);shot=8}seal(t,.76,.75);orbitGlyphs(t,109,.45);const cut=[12,14.2,16.4,18.6,20.8].filter(x=>t>=x).at(-1),enter=ease((t-cut)/.25);fade((1-enter)*.35,'#e9e1d9');return shot}
function origin(t){const q=t-22,reveal=ease((t-REVEAL)/1.3);background('493-origin.png',1+ease(q/10)*.06,0,1);fade(1-ease(q/1.4),'#f6f0df');const foot=mix(156,188,ease((t-24.5)/3));
 if(t<25.6){const p=1-ease((t-24.8)/.8);glow(240,125,25+Math.sin(t*2)*4,'#fff7d0',p);ellipse(240,125,8,10,'#fffbe9',p);orbitGlyphs(t,100,p*.45)}
 if(t>=24.5){ellipse(240,192,35,4,'#4d4361',reveal*.18);if(t<25.6)mon(493,'Idle',1,240,foot,3.6,0,{tint:'#fff8de',alpha:ease((t-24.5)/.4)*(1-reveal)});mon(493,t>26.2&&t<27.7?'Charge':'Idle',1,240,foot,3.6,t>26.2&&t<27.7?(t-26.2)*.18:Math.max(0,t-27.7)*.5,{alpha:reveal,oneShot:t>26.2&&t<27.7});}
 for(let i=0;i<50;i++){const x=hash(i,1)*480,y=(hash(i,2)*270-q*(5+hash(i,3)*7)+540)%270;px(x,y,i%9===0?2:1,1,'#fff2ca',(.15+hash(i,4)*.4)*ease(q/2))}if(t>26.3&&t<27.3){const a=t-26.3;ring(240,176,12+a*110,'#fff8dc',(1-a)*.7,.35)}
}
function render(time){const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot;if(t<9){wall(t);shot=t<5?1:2}else if(t<12){passage(t-9);shot=3}else if(t<22)shot=montage(t);else{origin(t);shot=t<REVEAL?9:10}if(t>31.4)fade(ease((t-31.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);return{time:t,shot,species:493,unownCount:26,revealAt:REVEAL}}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all(Object.values(sprites['493']).map(a=>load(a.src)));await Promise.all(['493-ruins.png','493-origin.png','world-forest.png',...letters.split('').map(l=>'unown/'+l+'.png')].map(load));document.querySelector('#status').hidden=true;render(0)})();
window.arceusFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,species:493,inscriptions,unownCount:26};await ready;
