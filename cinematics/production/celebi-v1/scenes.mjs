const FILM_DURATION=30,CUTS=[0,4,8,10.5,13,16,21],REVEAL=21.2,CRY=22.6;
let heroLayout;
function makeLayout(){
 const mode=sprites[251].Idle,frames=Array.from({length:mode.frames},(_,i)=>frameInfo(251,'Idle',0,mode.durations.slice(0,i).reduce((a,b)=>a+b,0)+.001));const anchor={x:frames[0].cx,y:frames[0].bottom};let l=999,r=-999,top=999,b=-999;
 for(const f of frames){const a=f.canvas.getContext('2d').getImageData(0,0,mode.w,mode.h).data;for(let y=0;y<mode.h;y++)for(let x=0;x<mode.w;x++)if(a[(y*mode.w+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x+1);top=Math.min(top,y);b=Math.max(b,y+1)}}
 const scale=Math.min(114/(r-l),112/(b-top));return{anchor,scale,bounds:{left:240+(l-anchor.x)*scale,right:240+(r-anchor.x)*scale,top:185+(top-anchor.y)*scale,bottom:185+(b-anchor.y)*scale}};
}
function celebi(t,x,y,scale,alpha=1,tint=null){
 const f=frameInfo(251,'Idle',0,t*.8);c.save();c.globalAlpha=alpha;
 if(tint){const mask=document.createElement('canvas');mask.width=f.mode.w;mask.height=f.mode.h;const m=mask.getContext('2d');m.drawImage(f.canvas,0,0);m.globalCompositeOperation='source-in';m.fillStyle=tint;m.fillRect(0,0,mask.width,mask.height);c.drawImage(mask,Math.round(x-heroLayout.anchor.x*scale),Math.round(y-heroLayout.anchor.y*scale),f.mode.w*scale,f.mode.h*scale)}
 else c.drawImage(f.canvas,Math.round(x-heroLayout.anchor.x*scale),Math.round(y-heroLayout.anchor.y*scale),f.mode.w*scale,f.mode.h*scale);c.restore();
}
function leaf(x,y,s,a,color,alpha=1){c.save();c.translate(Math.round(x),Math.round(y));c.rotate(a);polygon([[0,-s*2],[s,-s],[s,0],[0,s*2],[-s,s],[-s,0]],color,alpha);line([[0,-s],[0,s]],'#d4ec9b',1,alpha*.45);c.restore()}
function pollen(t,amount=.4){for(let i=0;i<32;i++){const a=(hash(i,17)+t*.065)%1,x=30+hash(i,18)*420+Math.sin(t*.5+i)*5,y=258-a*245;spark(x,y,1,'#ddffb1',Math.sin(a*Math.PI)*amount*.65)}}
function forestLeaves(t,reverse=false,amount=.5){for(let i=0;i<22;i++){const age=(hash(i,22)+t*.15)%1,x=hash(i,24)*480+Math.sin(age*5+i)*13,y=reverse?250-age*240:age*300-20;leaf(x,y,1+i%2,t*.8+i,reverse?'#edbb6b':'#9abd63',Math.sin(age*Math.PI)*amount)}}
function ball(t,power=0){
 const shake=power>0?Math.sin(t*27)*Math.sin(t*2.8)**6*1.3:0;c.save();c.translate(240+shake,157);ellipse(0,9,10,2,'#0c1828',.4);ellipse(0,0,10,10,'#13202a');
 for(let y=-8;y<=8;y+=2){const w=Math.sqrt(81-y*y);px(-w,y,w*2,2,y<-4?'#f9dc7b':y<0?'#c5a344':y<5?'#d4dfdd':'#7f99a2')}
 px(-8,0,17,2,'#24323c');px(-2,-2,5,5,'#24323c');px(-1,-1,3,3,power>.3?'#d5ffae':'#edf3e3');px(-6,-6,4,2,'#fff0b3');
 // Tiny GS markings on the golden shell, built as pixel strokes.
 for(const [x,y] of [[-6,-4],[-5,-5],[-4,-5],[-6,-3],[-5,-2],[-4,-3],[3,-5],[4,-5],[2,-4],[3,-3],[4,-2],[2,-2]])px(x,y,1,1,'#79662c');
 glow(0,0,13+power*9,'#b1ff83',power*.5);c.restore();
}
function shrineScene(t,close=false){
 const p=close?ease(t/4):ease(t/4),power=close?ease((t-.7)/1.8):0;c.save();camera(close?1.6+p*.14:1+p*.045,240,close?158:170);background('shrine.png');ball(t+4,power);pollen(t+4,power*.5+.18);forestLeaves(t,close,.16);
 if(power>0){glow(240,145,39,'#b3ff88',power*.5);for(let k=0;k<4;k++){const age=(t*.65+k*.25)%1,rx=6+age*27;const pts=[];for(let i=0;i<=50;i++){const a=i/50*Math.PI*2;pts.push([240+Math.cos(a)*rx,157+Math.sin(a)*rx*.5-age*22])}line(pts,'#b6fcaa',1,power*(1-age)*.42)}}
 c.restore();if(close&&t>3.55)fade(ease((t-3.55)/.45),'#e6ffd6');
}
function snow(t,a=1){for(let i=0;i<65;i++){const x=(hash(i,51)*480+Math.sin(t*.7+i)*3),y=(hash(i,52)*270-t*17+540)%270;px(x,y,1+i%2,1+i%2,'#f2ffff',a*.65)}}
function timePortal(t,power=1,close=false){
 const x=240,y=96,rx=30,ry=39;if(power<=0)return;
 ellipse(x,y,rx+4,ry+5,'#4a986a',power*.6);ellipse(x,y,rx,ry,'#0c2d35',power*.95);glow(x,y,36,'#b6ff99',power*.6);
 for(let ring=0;ring<5;ring++){
  const age=(t*.28+ring*.2)%1,r=1-age*.83,pts=[];
  for(let i=0;i<=70;i++){const a=i/70*Math.PI*2+t*.25;pts.push([x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r])}line(pts,ring%2?'#d7ffae':'#75dca1',1.5,power*(1-age)*.65);
 }
 for(let i=0;i<13;i++){const a=i*2.399+t*.8,r=24+Math.sin(t+i)*5;leaf(x+Math.cos(a)*r,y+Math.sin(a)*r*1.2,1.2,a,'#a6e897',power*.8)}
}
function seasonScene(t,season){
 const names={winter:['winter.png',null],autumn:['autumn.png','winter.png'],spring:['spring.png','autumn.png']},p=names[season];background(p[0]);if(p[1]&&t<.6)imageOverlay(p[1],1-ease(t/.6));
 if(season==='winter'){snow(t,.75);if(t<.5)fade(1-ease(t/.5),'#e6ffd6')}
 else if(season==='autumn'){forestLeaves(t+5,true,.75);snow(t+2.5,1-ease(t/.7))}
 else{forestLeaves(t+8,true,.3);pollen(t+8,.55);timePortal(t,ease((t-.5)/1.3));glow(240,143,64,'#b2f896',ease(t/2)*.2)}
}
function tunnel(t){
 const enter=ease(t/1.25);c.save();camera(1+enter*.85,240,96);background('spring.png');timePortal(t+3,1);c.restore();fade(enter*.98,'#0a1d2b');
 for(let i=0;i<15;i++){
  const age=(t*.38+i/15)%1,r=10+Math.pow(age,1.65)*370,pts=[];
  for(let j=0;j<=85;j++){const a=j/85*Math.PI*2+t*.18;pts.push([240+Math.cos(a)*r,132+Math.sin(a)*r*.66])}
  line(pts,i%3?'#428a72':'#c5fbb0',i%3?1:2,enter*Math.sin(age*Math.PI)*.55);
 }
 for(let i=0;i<33;i++){const age=(hash(i,44)+t*.34)%1,a=i*2.399+t*.15,r=18+age*340;leaf(240+Math.cos(a)*r,132+Math.sin(a)*r*.65,1+age*3,a,'#b7f3a0',Math.sin(age*Math.PI)*enter*.75)}
 const shadow=ease((t-2.4)/.6),x=240+Math.sin(t*2)*11,y=141-Math.sin(t*1.5)*7;glow(x,y,13+shadow*18,'#c6ffac',shadow*.8);
 if(shadow>0)celebi(t,x,y,1.35+ease((t-3.4)/1.2)*.4,shadow*.8,'#102e2e');
 if(t>4.5)fade(ease((t-4.5)/.5),'#eaffd7');return{shadowVisible:shadow>.01};
}
function bloom(t){for(let i=0;i<16;i++){const p=ease((t-.5-hash(i,7)*2)/1.2),x=120+hash(i,5)*240,y=210+hash(i,6)*40;if(!p)continue;line([[x,y],[x,y-7*p]],'#79a749',1,p);const col=i%3?'#f6e7e7':'#ebc3ed';for(let k=0;k<5;k++){const a=k*Math.PI*.4;px(x+Math.cos(a)*2*p,y-7*p+Math.sin(a)*2*p,2,2,col,p)}px(x,y-7*p,2,2,'#fce898',p)}}
function revelation(t){
 background('spring.png');const alpha=ease((t-.2)/.8),x=240+Math.sin(t*1.1)*7,y=185+Math.sin(t*1.8)*3;const gate=1-ease((t-.4)/1.4);timePortal(t+8,gate);ellipse(x,215,25,4,'#254a46',alpha*.16);glow(x,y-48,71,'#d3ffb0',alpha*.3);celebi(t,x,y,heroLayout.scale,alpha);pollen(t+15,.7);forestLeaves(t+14,false,.32);bloom(t);
 if(t<.7)fade(1-ease(t/.7),'#eaffd7');return{alpha,x,y};
}
function render(time){
 const t=clamp(time,0,29.9999);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,season=null,reveal=null,travel=null;
 if(t<4){shot=1;shrineScene(t)}else if(t<8){shot=2;shrineScene(t-4,true)}else if(t<10.5){shot=3;season='winter';seasonScene(t-8,season)}else if(t<13){shot=4;season='autumn';seasonScene(t-10.5,season)}else if(t<16){shot=5;season='spring';seasonScene(t-13,season)}else if(t<21){shot=6;travel=tunnel(t-16)}else{shot=7;reveal=revelation(t-21)}
 if(t<.4)fade(1-ease(t/.4));if(t>29.4)fade(ease((t-29.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:251,shot,season,gsBallVisible:t<8,portalVisible:t>=13.5&&t<23,shadowVisible:!!travel?.shadowVisible,celebiVisible:!!reveal&&reveal.alpha>.01,reveal,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['shrine.png','winter.png','autumn.png','spring.png'].map(load));heroLayout=makeLayout();document.querySelector('#status').hidden=true;render(1.2)})();
window.celebiFilm={ready,render,duration:FILM_DURATION,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,layout:()=>heroLayout};await ready;
