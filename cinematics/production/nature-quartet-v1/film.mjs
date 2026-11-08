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

const ID=Number(new URLSearchParams(location.search).get('id'))||485;
const D=28,REVEAL=20,CRY=21.7;
const CFG={485:{name:'Heatran',title:'Le Souffle du basalte',plate:'heatran-cave.png',color:'#ffb157',dark:'#281820',width:195,height:126,foot:202},489:{name:'Phione',title:'La Bulle des marées',plate:'water-cave.png',color:'#9eeeff',dark:'#143452',width:160,height:112,foot:211},490:{name:'Manaphy',title:'Le Cœur de la mer',plate:'water-cave.png',color:'#86ebff',dark:'#143452',width:170,height:118,foot:211},492:{name:'Shaymin',title:'L’Île de la gratitude',plate:'flower-clearing.png',color:'#d2f4a1',dark:'#345234',width:168,height:88,foot:220}};
const cfg=CFG[ID],aquatic=ID===489||ID===490;let layouts;
function layout(id){const mode=sprites[id].Idle,frames=mode.durations.map((_,i)=>frameInfo(id,'Idle',0,mode.durations.slice(0,i).reduce((a,b)=>a+b,0)+.001)),anchor={x:frames[0].cx,y:frames[0].bottom};let left=999,right=-999,top=999,bottom=-999;for(const f of frames){const d=f.canvas.getContext('2d').getImageData(0,0,mode.w,mode.h).data;for(let y=0;y<mode.h;y++)for(let x=0;x<mode.w;x++)if(d[(y*mode.w+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1)}}const cf=CFG[id],scale=Math.min(cf.width/(right-left),cf.height/(bottom-top));return{anchor,scale,bounds:{left:240+(left-anchor.x)*scale,right:240+(right-anchor.x)*scale,top:cf.foot+(top-anchor.y)*scale,bottom:cf.foot+(bottom-anchor.y)*scale}}}
function creature(t,x=240,y=cfg.foot,alpha=1,tint=null){const f=frameInfo(ID,'Idle',0,t*.85),l=layouts[ID];c.save();c.globalAlpha=alpha;if(tint){const mask=document.createElement('canvas');mask.width=f.mode.w;mask.height=f.mode.h;const m=mask.getContext('2d');m.drawImage(f.canvas,0,0);m.globalCompositeOperation='source-in';m.fillStyle=tint;m.fillRect(0,0,mask.width,mask.height);c.drawImage(mask,Math.round(x-l.anchor.x*l.scale),Math.round(y-l.anchor.y*l.scale),f.mode.w*l.scale,f.mode.h*l.scale)}else c.drawImage(f.canvas,Math.round(x-l.anchor.x*l.scale),Math.round(y-l.anchor.y*l.scale),f.mode.w*l.scale,f.mode.h*l.scale);c.restore()}
function ripples(t,x=240,y=220,color='#a6eaff',amount=.5){for(let i=0;i<5;i++){const p=(t*.28+i*.2)%1,points=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*2;points.push([x+Math.cos(a)*(15+p*92),y+Math.sin(a)*(3+p*17)])}line(points,color,1,(1-p)*amount*.6)}}
function motes(t,color,amount=.5){for(let i=0;i<30;i++){const p=(t*.12+hash(i,52))%1,x=155+hash(i,53)*170+Math.sin(t+i)*4,y=226-p*150;spark(x,y,i%4===0?2:1,color,Math.sin(p*Math.PI)*amount*.65)}}
function bubbles(t,amount=1){for(let i=0;i<22;i++){const p=(t*.14+hash(i,61))%1,x=175+hash(i,62)*130+Math.sin(t+i)*5,y=235-p*170,r=2+hash(i,63)*5;const pts=[];for(let j=0;j<=20;j++){const a=j/20*Math.PI*2;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}line(pts,'#bcefff',1,Math.sin(p*Math.PI)*amount*.6);px(x-r*.3,y-r*.4,1,1,'#efffff',amount*.7)}}
function caustics(t,power=.2){for(let i=0;i<12;i++){const x=88+hash(i,72)*310,y=48+hash(i,73)*85,a=t*.4+i;line([[x,y],[x+12+Math.sin(a)*4,y+7],[x+23,y+4],[x+33,y+14]],'#87e7f8',1,power*(.5+Math.sin(a)**2*.5))}}
function embers(t,amount=.7){for(let i=0;i<42;i++){const p=(hash(i,21)+t*.17)%1,x=35+hash(i,22)*410+Math.sin(p*6+i)*9,y=270-p*210;px(x,y,1+i%2,2,'#ffbd65',amount*(1-p)*.8)}}
function lava(t,power=.4){const pulse=.5+Math.sin(t*2)**2*.5;glow(240,231,190,'#ff8a32',power*pulse*.2);for(let i=0;i<12;i++){const x=20+hash(i,32)*440,y=226+hash(i,33)*20;line([[x,y],[x+10+Math.sin(t+i)*3,y-1]],'#ffd08a',1,power*.6)}}
function petals(t,power=1){for(let i=0;i<26;i++){const x=(hash(i,41)*600+t*(15+hash(i,42)*17))%600-60,y=hash(i,43)*270+Math.sin(t*.8+i)*13;c.save();c.translate(x,y);c.rotate(t*.9+i);px(-2,-1,4,2,i%3?'#ffe2e8':'#ffffdf',power*.75);c.restore()}}
function flower(x,y,size,color,open=1){const r=size*open;line([[x,y],[x-1,y+size*1.6]],'#4a8241',1,.8);for(let j=0;j<5;j++){const a=j*Math.PI*.4;ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r,r*.65,r*.65,color,.9)}ellipse(x,y,r*.4,r*.4,'#ffe8a1',1)}
function bloom(t,power=1){for(let i=0;i<32;i++){const x=80+hash(i,91)*320,y=192+hash(i,92)*57,p=ease((t-Math.hypot(x-240,(y-215)*2)/90)*1.2)*power;if(Math.abs(x-240)<77&&y<233)continue;flower(x,y,2.5+i%3,['#fff4e7','#ffc9d8','#ffde88'][i%3],p)}}
function waterHeart(t,a=1){const points=[];for(let i=0;i<=90;i++){const q=i/90*Math.PI*2;points.push([240+16*Math.sin(q)**3*2.7,136-(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q))*2.8])}line(points,'#b8f6ff',2,a*.8);glow(240,141,65,'#96edff',a*.6);}
function heatran(t){
 if(t<4){const u=t/4;c.save();camera(1+ease(u)*.25,240,160);background('volcano.png');embers(t,.4);c.restore();if(t>3.6)fade(ease((t-3.6)/.4));return 1}
 if(t<8){const u=t-4;c.save();camera(1+u*.018,240,170);background('heatran-cave.png');lava(t,.4);embers(t,.45);c.restore();if(u<.4)fade(1-ease(u/.4));return 2}
 if(t<13){const u=t-8;background('heatran-cave.png',1.18,0,16);fade(.2,'#17101a');lava(t,.7);embers(t,.65);const p=ease(u/4);line([[240,202],[232,192],[242,182],[237,173]],'#ffa254',2,p*.8);glow(240,179,31,'#ffad4d',p*.6);if(u>4.6)fade(ease((u-4.6)/.4));return 3}
 background('heatran-cave.png');const u=t-13,p=ease(u/3.7);fade(.52*(1-ease(u/7)),'#160d17');lava(t,.8);embers(t,.7);const y=184+p*18;creature(t,240,y,p*.85,cfg.dark);glow(240,y-45,64,cfg.color,p*.35);if(t>19.4)fade(ease((t-19.4)/.6),cfg.color);return 4;
}
function waters(t){
 if(t<4){c.save();camera(1+ease(t/4)*.23,250,153);background('water-mouth.png');ripples(t,240,235,'#9de2ed',.25);c.restore();if(t>3.6)fade(ease((t-3.6)/.4),'#12314b');return 1}
 if(t<8){const u=t-4;c.save();camera(1+u*.015,240,170);background('water-cave.png');caustics(t,.15);ripples(t,240,220,'#9ce9f8',.25);c.restore();if(u<.4)fade(1-ease(u/.4),'#12314b');return 2}
 if(t<12){const u=t-8;background('water-cave.png');caustics(t,.22);ripples(t,240,217,'#b7effc',.5);bubbles(t,ease(u/2)*.5);glow(240,213,23,'#9ae8ff',ease(u/3)*.7);return 3}
 const u=t-12;background('water-cave.png');caustics(t,.25);ripples(t,240,219,cfg.color,.7);const p=ease(u/3),y=220-p*12;creature(t,240,y,p*.65,cfg.dark);
 if(ID===489){bubbles(t,.8);const r=16+p*48,pts=[];for(let j=0;j<=80;j++){const a=j/80*Math.PI*2;pts.push([240+Math.cos(a)*r,152+Math.sin(a)*r])}line(pts,cfg.color,2,p*.7);glow(240,152,r,cfg.color,p*.3)}else{waterHeart(t,p*(.6+Math.sin(t*2)**2*.3));motes(t,cfg.color,p*.5)}
 if(t>19.4)fade(ease((t-19.4)/.6),cfg.color);return 4;
}
function shaymin(t){
 if(t<4){c.save();camera(1+ease(t/4)*.09,240,145);background('flower-island.png');petals(t,.4);c.restore();if(t>3.6)fade(ease((t-3.6)/.4),'#e9f4d6');return 1}
 if(t<8){const u=t-4;c.save();camera(1.08+u*.017,240,170);background('flower-clearing.png');petals(t,.6);c.restore();if(u<.4)fade(1-ease(u/.4),'#e9f4d6');return 2}
 if(t<13){const u=t-8;background('flower-clearing.png');petals(t,.5);const p=ease(u/3);flower(240,190,8,'#ffd6e1',.2+p*.8);glow(240,185,35,cfg.color,p*.5);for(let i=0;i<10;i++){const age=(t*.3+i*.1)%1;spark(220+hash(i,15)*40,191-age*60,1,'#f1ffd8',(1-age)*p*.8)}if(u>4.6)fade(ease((u-4.6)/.4),'#e9f4d6');return 3}
 const u=t-13;background('flower-clearing.png');petals(t,.8);bloom(u,.85);const p=ease(u/4);ellipse(240,222,68,8,'#4a843e',p*.25);creature(t,240,220,p*.75,cfg.dark);glow(240,190,72,cfg.color,p*.45);if(t>19.4)fade(ease((t-19.4)/.6),'#f2ffe5');return 4;
}
function reveal(t){const u=t-20,a=ease(u/.8);background(cfg.plate);let x=240,y=cfg.foot;
 if(ID===485){lava(t,.65);embers(t,.65);ellipse(x,y+2,73,8,'#211621',.6);glow(x,y-50,80,cfg.color,a*.25)}
 else if(aquatic){y-=Math.sin(u*1.4)*2.5;ripples(t,x,222,cfg.color,.6);caustics(t,.2);if(ID===489)bubbles(t,.6);else motes(t,cfg.color,.5);glow(x,y-48,65,cfg.color,a*.25)}
 else{petals(t,.9);bloom(u+7,1);ellipse(x,y+2,66,7,'#51803b',a*.25);glow(x,y-35,70,cfg.color,a*.18)}
 creature(t,x,y,a);if(u<.8)fade(1-ease(u/.8),ID===492?'#f2ffe5':cfg.color);if(u>7.4)fade(ease((u-7.4)/.6));return{alpha:a,x,y};}
function render(time){const t=clamp(time,0,27.9999);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,hero=null;if(t<20)shot=ID===485?heatran(t):aquatic?waters(t):shaymin(t);else{shot=5;hero=reveal(t)}if(t<.3)fade(1-ease(t/.3));out.imageSmoothingEnabled=false;out.clearRect(0,0,960,540);out.drawImage(stage,0,0,960,540);return{time:t,species:ID,shot,heroVisible:!!hero&&hero.alpha>.01,hero,location:t<4?(ID===485?'volcano.png':aquatic?'water-mouth.png':'flower-island.png'):cfg.plate,sharedWaterOpening:aquatic&&t<12,revealAt:20,cryAt:21.7}}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['volcano.png','heatran-cave.png','water-mouth.png','water-cave.png','flower-island.png','flower-clearing.png'].map(load));layouts=Object.fromEntries([485,489,490,492].map(id=>[id,layout(id)]));document.title=cfg.name+' — '+cfg.title;document.querySelector('#status').hidden=true;render(1)})();
window.natureFilm={ready,render,duration:D,id:ID,config:cfg,layout:()=>layouts[ID],cryAt:CRY,revealAt:REVEAL};await ready;
