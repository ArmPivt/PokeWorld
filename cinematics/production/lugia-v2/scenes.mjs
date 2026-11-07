const FILM_DURATION=30,CUTS=[0,2.5,7.5,8,13,17,21],CRY=22.4,STORM_AT=3.6,REVEAL=18.25;
let dancers,birdLayout;
const WOMEN=[{row:0,x:168,y:230,h:32},{row:1,x:240,y:215,h:31},{row:2,x:312,y:230,h:32},{row:3,x:136,y:258,h:35},{row:4,x:344,y:258,h:35}],BELLS=[9.15,11.75,14.2,21.2,25.6];
function lugia(kind,dir,x,y,scale,time,alpha=1,oneShot=false){
 const f=frameInfo(249,kind,dir,time,oneShot),anchor=frameInfo(249,kind,dir,0);
 c.save();c.globalAlpha=alpha;c.drawImage(f.canvas,Math.round(x-anchor.cx*scale),Math.round(y-anchor.bottom*scale),f.mode.w*scale,f.mode.h*scale);c.restore();return f.index;
}
function calmFire(t){
 c.save();camera(1+ease(t/2.5)*.025,240,150);background('calm.png');flames(t,.8+ease(t/2.5)*.3);towerSmoke(t,.7);c.restore();
}
function energyRing(x,y,r,t,a=1){
 const pts=[];for(let i=0;i<=40;i++){const angle=i*Math.PI/20;pts.push([x+Math.cos(angle)*r,y+Math.sin(angle)*r*.7])}line(pts,'#c8f8ff',1,a);glow(x,y,r*.7,'#81ccff',a*.2);
}
function stormSummon(t){
 const storm=ease((t-1.1)/1.8),age=t-2.1;
 // One lightning pulse at 4.6 s, synchronized with the existing thunder.
 const flash=age>=0&&age<.32?Math.min(1,age/.035)*(1-ease((age-.035)/.285)):0;
 c.save();camera(1.025,240,150);background('calm.png');
 // Build weather from the calm plate: no permanently painted lightning bolts.
 fade(storm*.36,'#101329');
 for(let side=0;side<2;side++)for(let row=0;row<4;row++){
  const x=(side?314:-58)+Math.sin(t*.3+row)*8,y=-20+row*27;
  cloud(x,y,228,42,'#22233f',row+side*7,storm*(.55+row*.08));
  cloud(x+13,y+6,191,26,'#515275',row+4,storm*.17);
 }
 const fire=1-ease((t-2)/2.5);flames(t+2.5,fire*1.1);towerSmoke(t+2.5,.3+fire*.4);
 if(storm>0){rain(t+2.5,storm*.35);puddles(t,storm*.3)}
 if(flash>0){
  fade(flash*.28,'#d9eaff');
  cloud(312,-10,184,119,'#becbe6',5,flash*.85);
  cloud(5,-16,165,105,'#8d9fc4',4,flash*.6);
  line([[35,0],[44,17],[38,23],[53,40],[47,47],[63,69]],'#e4f4ff',2,flash);
  line([[52,40],[36,49],[29,61]],'#c7dfff',1,flash*.75);
  // Source-in tint removes every coloured pixel, including the eyes and belly.
  mon(249,'Walk',0,385+age*12,80-age*5,1.22,t*.22,{tint:'#080b18',alpha:flash*.97});
  cloud(333,67,133,20,'#7385a4',2,flash*.33);
 }
 c.restore();if(t>4.7)fade(ease((t-4.7)/.3));
 return{storm,lugiaVisible:false,silhouetteVisible:flash>.01,flash,fire};
}

