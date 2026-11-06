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

const FILMS={
 144:{name:'Artikodin',title:'Le Souffle des Îles Écume',duration:30,cuts:[0,5,11,17,21],cryAt:22.3,revealAt:21.3,assets:['144-coast','144-tunnel','144-sanctuary'],color:'#c7f8ff'},
 145:{name:'Électhor',title:'Le Cœur de la centrale',duration:30,cuts:[0,6,12,18,22],cryAt:23.1,revealAt:22.18,assets:['145-exterior','145-generator','145-roof'],color:'#ffec8b'},
 146:{name:'Sulfura',title:'Les Ailes de l’aube',duration:32,cuts:[0,6,12,18,24],cryAt:25.1,revealAt:24.2,assets:['146-mountain','146-lava','146-crater'],color:'#ffcb73'}
};
const SPECIES=Number(new URL(location.href).searchParams.get('id')||144),F=FILMS[SPECIES]||FILMS[144];
function birdSprite(id,x,y,scale,time,alpha){
 const f=frameInfo(id,'Walk',0,time),anchor=frameInfo(id,'Walk',0,0);
 // Keep one body anchor across all wing poses. A wing tip is never an anchor.
 c.save();c.globalAlpha=alpha;c.drawImage(f.canvas,Math.round(x-anchor.cx*scale),Math.round(y-anchor.bottom*scale),f.mode.w*scale,f.mode.h*scale);c.restore();
}
function fade(a,color='#000000'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=clamp(alpha);c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function line(points,color,width=1,alpha=1){c.save();c.globalAlpha=clamp(alpha);c.strokeStyle=color;c.lineWidth=width;c.lineJoin='miter';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.stroke();c.restore()}
function spark(x,y,r,color,a=1){px(x-r,y,2*r+1,1,color,a);px(x,y-r,1,2*r+1,color,a);px(x,y,1,1,'#ffffff',a)}
function feather(x,y,scale,t){
 c.save();c.translate(x,y);c.rotate(Math.sin(t*1.7)*.34-.4);c.scale(scale,scale);
 polygon([[-2,13],[-5,4],[-5,-3],[-2,-9],[2,-13],[5,-8],[6,-1],[4,6],[0,13]],'#174d9e');
 polygon([[-2,10],[-3,1],[-1,-7],[2,-11],[4,-6],[4,1],[1,8]],'#5cceef');
 line([[0,14],[1,-9]],'#d7ffff',1,.9);for(let i=0;i<5;i++)line([[1,7-i*4],[-3,4-i*3]],'#b3f7ff',1,.7);c.restore();
}
function snow(t,power=.3,swirl=false){
 const n=Math.round(30+power*110);
 for(let i=0;i<n;i++){
  const phase=hash(i,7)*6.28,xx=swirl?240+Math.cos(phase+t*(1+power))*((i%25)*10+12):((hash(i,8)*600+t*(14+power*80))%600)-60;
  const yy=(hash(i,9)*320+t*(8+power*16))%320-30;
  if(i%8===0)spark(xx,yy,1+Math.floor(power),i%2?'#b4e9ff':'#efffff',.3+power*.45);else px(xx,yy,i%3?1:2,1,'#e1fbff',.22+power*.5);
 }
}
function coldMist(t,amount=.3){for(let i=0;i<7;i++)cloud(-80+i*95+Math.sin(t*.3+i)*12,210+Math.sin(t*.4+i)*9,150,19,'#b1e6f9',i,amount*.16)}
function frost(t,power){
 c.save();c.beginPath();c.rect(0,215,W,55);c.clip();
 for(let k=0;k<11;k++){
  const p=clamp(power*1.5-k*.055),x=mix(240,k%2?15+k*38:470-k*37,p),y=228+k%4*9;
  line([[240,237],[mix(240,x,.4),y-3],[x,y]],'#baf7ff',1,p*.8);
  if(p>.2){line([[x,y],[x-12,y-7],[x-19,y-5]],'#a4ddec',1,p*.6);line([[x-8,y-1],[x-5,y+7]],'#c9f7ff',1,p*.6)}
 }
 c.restore();
}
function iceShards(t,amount=1){
 for(let i=0;i<32;i++){
  const age=(t*.35+hash(i,3))%1,a=i*2.399+t*.35,r=10+age*(45+hash(i,4)*125),x=240+Math.cos(a)*r,y=160+Math.sin(a)*r*.6-age*20,s=(2+hash(i,5)*3)*(1-age*.5);
  polygon([[x,y-s*2],[x+s,y],[x,y+s],[x-s,y]],i%2?'#a2e9ff':'#ecffff',amount*(1-age)*.75);
 }
}
function iceCoast(t){
 c.save();camera(1+ease(t/5)*.09,333,178);background('144-coast.png');
 for(let i=0;i<22;i++){const xx=(hash(i,2)*520+t*6)%520-20,yy=205+hash(i,4)*55;px(xx,yy,3+i%4,1,'#8bd6ec',.2)}
 feather(mix(89,354,ease(t/5)),155+Math.sin(t*1.4)*15,1.05,t);snow(t,.12);coldMist(t,.22);c.restore();
}
function iceTunnel(t){
 c.save();camera(1+ease(t/6)*.35,245,129);background('144-tunnel.png');
 feather(243+Math.sin(t*1.3)*12,mix(183,143,ease(t/6)),mix(.83,.42,t/6),t+5);snow(t+5,.17);coldMist(t,.25);
 for(let i=0;i<8;i++)spark(47+hash(i,8)*382,70+hash(i,9)*153,1,'#c7ffff',.12+.22*Math.sin(t*2+i)**6);
 c.restore();
}
function iceStill(t){
 c.save();camera(1+ease(t/6)*.075,240,190);background('144-sanctuary.png');
 frost(t,ease(t/6));feather(240,157+Math.sin(t*.6)*7,.7,t+11);glow(240,195,32,'#a8eeff',ease(t/6)*.4);snow(t+11,.14+ease(t/6)*.15);coldMist(t,.4);c.restore();
}
function iceAwakening(t){
 c.save();camera(1.17,240,173,t>2?Math.sin(clamp((t-2)/2)*Math.PI)*.4:0,t);background('144-sanctuary.png');frost(t,1);
 const g=ease(t/3.5);glow(240,174,30+g*60,'#b7f1ff',g*.6);
 for(let i=0;i<8;i++){const a=i*Math.PI/4,xx=240+Math.cos(a)*40,yy=215+Math.sin(a)*8,hh=(16+hash(i,4)*33)*g;polygon([[xx-5,yy],[xx-1,yy-hh],[xx+3,yy-hh+8],[xx+6,yy]],i%2?'#94dbfc':'#d1fbff',g*.55)}
 iceShards(t,g);snow(t+17,.2+g*.8,true);coldMist(t,.7+g*.6);c.restore();
 if(t>3.3)fade(ease((t-3.3)/.7)*.85,'#d1f7ff');
}
function iceReveal(t){
 background('144-sanctuary.png');frost(t,1);const a=ease((t-.3)/.6),rise=ease(t/2.2),y=mix(220,177,rise)+Math.sin(t*1.9)*2;
 glow(240,147,66,'#9addff',.25);ellipse(240,224,42,5,'#2a75a4',.15);
 birdSprite(144,240,y,3.45,t*.6,a);
 iceShards(t+4,Math.max(.15,1-t/3));coldMist(t,.5);snow(t+21,.65*(1-ease(t/3))+.13,true);
 if(t<1.1)fade((1-ease(t/1.1))*.85,'#d1f7ff');
 return {x:240,y,alpha:a};
}
function bolt(x0,y0,x1,y1,t,power=1,seed=1){
 const pts=[];for(let i=0;i<=12;i++){const p=i/12,dx=i===0||i===12?0:(hash(i,seed+Math.floor(t*12))-.5)*17*power;pts.push([mix(x0,x1,p)+dx,mix(y0,y1,p)])}
 line(pts,'#8a75df',6*power,.16);line(pts,'#f7c854',3*power,.8);line(pts,'#fffbd1',Math.max(1,power),1);
}
function electricRing(x,y,r,t,a=1){
 const pts=[];for(let i=0;i<=32;i++){const angle=i*Math.PI/16,rr=r+(hash(i,Math.floor(t*16))-.5)*5;pts.push([x+Math.cos(angle)*rr,y+Math.sin(angle)*rr])}
 line(pts,'#ffdb63',2,a*.7);line(pts,'#fff4b7',1,a*.8);
}
function roofRain(t,amount=.4){rain(t,amount);for(let i=0;i<12;i++){const p=(t*.9+i*.13)%1;line([[35+i*37-p*3,248+i%3*7],[38+i*37,246+i%3*7],[40+i*37+p*3,248+i%3*7]],'#9eb8e4',1,(1-p)*.25)}}
function powerExterior(t){
 c.save();camera(1+ease(t/6)*.07,310,128);background('145-exterior.png');rain(t,.25);
 if(t>2.3){const p=ease((t-2.3)/2);for(let i=0;i<4;i++)px(222+i*31,147,13,26,'#d8ce86',p*.1)}
 if(t>3.5&&t<3.75){bolt(303,-3,324,96,t,1.1,5);fade(.18,'#d2ccff')}
 c.restore();
}
function liveGenerator(t,close=false){
 const power=clamp(t/6);c.save();camera(close?1.65:1+power*.08,240,124,close?Math.max(0,power-.3)*.15:0,t);background('145-generator.png');
 const g=close?.55+power*.45:power;
 // The switch-on starts on the real lower-left control panel.
 px(24,208,27,15,'#153b4e',g*.8);
 for(let i=0;i<5;i++)px(27,211+i*2,9+(i*3+Math.floor(t*5))%12,1,'#aaf2b7',g*.8);
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=240+Math.cos(a)*51,y=124+Math.sin(a)*51;spark(x,y,2,'#ffe8a0',g*.7);if(g>i/10)px(158+i*24,176,3,3,'#ffe09b',g*.65)}
 glow(240,124,36,'#ffe67f',g*.32);
 if(g>.15){electricRing(240,124,15+g*23,t,g);for(let i=0;i<3;i++){const a=t*(close?1.6:1)+i*2.094;bolt(240+Math.cos(a)*50,124+Math.sin(a)*50,240,124,t,g*.55,i+13)}}
 if(close&&t>4.9){bolt(240,124,240,-20,t,1.4,8);glow(240,100,90,'#fff2b0',ease((t-4.9)/1.1)*.5)}
 c.restore();
 if(close&&t>5.65)fade(ease((t-5.65)/.35)*.7,'#ffefb2');
}
function powerConverges(t){
 background('145-roof.png');roofRain(t+18,.3);
 const p=ease(t/4);glow(240,222,30+p*60,'#ffe589',p*.25);
 if(t>1){for(let i=0;i<3;i++){const age=t-1-i*.48;if(age>0&&age<.6)bolt(90+i*154,-5,240,208,t,1+i*.12,21+i)}}
 if(t>2.2){electricRing(240,170,18+(t-2.2)*17,t,.4);bolt(240,213,240,122,t,.6,43)}
 if(t>3.72)fade(ease((t-3.72)/.28),'#fff2bf');
}
function powerReveal(t){
 background('145-roof.png');roofRain(t+22,.3);const a=ease((t-.18)/.5),rise=ease(t/1.8),y=mix(231,198,rise)+Math.sin(t*3)*1.4;
 glow(240,145,68,'#ffe16f',.3);electricRing(240,145,53+Math.sin(t*2)*4,t,.35);
 if(t<1.3){bolt(240,-10,240,209,t,1.5,51);for(let i=0;i<3;i++)bolt(240,145,136+i*107,222,t,.6,i+66)}
 birdSprite(145,240,y,3.85,t*.65,a);
 if(t<.75)fade(1-ease(t/.75),'#fff2bf');
 for(let i=0;i<7;i++)spark(240+Math.cos(i*2.399+t)*86,144+Math.sin(i*2.399+t)*58,1,'#ffed9d',.2);
 return {x:240,y,alpha:a};
}
function embers(t,power=.3,center=240){
 const count=Math.round(20+power*85);for(let i=0;i<count;i++){const age=(hash(i,31)+t*(.13+hash(i,32)*.12))%1,x=center+(hash(i,33)-.5)*(90+power*400)+Math.sin(age*7+i)*8,y=274-age*(170+hash(i,34)*140);px(x,y,i%5?1:2,i%5?2:3,i%3?'#ff9a42':'#ffe4a3',(1-age)*(.3+power*.6))}
}
function flameColumn(t,power=1){
 const height=165*power,base=258;
 for(let layer=0;layer<3;layer++){
  const width=(40-layer*12)*power,points=[];
  for(let k=0;k<=40;k++){const p=k/40,y=base-p*height,x=240+Math.sin(p*9-t*4)*(9+power*9)*p,w=width*Math.pow(1-p,.5);points.push([x-w,y])}
  for(let k=40;k>=0;k--){const p=k/40,y=base-p*height,x=240+Math.sin(p*9-t*4)*(9+power*9)*p,w=width*Math.pow(1-p,.5);points.push([x+w,y])}
  polygon(points,['#c44332','#fa7c2e','#ffdc73'][layer],.7);
 }
 for(let i=0;i<12;i++){const p=((i/12+t*.34)%1),angle=p*16-t*3,r=(28+Math.sin(p*7)*5)*power,x=240+Math.cos(angle)*r,y=258-p*height;px(x,y,4,7,'#ffe59b',power*.6)}
}
function heat(t,source){
 // Distort only a subtle transparent copy, using discrete scanlines and no blur.
 const image=images.get(source),iw=image.width,ih=image.height;
 c.save();c.globalAlpha=.13;for(let y=70;y<250;y+=3){const dx=Math.round(Math.sin(y*.09-t*3)*1.5);c.drawImage(image,0,y/H*ih,iw,3/H*ih,dx,y,W,3)}c.restore();
}
function mountain(t){
 c.save();camera(1+ease(t/6)*.09,249,83);background('146-mountain.png');
 const p=ease(t/6),x=mix(67,251,p),y=mix(230,80,p)+Math.sin(t*1.8)*7;
 glow(x,y,8,'#ffad4d',.4);px(x-1,y-1,3,3,'#ffd28b');for(let i=0;i<6;i++)px(x-i*2,y+i*2,1,1,'#f58d44',.35*(1-i/6));
 for(let i=0;i<3;i++)cloud(246+i*7+Math.sin(t*.2+i)*5,56-i*13,22+i*7,14,'#6f526b',i,.13);
 embers(t,.1);c.restore();
}
function lavaDescent(t){
 c.save();camera(1+ease(t/6)*.27,248,136);background('146-lava.png');heat(t,'146-lava.png');embers(t+6,.32);
 for(let i=0;i<17;i++){const p=(hash(i,9)+t*.17)%1,x=mix(245,180+hash(i,8)*150,p),y=mix(132,270,p);px(x,y,2,1,'#fff09c',.2)}
 c.restore();
}
function magmaPressure(t){
 c.save();camera(1.58,240,140,(t/6)*.35,t);background('146-lava.png');heat(t+6,'146-lava.png');embers(t+12,.5);
 glow(246,139,28+t*6,'#ffba5d',.25+t*.05);
 for(let i=0;i<6;i++){const age=(t*.5+i*.19)%1,xx=230+hash(i,7)*40,yy=165+hash(i,8)*70;ellipse(xx,yy,2+age*4,1+age*2,'#fff4a2',(1-age)*.45)}
 if(t>4)flameColumn(t,ease((t-4)/2)*.7);c.restore();if(t>5.7)fade(ease((t-5.7)/.3)*.7,'#fbb16a');
}
function eruption(t){
 c.save();camera(1,240,180,Math.sin(clamp(t/6)*Math.PI)*.9,t);background('146-crater.png');
 const p=ease(t/5);glow(240,246,45+p*80,'#ffad60',.2+p*.5);flameColumn(t,.15+p*.95);embers(t+18,.3+p*.7);
 for(let i=0;i<9;i++){const a=i*2.399,age=(t*.31+i*.13)%1,r=age*92;polygon([[240+Math.cos(a)*r,236-age*116],[244+Math.cos(a)*r,234-age*116],[246+Math.cos(a)*r,240-age*116]],'#7e4450',(1-age)*.5)}
 c.restore();if(t>5.5)fade(ease((t-5.5)/.5)*.88,'#ffe2a6');
}
function fireReveal(t){
 background('146-crater.png');const a=ease((t-.2)/.65),rise=ease(t/2.4),y=mix(263,177,rise)+Math.sin(t*2.2)*2;
 glow(240,154,81,'#ffb95e',.25);if(t<2.5)flameColumn(t+6,(1-ease(t/2.5))*.95);
 birdSprite(146,240,y,3.1,t*.62,a);embers(t+24,.45);
 if(t<1)fade((1-ease(t))*.88,'#ffe2a6');
 return {x:240,y,alpha:a};
}
function render(time){
 const t=clamp(time,0,F.duration-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,bird=null;
 if(SPECIES===144){if(t<5){shot=1;iceCoast(t)}else if(t<11){shot=2;iceTunnel(t-5)}else if(t<17){shot=3;iceStill(t-11)}else if(t<21){shot=4;iceAwakening(t-17)}else{shot=5;bird=iceReveal(t-21)}}
 else if(SPECIES===145){if(t<6){shot=1;powerExterior(t)}else if(t<12){shot=2;liveGenerator(t-6)}else if(t<18){shot=3;liveGenerator(t-12,true)}else if(t<22){shot=4;powerConverges(t-18)}else{shot=5;bird=powerReveal(t-22)}}
 else{if(t<6){shot=1;mountain(t)}else if(t<12){shot=2;lavaDescent(t-6)}else if(t<18){shot=3;magmaPressure(t-12)}else if(t<24){shot=4;eruption(t-18)}else{shot=5;bird=fireReveal(t-24)}}
 if(t<.45)fade(1-ease(t/.45));if(t>F.duration-.6)fade(ease((t-F.duration+.6)/.6));
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,species:SPECIES,shot,bird,birdVisible:!!bird&&bird.alpha>.01,revealAt:F.revealAt,cryAt:F.cryAt};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(F.assets.map(x=>load(x+'.png')));document.querySelector('#status').hidden=true;document.title=F.name+' — '+F.title;const video=document.querySelector('video');video.src=SPECIES+'-appearance-v1.mp4';document.querySelector('#play').textContent='Voir '+F.name+' · '+F.duration+' s';render(1.2)})();
window.birdsFilm={ready,duration:F.duration,render,config:F,species:SPECIES,spriteFrame:(t)=>{const f=frameInfo(SPECIES,'Walk',0,(t-F.cuts.at(-1))*(SPECIES===144?.6:SPECIES===145?.65:.62)),anchor=frameInfo(SPECIES,'Walk',0,0);return {...f,anchorCx:anchor.cx,anchorBottom:anchor.bottom}}};await ready;
