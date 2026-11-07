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

const ID=Number(new URLSearchParams(location.search).get('id'))||480;
const FILM_DURATION=30,CUTS=[0,2,4,6,11,16,21],REVEAL=21.2,CRY=22.7;
const CFG={480:{name:'Créhelf',lake:'Lac Savoir',plate:'acuity.png',cave:'acuity-cave.png',color:'#ffe7a1',dark:'#27283f',title:'Les Liens du savoir'},481:{name:'Créfollet',lake:'Lac Vérité',plate:'verity.png',cave:'verity-cave.png',color:'#ffc5e0',dark:'#302238',title:'Le Reflet de l’émotion'},482:{name:'Créfadet',lake:'Lac Courage',plate:'valor.png',cave:'valor-cave.png',color:'#b5efff',dark:'#14283e',title:'La Force de la volonté'}};
const cfg=CFG[ID];let layouts;
function layout(id){
 const m=sprites[id].Idle,fs=Array.from({length:m.frames},(_,i)=>frameInfo(id,'Idle',0,m.durations.slice(0,i).reduce((a,b)=>a+b,0)+.001)),anchor={x:fs[0].cx,y:fs[0].bottom};let l=999,r=-999,top=999,b=-999;
 for(const f of fs){const a=f.canvas.getContext('2d').getImageData(0,0,m.w,m.h).data;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(a[(y*m.w+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x+1);top=Math.min(top,y);b=Math.max(b,y+1)}}
 const scale=Math.min(150/(r-l),110/(b-top));return{anchor,scale,bounds:{left:240+(l-anchor.x)*scale,right:240+(r-anchor.x)*scale,top:190+(top-anchor.y)*scale,bottom:190+(b-anchor.y)*scale}};
}
function spirit(id,t,x,y,scale,alpha=1,tint=null){
 const f=frameInfo(id,'Idle',0,t*.8),anchor=layouts[id].anchor;c.save();c.globalAlpha=alpha;
 if(tint){const mask=document.createElement('canvas');mask.width=f.mode.w;mask.height=f.mode.h;const m=mask.getContext('2d');m.drawImage(f.canvas,0,0);m.globalCompositeOperation='source-in';m.fillStyle=tint;m.fillRect(0,0,mask.width,mask.height);c.drawImage(mask,Math.round(x-anchor.x*scale),Math.round(y-anchor.y*scale),f.mode.w*scale,f.mode.h*scale)}
 else c.drawImage(f.canvas,Math.round(x-anchor.x*scale),Math.round(y-anchor.y*scale),f.mode.w*scale,f.mode.h*scale);c.restore();
}
function snow(t,a=.4){for(let i=0;i<36;i++){const x=(hash(i,41)*480+Math.sin(t*.5+i)*4),y=(hash(i,42)*270+t*17)%270;px(x,y,1+i%2,1+i%2,'#def6ff',a*.65)}}
function ripples(t,y=207,color='#93bdd8',amount=.5){for(let i=0;i<4;i++){const p=(t*.23+i*.25)%1,pts=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*2;pts.push([240+Math.cos(a)*(12+p*83),y+Math.sin(a)*(3+p*14)])}line(pts,color,1,amount*(1-p)*.7)}}
function motes(t,color,a=.5){for(let i=0;i<24;i++){const age=(hash(i,10)+t*.14)%1,x=146+hash(i,11)*188+Math.sin(t+i)*5,y=233-age*140;spark(x,y,1+i%2,color,Math.sin(age*Math.PI)*a*.5)}}
function lightBall(x,y,r,color,a=1){glow(x,y,r*2,color,a);ellipse(x,y,r,r,color,a*.6);ellipse(x,y,r*.36,r*.36,'#fff5e7',a*.9)}
function lakeIntro(t,id){
 const cf=CFG[id];c.save();camera(1+ease(t/2)*.03,240,140);background(cf.plate);if(id===480)snow(t,.3);ripples(t,170,cf.color,.2);
 const p=ease((t-.35)/1.3),x=240+Math.sin(t*1.7)*7,y=134-p*46;lightBall(x,y,3+p*2,cf.color,p*.9);for(let i=0;i<12;i++){const q=i/12;px(x-Math.sin(q*2+t)*4,y+q*25,1,2,cf.color,p*(1-q)*.5)}c.restore();
 if(t<.15)fade(1-ease(t/.15));if(t>1.82)fade(ease((t-1.82)/.18));
}
function chainLink(x,y,angle,edge,alpha=1,scale=1){
 c.save();c.translate(Math.round(x),Math.round(y));c.rotate(angle);c.scale(scale,scale);const pts=edge?[[-1,-4],[1,-4],[2,-2],[2,2],[1,4],[-1,4],[-2,2],[-2,-2],[-1,-4]]:[[-4,-3],[4,-3],[6,-1],[6,1],[4,3],[-4,3],[-6,1],[-6,-1],[-4,-3]];
 line(pts,'#541b32',3.5,alpha);line(pts,'#f45d74',1.8,alpha);line(edge?[[-1,-3],[1,-3],[1,0]]:[[-4,-3],[3,-3],[5,-1]],'#ffc4b8',1,alpha*.9);c.restore();
}
function redChain(t,progress=1,x=240,y=147,rx=82,ry=29,alpha=1,scale=1){
 const links=[];for(let i=0;i<42;i++){const a=i/42*Math.PI*2+t*.15;links.push({i,a,x:x+Math.cos(a)*rx,y:y+Math.sin(a)*ry})}links.sort((a,b)=>a.y-b.y);
 for(const p of links){const appear=ease((progress-p.i/42)*12);if(!appear)continue;chainLink(p.x,p.y,Math.atan2(Math.cos(p.a)*ry,-Math.sin(p.a)*rx),p.i%2,alpha*appear,scale)}
 return Math.min(42,Math.ceil(progress*42));
}
function forging(t){
 background('pillar.png');const p=ease((t-.4)/2.4),s=ease((t-.2)/1.1);glow(240,151,95,'#ef6b91',p*.45);
 const nodes=[{id:480,x:167,y:120},{id:481,x:240,y:88},{id:482,x:313,y:120}];
 for(const n of nodes){const color=CFG[n.id].color,yy=n.y+Math.sin(t*1.6+n.id)*2;glow(n.x,yy-10,22,color,s*.45);spirit(n.id,t,n.x,yy,.88,s*.8,'#1b2035');lightBall(n.x,yy-12,2.1,'#ff8899',s);const pts=[];for(let k=0;k<=24;k++){const q=k/24;pts.push([mix(n.x,240,q),mix(yy-12,147,q)+Math.sin(q*6-t*3)*5])}line(pts,'#ff8d9e',1,s*.55)}
 const links=redChain(t,p);if(t>3){motes(t,'#ff9daa',.65);glow(240,147,73,'#f2859c',.3+Math.sin(t*4)**2*.15)}
 if(t<.25)fade(1-ease(t/.25));if(t>4.7)fade(ease((t-4.7)/.3),'#ffe7ef');return{links,ids:nodes.map(x=>x.id)};
}
function approach(t){
 c.save();camera(1+ease(t/5)*.7,240,137);background(cfg.plate);const p=ease(t/2);glow(240,137,22,cfg.color,p*.35);redChain(t,p,240,143,31,12,(1-ease((t-2.6)/2.1))*.5,.55);ripples(t,157,cfg.color,.35);if(ID===480)snow(t,.2);c.restore();if(t<.3)fade(1-ease(t/.3),'#ffe7ef');
}
function knowledge(t,power=1){
 for(let i=0;i<10;i++){const a=i*Math.PI*.2+t*.35,x=240+Math.cos(a)*63,y=142+Math.sin(a)*34;const variant=i%3;if(variant===0)line([[x,y-4],[x+4,y],[x,y+4],[x-4,y],[x,y-4]],'#ffe3a4',1,power*.7);else if(variant===1){line([[x-3,y-3],[x+3,y-3],[x+3,y+3],[x-3,y+3],[x-3,y-3]],'#ffe3a4',1,power*.7);px(x,y,1,1,'#fff4d5',power)}else{line([[x-3,y],[x+3,y]],'#ffe3a4',1,power*.7);line([[x,y-3],[x,y+3]],'#ffe3a4',1,power*.7)}}
}
function emotion(t,power=1){
 const pulse=.55+Math.sin(t*3.5)**4*.45;glow(240,172,65,'#f8a3cc',power*pulse*.4);
 for(let i=0;i<3;i++){const age=(t*.34+i/3)%1,r=6+age*10,pts=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*2;pts.push([240+Math.pow(Math.sin(a),3)*r*3,204-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*r*.32])}line(pts,'#ffc5df',1,power*(1-age)*.55)}
}
function currents(t,power=.5){
 for(let i=0;i<12;i++){const x=(i*47-t*54+960)%560-40,y=172+i%4*20;const pts=[];for(let k=0;k<12;k++)pts.push([x+k*4,y-Math.sin(k*.3+t*2+i)*3]);line(pts,i%3?'#6bbbe4':'#d1f8ff',1,power*.4)}
}
function mystery(t){
 background(cfg.cave);fade(.32,'#11192d');const p=ease((t-.3)/1.5);glow(240,146,73,cfg.color,p*.42);spirit(ID,t,240,185,layouts[ID].scale*.85,p*.73,cfg.dark);
 if(ID===480){knowledge(t,p);for(let i=0;i<4;i++)ripples(t+i,202,cfg.color,p*.2)}
 else if(ID===481){emotion(t,p);c.save();c.translate(240,204);c.scale(1,-.45);spirit(ID,t,0,0,layouts[ID].scale*.8,p*.4,'#401c45');c.restore();motes(t,cfg.color,p*.5)}
 else{currents(t,.8);const beam=ease((t-.4)/1.7)*(1-ease((t-4)/.8));glow(240,146,34,'#87dfff',beam*.8);line([[240,222],[240,81]],'#55beed',8,beam*.5);line([[240,222],[240,81]],'#d5fbff',2,beam*.8);for(let i=0;i<12;i++){const age=(t*.6+i*.08)%1;px(218+hash(i,5)*44,216-age*137,1,5,'#c0f4ff',beam*(1-age)*.8)}}
 ripples(t,207,cfg.color,p*.45);if(t<.3)fade(1-ease(t/.3));if(t>4.6)fade(ease((t-4.6)/.4),cfg.color);return{shadow:p>.01};
}
function revelation(t){
 background(cfg.cave);const a=ease((t-.2)/.7),entry=1-ease(t/1.2),x=240+Math.sin(t*1.1)*5+(ID===482?entry*24:0),y=190+Math.sin(t*1.6)*2.5-entry*12;glow(x,y-45,73,cfg.color,a*.35);ripples(t,214,cfg.color,.4);spirit(ID,t,x,y,layouts[ID].scale,a);motes(t,cfg.color,a*.65);
 if(ID===480){knowledge(t+8,a*.28)}else if(ID===481)emotion(t+8,a*.35);else currents(t+8,.5);
 if(t<.7)fade(1-ease(t/.7),cfg.color);return{alpha:a,x,y};
}
function render(time){
 const t=clamp(time,0,29.9999);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,forge=null,shadow=null,reveal=null;
 if(t<2){shot=1;lakeIntro(t,480)}else if(t<4){shot=2;lakeIntro(t-2,481)}else if(t<6){shot=3;lakeIntro(t-4,482)}else if(t<11){shot=4;forge=forging(t-6)}else if(t<16){shot=5;approach(t-11)}else if(t<21){shot=6;shadow=mystery(t-16)}else{shot=7;reveal=revelation(t-21)}
 if(t<.35)fade(1-ease(t/.35));if(t>29.4)fade(ease((t-29.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:ID,shot,chainLinks:forge?.links||0,trioIds:forge?.ids||[],ownLake:t>=11?cfg.lake:null,location:t>=16?cfg.cave:t>=11?cfg.plate:null,insideCave:t>=16,shadowVisible:!!shadow?.shadow,heroVisible:!!reveal&&reveal.alpha>.01,reveal,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['acuity.png','verity.png','valor.png','pillar.png','acuity-cave.png','verity-cave.png','valor-cave.png'].map(load));layouts=Object.fromEntries([480,481,482].map(id=>[id,layout(id)]));document.title=cfg.name+' — '+cfg.title;document.querySelector('#status').hidden=true;render(1.2)})();
window.lakeFilm={ready,render,duration:FILM_DURATION,cuts:CUTS,id:ID,config:cfg,layout:()=>layouts[ID],cryAt:CRY,revealAt:REVEAL};await ready;