function dance(t){
 const sequence=[0,1,2,1,3,0,2,1],poses=[];
 for(let i=0;i<WOMEN.length;i++){
  const w=WOMEN[i],phase=(t/.65+(i%2)*.3)%sequence.length,k=Math.floor(phase),f=phase-k,a=ease((f-.84)/.16),pose=sequence[k],next=sequence[(k+1)%sequence.length],x=w.x+Math.sin(t*.7+i*.4)*1.8;
  ellipse(x,w.y+1,6.5,1.5,'#0d2638',.3);dancer(w.row,x,w.y,w.h,pose,1-a,i>2);if(a>0)dancer(w.row,x,w.y,w.h,next,a,i>2);poses.push(pose);
 }
 return poses;
}
function bellLight(absolute){
 for(const at of BELLS){const age=absolute-at;if(age<0||age>1.8)continue;energyRing(240,229,5+age*34,age,(1-age/1.8)*.65);glow(240,229,19,'#e2fbff',(1-age/1.8)*.45)}
}
function silverFeathers(t,power=.5,cx=240,cy=151){
 for(let i=0;i<22;i++){
  const age=(hash(i,15)+t*.12)%1,a=i*2.399+t*.32,rr=28+age*153,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.46-age*13,s=.7+hash(i,16)*.7;
  c.save();c.translate(Math.round(x),Math.round(y));c.rotate(a*.4);polygon([[-2*s,5*s],[-3*s,0],[0,-5*s],[2*s,-6*s],[3*s,-1*s],[1*s,4*s]],'#e2f7ff',power*Math.sin(age*Math.PI));line([[0,5*s],[1*s,-4*s]],'#7dc2de',1,power*.6);c.restore();
 }
}
function poolWaves(t,power=1,close=false){
 const cx=240,cy=close?229:164,rx=close?178:129,ry=close?33:23;
 for(let ring=0;ring<4;ring++){
  const pts=[];for(let i=0;i<=90;i++){const a=i/90*Math.PI*2+t*(.25+ring*.08),r=.25+ring*.2;pts.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r])}
  line(pts,ring%2?'#8ee8f5':'#388cb6',1,(.12+power*.17));
 }
 for(let i=0;i<24;i++){
  const age=(t*.17+i*.073)%1,a=i*2.399+t*(.8+power*.5),r=.15+age*.8,x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  px(x,y,2+i%3,1,'#d0fbff',power*(1-age)*.5);
 }
}
function mist(t,amount=.3){for(let i=0;i<5;i++)cloud(37+i*91+Math.sin(t*.4+i)*7,183+Math.sin(t*.6+i)*4,113,13,'#c1eefa',i,amount*.12)}
function waterCurtain(t,power=1,gap=0){
 for(let x=132;x<348;x+=3){
  if(Math.abs(x-240)<gap/2)continue;
  const phase=hash(x,9),edge=1-Math.abs(x-240)/116,top=23+24*Math.pow(Math.abs(x-240)/108,1.6),bottom=185+Math.sin(x*.13+t*2)*2;
  const base=edge>.55?'#59cbe1':edge>.2?'#2cafd0':'#228bb7';
  px(x,top,3,bottom-top,base,power*.95);px(x,top,3,5,'#c9f9ff',power*.75);
  for(let i=0;i<7;i++){
   const y=top+((phase*170+t*94+i*25)%(bottom-top)),hh=Math.min(bottom-y,10+hash(x,i)*24),dx=Math.sin(t*2+i+x*.1)*.6;
   px(x+dx,y,2,hh,i%3?'#99eff7':'#ecffff',power*(.55+edge*.3));
  }
  if(x%9===0)ellipse(x,bottom,5,3,'#d8fcff',power*.6);
 }
 ellipse(240,188,108,5,'#bdf6ff',power*.32);
}
function ritual(t){
 c.save();camera(1+ease(t/5)*.025,240,220);background('shrine.png');const poses=dance(t);bellLight(t+8);glow(240,228,13,'#cfebff',.2+ease(t/5)*.12);poolWaves(t,.3);silverFeathers(t,ease(t/3)*.45,240,199);mist(t,.25);c.restore();if(t<.25)fade(1-ease(t/.25));return poses;
}
function whirlpool(t){
 c.save();camera(1+ease(t/4)*.055,240,180);background('waterfall.png');waterCurtain(t,.6+ease(t/4)*.25);poolWaves(t+5,.35+ease(t/4)*.65,true);silverFeathers(t+5,.65,240,160);mist(t,.6);glow(240,145,56,'#83dcf4',ease(t/4)*.3);c.restore();
}
function emergence(t){
 background('waterfall.png');const open=ease((t-.5)/2.6),alpha=ease((t-1.25)/.5);
 const scale=mix(.7,birdLayout.scale,ease((t-1.1)/2.8)),x=mix(264,240,ease(t/3.5)),y=mix(170,birdLayout.targetY,ease(t/4));
 glow(240,132,58,'#b8edff',open*.35);lugia('Walk',0,x,y,scale,t*.7,alpha);
 waterCurtain(t+4,.9*(1-open*.5),open*204);poolWaves(t+9,1,true);silverFeathers(t+9,.65,240,145);mist(t,.8);
 if(t>3.65)fade(ease((t-3.65)/.35),'#d8f7ff');
 return{alpha,opening:open,scale};
}
function revelation(t){
 background('shrine.png');const poses=dance(t+5);bellLight(t+21);poolWaves(t+13,.45);silverFeathers(t+13,.55,240,136);mist(t,.3);
 glow(240,95,79,'#a1e9ff',.25);const y=birdLayout.targetY+Math.sin(t*1.6)*1.4,x=240+Math.sin(t*1.15)*1.3;lugia('Walk',0,x,y,birdLayout.scale,t*.7);
 if(t<.7)fade(1-ease(t/.7),'#d8f7ff');return{bird:{x,y,scale:birdLayout.scale},poses};
}
function render(time){
 const t=clamp(time,0,FILM_DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,stormState=null,poses=[],emerge=null,reveal=null;
 if(t<2.5){shot=1;calmFire(t)}else if(t<7.5){shot=2;stormState=stormSummon(t-2.5)}else if(t<8){shot=3;fade(1)}else if(t<13){shot=4;poses=ritual(t-8)}else if(t<17){shot=5;whirlpool(t-13)}else if(t<21){shot=6;emerge=emergence(t-17)}else{shot=7;reveal=revelation(t-21);poses=reveal.poses}
 if(t<.4)fade(1-ease(t/.4));if(t>29.4)fade(ease((t-29.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:249,shot,stormStrength:stormState?.storm||0,introLugiaVisible:false,introSilhouetteVisible:!!stormState?.silhouetteVisible,lightningStrength:stormState?.flash||0,stormCalled:t>=STORM_AT&&t<7.5,blackTransition:shot===3,dancers:poses.length,poses,emerge,reveal,finalLugiaVisible:!!reveal||!!emerge&&emerge.alpha>.01,stormAt:STORM_AT,revealAt:REVEAL,cryAt:CRY};
}
const ready=(async()=>{
 [sprites,dancers,birdLayout]=await Promise.all(['sprites.json','dancers.json','bird-layout.json'].map(async src=>(await fetch(src)).json()));await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['calm.png','storm.png','shrine.png','waterfall.png','dancers.png'].map(load));document.querySelector('#status').hidden=true;render(1.2);
})();
window.lugiaFilm={ready,render,duration:FILM_DURATION,cuts:CUTS,stormAt:STORM_AT,cryAt:CRY,revealAt:REVEAL,women:WOMEN,layout:()=>birdLayout,spriteFrame:t=>frameInfo(249,'Walk',0,(t-21)*.7)};await ready;
