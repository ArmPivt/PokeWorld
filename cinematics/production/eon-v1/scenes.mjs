const CUTS=[0,5,8,14,17,25,26],CRY=27,REVEAL=26;
const selected=Number(new URLSearchParams(location.search).get('id')||380),IDS=[380,381];
if(!IDS.includes(selected))throw Error('Unknown Eon Pokémon');
const NAME=selected===380?'Latias':'Latios',BASE=selected===380?3.65:3.02,ACCENT=selected===380?'#ff9e91':'#8bdfff';
function fade(a,color='#ffffff'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
// Original tiny explorer sprite, authored as code-native pixel cells. It is
// deliberately generic so the film does not impersonate the player's profile.
const PAL={o:'#142b34',w:'#f1edcb',g:'#5c9e71',d:'#24564c',s:'#d4a174',k:'#5b493c',b:'#b39650'};
const STAND=[
'.....oooo.....','....owwwwo....','...owwwwwwo...','...owggggwo...','....osssso....','....osssso....',
'....oddddo....','...odbbbbdo...','..osdbbbbdso..','..osdbbbbdso..','...odbbbbdo...','....obbbbo....',
'....oddddo....','....okkkko....','....okooko....','....okooko....','....okooko....','...ooo..ooo...'
];
const RIDER=[
'.....oooo.....','....owwwwo....','...owwwwwwo...','...owggggwo...','....osssso....','....osssso....',
'...ooddddoo...','..osdbbbbdso..','..osdbbbbdso..','...odb bdo....'.replaceAll(' ','b'),
'...okkbbkko...','..okko..okko..','..ooo....ooo..'
];
function explorer(x,y,scale,t,ride=false,alpha=1){
 const rows=ride?RIDER:STAND,height=rows.length,walk=ride?0:Math.sin(t*10)*.7;
 rows.forEach((row,j)=>[...row].forEach((v,i)=>{if(!PAL[v])return;const leg=j>=14?(i<7?walk:-walk):0;px(x+(i-7)*scale+leg,y+(j-height)*scale,scale,scale,PAL[v],alpha)}));
}
function lati(x,y,scale,t,dir=0,rider=false,angle=0,kind='Walk',oneShot=false){
 const f=frameInfo(selected,kind,dir,t,oneShot),visibleH=(f.bottom-f.top)*scale;
 c.save();c.translate(x,y);c.rotate(angle);c.translate(-x,-y);
 mon(selected,kind,dir,x,y,scale,t,{oneShot});
 if(rider)explorer(x,y-visibleH*.39,Math.max(1,scale*.75),t,true);
 c.restore();return {seatX:x,seatY:y-visibleH*.39};
}
function seaMotion(t,zone='coast'){
 const top=zone==='coast'?140:160,spread=zone==='coast'?53:100;
 for(let i=0;i<34;i++){const y=top+(hash(i,selected)*spread+t*(zone==='coast'?2:16))%spread,x=(hash(i,51)*520+t*7)%520-20;px(x,y,5+hash(i,52)*12,1,i%3?'#b4f7ef':'#ffffff',.18)}
}
function arrival(t){
 background('coast.png');seaMotion(t);
 const p=ease(clamp(t/4.2)),x=mix(344,270,p),y=mix(127,210,p),scale=BASE*mix(.22,1,p);
 ellipse(x,239,11+p*31,2+p*3,'#466f64',p*.25);
 explorer(174,242,2,t);
 lati(x,y+Math.sin(t*2.2)*2,scale,t,0);
 if(t<.45)fade(1-t/.45,'#0a2433');
}
function boarding(t){
 background('coast.png');seaMotion(t+5);
 const p=ease(t/1.4),x=mix(270,240,p),rise=ease((t-2.05)/.95),y=210-rise*64;
 const turn=Math.min(4,Math.floor(clamp((t-.25)/1.25)*5)),mounted=t>=1.85;
 ellipse(x,239,42-rise*15,5-rise*2,'#466f64',.26*(1-rise));
 if(!mounted){
  const q=ease((t-.15)/1.7),yy=mix(242,171,q);
  explorer(mix(174,x,q),yy,mix(2,BASE*.75,q),t);
 }
 lati(x,y+Math.sin(t*2.2)*1.6,BASE,t+5,turn,mounted);
 for(let i=0;i<10;i++)if(rise>.1){const a=i*Math.PI/5,r=15+rise*75;px(x+Math.cos(a)*r,239+Math.sin(a)*r*.16,3,1,'#fff6c7',(1-rise)*.4)}
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
 const dismount=ease((t-.6)/.7),depart=ease((t-1.35)/1.5);
 const x=240+depart*90,y=213-depart*260,scale=BASE*(.98-depart*.3);
 if(t<1.3)lati(240,213+Math.sin(t*2),BASE*.98,t+14,4,t<.65);
 if(t>=.65){
  const q=ease((t-.65)/2.35);explorer(mix(226,240,q),mix(238,167,q),mix(1.8,1.05,q),t+14);
 }
 if(t>=1.3)lati(x,y,scale,t+14,4,false,-depart*.12);
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
 lati(240,213+Math.sin(t*1.7)*3,BASE*1.32,ft,0,false,0,kind,kind==='Charge');
 for(let i=0;i<16;i++){const x=hash(i,5)*480,y=130+(hash(i,6)*140+t*5)%140;px(x,y,1,1,'#fff7cb',.35)}
 if(t<.8)fade(1-ease(t/.8));
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;
 if(t<5){shot=1;arrival(t)}else if(t<8){shot=2;boarding(t-5)}else if(t<14){shot=3;flying(t-8)}else if(t<17){shot=4;landing(t-14)}else if(t<25){shot=5;forest(t-17)}else if(t<26){shot=6;fade(1)}else{shot=7;revelation(t-26)}
 if(t>31.45)fade(ease((t-31.45)/.55),'#071722');
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,species:selected,guideSpecies:selected,revealedSpecies:t>=26?selected:null,shot,whiteHold:t>=25&&t<26,forestProgress:t>=17&&t<25?(t-17)/8:null,revealAt:REVEAL,cryAt:CRY};
}
const ready=(async()=>{
 sprites=await(await fetch('sprites.json')).json();
 await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));
 await Promise.all(['coast.png','island.png','landing.png','forest.png','clearing.png'].map(load));
 document.querySelector('#status').hidden=true;render(0);
})();
window.eonFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,species:selected,name:NAME};await ready;

