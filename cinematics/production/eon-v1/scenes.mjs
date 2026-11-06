const CUTS=[0,5,8,14,17,25,26],CRY=27,REVEAL=26;
const selected=Number(new URLSearchParams(location.search).get('id')||380),IDS=[380,381];
if(!IDS.includes(selected))throw Error('Unknown Eon Pokémon');
const guide=selected===380?381:380,CHAR=selected===381?'boy':'girl';
const NAME=selected===380?'Latias':'Latios',BASE=guide===380?3.65:3.02,REVEAL_BASE=selected===380?3.65:3.02,ACCENT=selected===380?'#ff9e91':'#8bdfff';
function fade(a,color='#ffffff'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
let riderAssets,heroCount=0,heroRecord=null,lastMount=null;
const SEAT_SOURCE={380:{x:24,y:25},381:{x:32,y:28}};
function heroFactor(multiplier=1){return 54/riderAssets[CHAR].referenceHeight*multiplier}
function drawHeroAtHip(pose,x,y,multiplier=1){
 const data=riderAssets[CHAR],r=data.poses[pose],factor=heroFactor(multiplier),im=images.get(data.src);
 c.drawImage(im,r.x,r.y,r.w,r.h,Math.round(x-r.hipX*factor),Math.round(y-r.hipY*factor),r.w*factor,r.h*factor);
 heroCount++;heroRecord={x,y,pose,character:CHAR,multiplier};
}
function drawHeroAtFeet(x,y,height=54){
 const data=riderAssets[CHAR],r=data.poses.standing,mult=height/54;
 drawHeroAtHip('standing',x,y-(r.h-r.hipY)*heroFactor(mult),mult);
}
function mountSeat(x,y,scale){
 const f=frameInfo(guide,'Walk',4,0,true),a=SEAT_SOURCE[guide];
 return{x:Math.round(x-f.cx*scale)+a.x*scale,y:Math.round(y-f.bottom*scale)+a.y*scale};
}
function lati(x,y,scale,t,dir=0,rider=false,angle=0,kind='Walk',oneShot=false,species=guide){
 // The gliding pose is held while carrying a rider. The whole pair shares the
 // same translation and bank; wing bounds can no longer move the saddle.
 const held=rider&&species===guide;
 if(held){dir=4;kind='Walk';t=0;oneShot=true}
 c.save();c.translate(x,y);c.rotate(angle);c.translate(-x,-y);
 mon(species,kind,dir,x,y,scale,t,{oneShot});
 const seat=species===guide?mountSeat(x,y,scale):null;
 if(held){
  drawHeroAtHip('seated',seat.x,seat.y,scale/BASE);
  lastMount={phase:'riding',seat,heroHip:{x:seat.x,y:seat.y},attached:true};
 }
 c.restore();return seat;
}

function seaMotion(t,zone='coast'){
 const top=zone==='coast'?140:160,spread=zone==='coast'?53:100;
 for(let i=0;i<34;i++){const y=top+(hash(i,selected)*spread+t*(zone==='coast'?2:16))%spread,x=(hash(i,51)*520+t*7)%520-20;px(x,y,5+hash(i,52)*12,1,i%3?'#b4f7ef':'#ffffff',.18)}
}
function arrival(t){
 background('coast.png');seaMotion(t);
 const p=ease(clamp(t/4.2)),x=mix(344,270,p),y=mix(127,210,p),scale=BASE*mix(.22,1,p);
 ellipse(x,239,11+p*31,2+p*3,'#466f64',p*.25);
 drawHeroAtFeet(174,242);
 lati(x,y+Math.sin(t*2.2)*2,scale,t,0);
 if(t<.45)fade(1-t/.45,'#0a2433');
}
function boarding(t){
 background('coast.png');seaMotion(t+5);
 const reposition=ease(t/.7),x=mix(270,240,reposition),lift=ease((t-2.15)/.85),y=216-lift*80;
 const turn=Math.min(4,Math.floor(clamp(t/.7)*4.999));
 ellipse(x,239,42-lift*15,5-lift*2,'#466f64',.26*(1-lift));
 const seat=lati(x,y,BASE,0,turn,false,0,'Walk',true);
 let hx,hy,pose='standing',phase;
 const standingHipY=242-54*.38;
 if(t<.7){
  const q=ease(t/.7);hx=mix(174,215,q);hy=standingHipY-Math.sin(q*Math.PI*4)*.8;phase='approach';
 }else if(t<1.65){
  const q=ease((t-.7)/.95);hx=mix(215,seat.x,q);hy=mix(standingHipY,seat.y,q)-Math.sin(q*Math.PI)*6;
  pose=t<1.42?'standing':'seated';phase='climb';
 }else{hx=seat.x;hy=seat.y;pose='seated';phase=lift>0?'takeoff':'settle'}
 drawHeroAtHip(pose,hx,hy);
 lastMount={phase,seat,heroHip:{x:hx,y:hy},attached:t>=1.65};
 for(let i=0;i<10;i++)if(lift>.1){const a=i*Math.PI/5,r=15+lift*75;px(x+Math.cos(a)*r,239+Math.sin(a)*r*.16,3,1,'#fff6c7',(1-lift)*.4)}
}

function flying(t){
 const p=clamp(t/6),zoom=1+ease(p)*.38;
 c.save();camera(zoom,240,112);background('island.png');c.restore();
 seaMotion(t+8,'island');
 // Clouds travel down and outward while the island grows in the forward view.
 for(let i=0;i<4;i++){const q=((t*.23+i*.31)%1),side=i%2?1:-1;
  cloud(240+side*(120+q*180)-55,155+q*120,85+q*70,15+q*12,'#effbff',i,.42);
 }
 for(let i=0;i<18;i++){const q=(hash(i,7)+t*.45)%1,side=i%2?1:-1;
  c.save();c.globalAlpha=(.1+.22*q);c.strokeStyle='#e5fbff';c.lineWidth=1;c.beginPath();c.moveTo(240+side*(95+q*150),110+q*140);c.lineTo(240+side*(106+q*170),114+q*155);c.stroke();c.restore();
 }
 const x=240+Math.sin(t*.7)*5,y=237+Math.sin(t*2)*2;
 lati(x,y,BASE*.98,t+8,4,true,Math.sin(t*.8)*.035);
}
function landing(t){
 c.save();camera(1+ease(t/3)*.08,240,170);background('landing.png');c.restore();
 const depart=ease((t-1.65)/1.35),x=240+depart*90,y=213-depart*260,scale=BASE*.98;
 const seat=lati(x,y,scale,0,4,false,-depart*.12,'Walk',true);
 if(t<.45){
  drawHeroAtHip('seated',seat.x,seat.y,.98);
  lastMount={phase:'landed',seat,heroHip:{x:seat.x,y:seat.y},attached:true};
 }else if(t<1.35){
  const q=ease((t-.45)/.9),hx=mix(seat.x,215,q),hy=mix(seat.y,242-54*.38,q)-Math.sin(q*Math.PI)*5;
  drawHeroAtHip(q<.5?'seated':'standing',hx,hy,mix(.98,1,q));
  lastMount={phase:'dismount',seat,heroHip:{x:hx,y:hy},attached:false};
 }else{
  const q=ease((t-1.35)/1.65);
  drawHeroAtFeet(mix(215,240,q),mix(242,166,q),mix(54,29,q));
  lastMount={phase:'walk-away',attached:false};
 }
}

function leafCluster(x,y,w,h,alpha=1){
 polygon([[x-w*.5,y],[x-w*.25,y-h*.4],[x+w*.1,y-h*.5],[x+w*.5,y-h*.15],[x+w*.25,y+h*.2],[x-w*.15,y+h*.28]],'#0b3828',alpha);
 polygon([[x-w*.4,y],[x-w*.2,y-h*.2],[x+w*.1,y-h*.35],[x+w*.3,y-h*.1],[x+w*.1,y+h*.12]],'#19573a',alpha*.9);
}
function foregroundForest(t){
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const p=(t*.085+i*.333)%1,x=240+side*(91+p*254),w=5+p*27,y=67-p*115,h=95+p*340,alpha=.18+p*.54;
  polygon([[x-w,y],[x+w*.6,y-8],[x+w,y+h],[x-w*1.5,y+h]],'#402e21',alpha);
  px(x-w*.5,y,w*.3,h,'#6c4d29',alpha*.5);
  leafCluster(x,y+25,w*6,25+p*45,alpha);
 }
}
function forest(t){
 const p=clamp(t/8),zoom=1+p*2.7,x=240+Math.sin(t*1.4)*1.2,y=119+Math.abs(Math.sin(t*3.4))*1.2;
 c.save();camera(zoom,x,y);background('forest.png');c.restore();
 foregroundForest(t);
 for(let i=0;i<25;i++){
  const a=hash(i,9)*Math.PI*2,r=20+((hash(i,10)+t*.08)%1)*220;
  px(240+Math.cos(a)*r,119+Math.sin(a)*r*.6,1,1,'#fff6bf',.2+hash(i,11)*.3);
 }
 const r=18+Math.pow(p,2.6)*113;
 glow(240,119,r*1.1,'#f6ffd0',.15+p*.18);
 ellipse(240,119,r*.26,r*.33,'#fffbd0',p*.4);
 // Full white occurs only as the traveller reaches the opening.
 if(t>6.35)fade(ease((t-6.35)/1.65));
}
function waterFalls(t){
 // Animated glints calibrated inside the two illustrated waterfall columns.
 for(const [x,y,w,h]of[[49,73,17,72],[412,72,17,72]]){
  for(let i=0;i<8;i++){const yy=y+((t*31+i*12)%h);px(x+hash(i,4)*w,yy,1,5,'#e8ffff',.42)}
  for(let i=0;i<5;i++){const a=t*2+i,r=8+i*2;px(x+w/2+Math.sin(a)*r,y+h+Math.cos(a)*2,2,1,'#edffff',.45)}
 }
}
function revelation(t){
 background('clearing.png');waterFalls(t);
 glow(240,171,69,ACCENT,.13);
 ellipse(240,224,55,7,'#336b50',.24);
 const kind=t>1&&t<2.45?'Charge':'Idle',ft=kind==='Charge'?(t-1)*.3:t*.65;
 lati(240,213+Math.sin(t*1.7)*3,REVEAL_BASE*1.32,ft,0,false,0,kind,kind==='Charge',selected);
 for(let i=0;i<16;i++){const x=hash(i,5)*480,y=130+(hash(i,6)*140+t*5)%140;px(x,y,1,1,'#fff7cb',.35)}
 if(t<.8)fade(1-ease(t/.8));
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 heroCount=0;heroRecord=null;lastMount=null;
 let shot;
 if(t<5){shot=1;arrival(t)}else if(t<8){shot=2;boarding(t-5)}else if(t<14){shot=3;flying(t-8)}else if(t<17){shot=4;landing(t-14)}else if(t<25){shot=5;forest(t-17)}else if(t<26){shot=6;fade(1)}else{shot=7;revelation(t-26)}
 if(t>31.45)fade(ease((t-31.45)/.55),'#071722');
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,species:selected,guideSpecies:guide,character:CHAR,heroCount,hero:heroRecord,mount:lastMount,revealedSpecies:t>=26?selected:null,shot,whiteHold:t>=25&&t<26,forestProgress:t>=17&&t<25?(t-17)/8:null,revealAt:REVEAL,cryAt:CRY};
}
const ready=(async()=>{
 sprites=await(await fetch('sprites.json')).json();riderAssets=await(await fetch('riders.json')).json();
 await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));
 await Promise.all(['boy-poses.png','girl-poses.png','coast.png','island.png','landing.png','forest.png','clearing.png'].map(load));
 document.querySelector('#status').hidden=true;render(0);
})();
window.eonFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,species:selected,guideSpecies:guide,character:CHAR,name:NAME};await ready;

