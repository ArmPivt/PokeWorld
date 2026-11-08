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

const ID=Number(new URLSearchParams(location.search).get('id'))||491,IS_DARK=ID===491,D=30,REVEAL=21,CRY=22.7;
const CFG={491:{name:'Darkrai',title:'Le Rêve dévoré',color:'#c85a7b',dark:'#10101c',width:192,height:154,foot:222},488:{name:'Cresselia',title:'Le Rêve retrouvé',color:'#fff0bd',dark:'#96aac6',width:218,height:144,foot:222}};
const cfg=CFG[ID];let layouts;
function corruption(t){const n=ease((t-5)/19);return IS_DARK?n:1-n}
function layout(id){const mode=sprites[id].Idle,frames=mode.durations.map((_,i)=>frameInfo(id,'Idle',0,mode.durations.slice(0,i).reduce((a,b)=>a+b,0)+.001)),anchor={x:frames[0].cx,y:frames[0].bottom};let left=999,right=-999,top=999,bottom=-999;for(const f of frames){const d=f.canvas.getContext('2d').getImageData(0,0,mode.w,mode.h).data;for(let y=0;y<mode.h;y++)for(let x=0;x<mode.w;x++)if(d[(y*mode.w+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1)}}const cf=CFG[id],scale=Math.min(cf.width/(right-left),cf.height/(bottom-top));return{anchor,scale,bounds:{left:240+(left-anchor.x)*scale,right:240+(right-anchor.x)*scale,top:cf.foot+(top-anchor.y)*scale,bottom:cf.foot+(bottom-anchor.y)*scale}}}
function creature(t,x=240,y=222,alpha=1,tint=null){const f=frameInfo(ID,'Idle',0,t*.85),l=layouts[ID];c.save();c.globalAlpha=alpha;if(tint){const m=document.createElement('canvas');m.width=f.mode.w;m.height=f.mode.h;const a=m.getContext('2d');a.drawImage(f.canvas,0,0);a.globalCompositeOperation='source-in';a.fillStyle=tint;a.fillRect(0,0,m.width,m.height);c.drawImage(m,Math.round(x-l.anchor.x*l.scale),Math.round(y-l.anchor.y*l.scale),f.mode.w*l.scale,f.mode.h*l.scale)}else c.drawImage(f.canvas,Math.round(x-l.anchor.x*l.scale),Math.round(y-l.anchor.y*l.scale),f.mode.w*l.scale,f.mode.h*l.scale);c.restore()}
const warpCanvas=document.createElement('canvas');warpCanvas.width=W;warpCanvas.height=H;const warpCtx=warpCanvas.getContext('2d');
function garden(t,n,scale=1,x=240,y=140){c.save();camera(scale,x,y);background('garden.png');imageOverlay('nightmare.png',n);c.restore();if(n>.05){warpCtx.clearRect(0,0,W,H);warpCtx.drawImage(stage,0,0);for(let row=0;row<H;row+=3){const off=Math.round(Math.sin(t*1.4+row*.043)*n*3);c.drawImage(warpCanvas,0,row,W,3,off,row,W,3);if(off>0)c.drawImage(warpCanvas,W-off,row,off,3,0,row,off,3);else if(off<0)c.drawImage(warpCanvas,0,row,-off,3,W+off,row,-off,3)}}}
function petals(t,n,amount=1){for(let i=0;i<32;i++){const p=(hash(i,13)+t*.055)%1,x=(hash(i,14)*590+t*(9+hash(i,15)*15))%590-55,y=hash(i,16)*270+Math.sin(t*.8+i)*12;c.save();c.translate(x,y);c.rotate(t*.7+i);px(-2,-1,4,2,n>.5?(i%3?'#6a264d':'#b44462'):(i%3?'#ffe5f5':'#fff6d2'),amount*(.7-n*.3));c.restore()}}
function ripples(t,n,amount=.5){for(let i=0;i<4;i++){const p=(t*.21+i*.25)%1,pts=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*2;pts.push([240+Math.cos(a)*(7+p*67),133+Math.sin(a)*(2+p*10)])}line(pts,n>.5?'#b34c76':'#eee0ff',1,(1-p)*amount)}}
function feather(x,y,t,power=1,scale=1,n=0){c.save();c.translate(x,y);c.rotate(-.5+Math.sin(t*.6)*.15);c.scale(scale,scale);glow(0,0,20,n>.5?'#9e355e':'#fff0b9',power*.5);const pts=[[-3,17],[-8,8],[-7,-3],[-2,-14],[3,-22],[7,-18],[9,-7],[7,4],[1,12],[-3,17]];polygon(pts,n>.5?'#562841':'#fff0cb',power*.9);line([[-4,16],[2,-14]],n>.5?'#a64360':'#dfc5e6',1,power);for(let i=0;i<5;i++){const yy=8-i*4;line([[-2,yy],[i%2?5:6,yy-4]],n>.5?'#9a3655':'#f3d8fb',1,power*.6)}c.restore()}
function tendrils(t,n){if(n<.02)return;for(let side=0;side<2;side++)for(let i=0;i<6;i++){const root=side?480:0,y=78+i*35,reach=n*(26+i%3*15),pts=[[root,y+30]];for(let k=0;k<15;k++){const q=k/14;pts.push([root+(side?-1:1)*reach*q,y+30-q*35+Math.sin(q*7+t+i)*q*7])}line(pts,'#191123',8,n*.65);line(pts,'#4b203e',2,n*.5)}}
function lightWave(t,n){const p=(t*.19)%1,pts=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;pts.push([240+Math.cos(a)*(10+p*180),202+Math.sin(a)*(5+p*55)])}line(pts,'#fff0bd',2,(1-p)*(1-n)*.65);glow(240,193,85,'#fff0bd',(1-n)*.24)}
function bedroom(t,n){c.save();camera(1+ease(t/4)*.08,240,106);background('bedroom.png');fade(n*.48,'#110c23');c.restore();tendrils(t,n*.7);const breathing=.05+Math.sin(t*1.6)**2*.025;glow(240,135,100,n>.5?'#5e2b5c':'#f4e5ce',breathing);if(t>3.5)fade(ease((t-3.5)/.5),IS_DARK?'#ede6fa':'#160c27')}
function dreamShot(t,n,shot){
 if(shot===2){garden(t,n,1+(t-4)*.008,240,140);petals(t,n,.5);ripples(t,n,.35);if(t<4.5)fade(1-ease((t-4)/.5),IS_DARK?'#ede6fa':'#160c27');return}
 if(shot===3){garden(t,n,1.2,240,104);petals(t,n,.7);const u=t-9;feather(240+Math.sin(u*.7)*9,142-u*3,t,1,1.3,n);ripples(t,n,.5);if(IS_DARK&&u>2){for(let i=0;i<15;i++){const p=(u*.3+i*.07)%1;px(233+hash(i,27)*20,135-p*44,1,2,'#8b375b',p*.7)}}else if(!IS_DARK)lightWave(u,n);return}
 if(shot===4){garden(t,n,1.12,240,174);petals(t,n,.8);ripples(t,n,.55);tendrils(t,n);if(!IS_DARK){lightWave(t-14,n);feather(240,130,t,.6,.7,n)}else{glow(240,184,55,'#7d244b',n*.45);for(let i=0;i<18;i++){const p=(t*.16+hash(i,34))%1;px(180+hash(i,35)*120,220-p*104,2,2,'#aa3f66',p*n*.4)}}return}
 garden(t,n);petals(t,n,.8);ripples(t,n,.5);tendrils(t,n);const a=ease((t-18)/2);creature(t,240,223-Math.sin(t)*2,a*.65,cfg.dark);glow(240,156,70,cfg.color,a*.3);if(!IS_DARK)lightWave(t,n);if(t>20.5)fade(ease((t-20.5)/.5),IS_DARK?'#26132d':'#fff2d6');
}
function revelation(t,n){const u=t-21,a=ease(u/.8);garden(t,n);petals(t,n,.85);ripples(t,n,.5);tendrils(t,n*.7);const y=222-Math.sin(u*1.15)*3;glow(240,y-65,87,cfg.color,a*.2);if(IS_DARK){for(let i=0;i<9;i++){const p=(t*.12+i*.11)%1;ellipse(190+hash(i,45)*100,220-p*55,10+p*10,4+p*7,'#221126',a*(1-p)*.15)}}else lightWave(t,n);creature(t,240,y,a);if(u<.8)fade(1-ease(u/.8),IS_DARK?'#26132d':'#fff2d6');if(u>8.4)fade(ease((u-8.4)/.6));return{alpha:a,x:240,y}}
function render(time){const t=clamp(time,0,29.9999),n=corruption(t);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);const shot=t<4?1:t<9?2:t<14?3:t<18?4:t<21?5:6;let hero=null;if(shot===1)bedroom(t,n);else if(shot<6)dreamShot(t,n,shot);else hero=revelation(t,n);if(t<.3)fade(1-ease(t/.3));out.imageSmoothingEnabled=false;out.clearRect(0,0,960,540);out.drawImage(stage,0,0,960,540);return{time:t,species:ID,shot,nightmareAmount:n,heroVisible:!!hero&&hero.alpha>.01,revealAt:21,cryAt:22.7,location:shot===1?'bedroom':'matched-garden',cameraPair:shot}}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['bedroom.png','garden.png','nightmare.png'].map(load));layouts=Object.fromEntries([488,491].map(id=>[id,layout(id)]));document.title=cfg.name+' — '+cfg.title;document.querySelector('#status').hidden=true;render(1)})();
window.dreamFilm={ready,render,duration:D,id:ID,config:cfg,layout:()=>layouts[ID],cryAt:CRY,revealAt:REVEAL};await ready;
