const W=480,H=270,DURATION=30;
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

const REVEAL=24.2,CRY=24.9,CUTS=[0,4,6.5,9.5,12,16,19,22,24.2];
function fade(a,color='#000'){px(0,0,W,H,color,clamp(a))}
function line(points,color,a=1,width=1){c.save();c.globalAlpha=a;c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore()}
function sparkles(t,n=36,power=1){for(let i=0;i<n;i++){const x=hash(i,2)*480,y=(hash(i,3)*270-t*(6+hash(i,4)*9)+540)%270;px(x,y,i%9===0?2:1,1,'#ffe6a4',power*(.2+.6*Math.sin(t*2+i)**2))}}
function fieryV(t,p=1,scale=1,x=240,y=135){const pts=[[-44,-58],[0,27],[44,-58]].map(([a,b])=>[x+a*scale,y+b*scale]);const total=2*Math.hypot(44,85)*scale,reach=clamp(p)*total;let done=0;for(let side=0;side<2;side++){const a=pts[side],b=pts[side+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<len;d+=3){if(done+d>reach)break;const q=d/len,xx=mix(a[0],b[0],q),yy=mix(a[1],b[1],q);px(xx-6,yy-6,12,12,'#b44321',.55);px(xx-4,yy-4,8,8,'#ff8b32',.9);px(xx-2,yy-2,4,4,'#fff0a2',.95);if(Math.floor(d+t*20)%17<5)px(xx+Math.sin(d)*5,yy-10,2,5,'#ffc55c',.7)}done+=len}glow(x,y,45*scale,'#ffb451',.15*p)}
function confetti(t,p=1){for(let i=0;i<115;i++){const x=(hash(i,5)*520+Math.sin(t*1.5+i)*16+520)%520-20,y=(hash(i,6)*320+t*(12+hash(i,7)*14))%320-30,w=Math.max(1,Math.round(Math.abs(Math.cos(t*3+i))*3));px(x,y,w,2,['#e37a3a','#f7d469','#6cb0bf','#f2e6b8'][i%4],p*.85)}}
function stadium(t){background('494-festival.png',1.02,0,0);for(let i=0;i<24;i++){const side=i%2,x=side?462+(i%3)*6:6+(i%3)*7,y=106+Math.floor(i/6)*8;ellipse(x,y+Math.sin(t*3+i)*.4,2,3,['#6d5961','#986f56','#4b6873'][i%3],.7)}}
function castle(t,mode='calm'){const danger=mode==='danger',heal=mode==='heal',z=danger?1.14:1+clamp(t/4)*.06;c.save();camera(z,240,130,danger?.5:0,t);background('494-castle.png');c.restore();if(danger){fade(.38,'#111932');for(let i=0;i<2;i++){const phase=t*.65+i*Math.PI;for(let k=0;k<95;k++){const q=k/94,x=240+Math.sin(phase+q*8)*(20+q*82),y=220-q*180;px(x-2,y,4,4,i?'#d4f3f4':'#755d94',.3+q*.35)}}for(let i=0;i<22;i++){const x=220+hash(i,2)*40,y=240-((t*25+i*15)%100);px(x,y,2,3,'#f3ad64',.4)}}else{sparkles(t,18,.3);if(heal){const p=ease(t/3);for(let i=0;i<13;i++){const a=-Math.PI*.95+i*.09;line([[450,32],[450+Math.cos(a)*520,32+Math.sin(a)*-330]],'#fff1bc',p*.12,7)}fieryV(t,clamp(t/1.1),.65,240,104);fade((1-p)*.3,'#12152a')}}if(mode==='calm'&&t<.6)fade(1-t/.6)}
function battle(t){stadium(t);const q=t-4,boost=ease((t-6.5)/.7),strike=t>=7.8&&t<8.65,progress=clamp((t-7.8)/.5),dash=strike?Math.sin(progress*Math.PI)*174:0;ellipse(134+dash,225,22,4,'#705332',.3);ellipse(349,225,31,5,'#705332',.3);
 const opponent=t<5.5?'Attack':t>=8.25?'Hurt':'Idle';mon(76,opponent,6,349+ease((t-8.2)/.45)*12,223,2.4,t<5.5?q*.38:t>=8.25?(t-8.25)*.38:q*.45,{oneShot:opponent!=='Idle'});
 const hurt=t>5.05&&t<6.25;mon(25,hurt?'Hurt':strike?'Attack':'Idle',2,134+dash-(hurt?ease((t-5.05)/.2)*9:0),223-(strike?Math.sin(progress*Math.PI)*27:0),2.5,hurt?(t-5.05)*.4:strike?(t-7.8)*.6:q*.6,{oneShot:hurt||strike});
 if(t>=4.7&&t<5.3){const p=clamp((t-4.7)/.5),x=mix(325,139,p),y=mix(192,204,p)-Math.sin(p*Math.PI)*24;ellipse(x,y,8,6,'#5e5350');px(x-3,y-4,7,4,'#a79878');if(t>5.05)burst(140,206,t-5.05,'#d3bb88',.35)}
 if(boost>0){const until=1-ease((t-8)/.8);glow(134+dash,200,30,'#ffbc5d',boost*until*.7);for(let i=0;i<14;i++){const a=t*2+i*.45,r=12+hash(i,2)*20;px(134+Math.cos(a)*r,215-((t*27+i*5)%51),2,3,'#ffe8a5',boost*until)}if(t<7.4){const p=ease((t-6.5)/.9);for(let i=0;i<20;i++){const z=i/19;px(mix(55,134,z),218-Math.sin(z*Math.PI)*28,2,2,'#f9cf82',p*.8)}}}
 // The finishing hit is a physical Iron Tail sweep; Golem's Ground typing is preserved.
 if(t>=8.05&&t<8.75){const a=(t-8.05)/.7;line([[290,174],[320,188],[348,211],[363,230]],'#fff9d8',Math.sin(a*Math.PI),5);line([[283,178],[317,193],[344,218]],'#d4edfb',Math.sin(a*Math.PI)*.8,2);burst(348,201,t-8.23,'#fff1bd',.6)}
 if(t>=8.8){confetti(t-8.8,ease((t-8.8)/.5));glow(134,200,40,'#fff1a5',.28)}
}
function barrier(t){const q=t-12,breakP=ease((t-17.6)/1.25);c.save();camera(1.05,240,140,t>16&&t<18.7?.55:0,t);background('494-chamber.png');fade(.25,'#080c26');
 const points=[[140,122],[187,72],[291,72],[340,122],[240,218]],a=(.45+.15*Math.sin(t*3))*(1-breakP);
 for(let i=0;i<5;i++){const p=points[i],n=points[(i+1)%5];line([p,n],'#ffbd65',a,2);for(let j=0;j<6;j++){const x=mix(p[0],n[0],j/5),y=mix(p[1],n[1],j/5);line([[x,y],[240+(x-240)*.65,135+(y-135)*.65]],'#f49a4b',a*.27,1)}}
 glow(240,144,19+Math.sin(t*3)*2,'#ffdc86',.9);ellipse(240,144,5,5,'#fff2ba');
 for(let i=0;i<2;i++)for(let k=0;k<65;k++){const z=k/64,xx=240+Math.sin(t*1.8+z*8+i*Math.PI)*(82-z*60),yy=222-z*159;px(xx,yy,3,3,i?'#d7eef0':'#635982',(.3+z*.3)*(1-breakP))}
 if(t>=16)fieryV(t,ease((t-16)/1.8),.95,240,127);
 if(t>=17.6){for(let i=0;i<48;i++){const angle=hash(i,8)*Math.PI*2,r=30+breakP*(35+hash(i,9)*100),x=240+Math.cos(angle)*r,y=143+Math.sin(angle)*r*.7;px(x,y,3,2,'#ffd488',(1-breakP)*.85)}glow(240,144,40+breakP*80,'#fff2bb',Math.sin(breakP*Math.PI)*.5)}c.restore();sparkles(t,30,.3)}
function arrival(t){stadium(t);const age=t-22,p=ease(age/2),show=ease((t-REVEAL)/.65);confetti(age,ease(age/1.5));fieryV(t,clamp(age/1.3),mix(1.22,.62,ease((t-REVEAL)/.6)),240,mix(124,94,ease((t-REVEAL)/.6)));glow(240,168,29,'#fff1b9',(1-show)*.8);
 if(t<REVEAL){ellipse(240,175,6,7,'#fff5cc',p);for(let i=0;i<16;i++){const a=i*Math.PI/8+t*2,r=(1-p)*55+20;px(240+Math.cos(a)*r,173+Math.sin(a)*r*.6,2,2,'#ffe79b',p)}}
 else{const a=t-REVEAL,jump=a>1.4&&a<2.5?Math.sin((a-1.4)/1.1*Math.PI)*17:a>3.6&&a<4.5?Math.sin((a-3.6)/.9*Math.PI)*12:0,kind=a>1.4&&a<2.5?'Hop':a>.6&&a<1.3?'Charge':'Idle';ellipse(240,235,37-jump*.45,5,'#896334',show*.3);mon(494,kind,0,240,234-jump,5,kind==='Hop'?(a-1.4)*.35:kind==='Charge'?(a-.6)*.35:a*.65,{alpha:show,oneShot:kind!=='Idle'});if(a<.8)burst(240,176,a,'#fff1b8',.5)}sparkles(t,35,.45)}
function render(time){const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot;if(t<4){castle(t);shot=1}else if(t<9.5){battle(t);shot=t<6.5?2:3}else if(t<12){castle(t-9.5,'danger');shot=4}else if(t<19){barrier(t);shot=t<16?5:6}else if(t<22){castle(t-19,'heal');shot=7}else{arrival(t);shot=t<REVEAL?8:9}for(const cut of [4,9.5,12,19,22])if(t>=cut&&t<cut+.22)fade((1-ease((t-cut)/.22))*.8);if(t>29.4)fade(ease((t-29.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);return{time:t,shot,species:494,revealAt:REVEAL}}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>load(a.src))));await Promise.all(['494-castle.png','494-festival.png','494-chamber.png'].map(load));document.querySelector('#status').hidden=true;render(0)})();
window.victiniFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,species:494};await ready;
