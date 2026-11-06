const species=Number(new URLSearchParams(location.search).get('species'))===383?383:382;
const water=species===382,colors=water?['#2067e8','#52d6ff','#e3faff']:['#b32528','#ff633d','#ffebac'];
const CUTS=[0,3.8,12,15.4,19],CRY=20.2;
function fade(alpha,color='#020612'){px(0,0,W,H,color,clamp(alpha))}
function opening(t){
 c.save();camera(1+ease(t/3.8)*.24,water?327:150,143);background('mural.png');
 for(const x of [14,466]){glow(x,108,21,'#ffa947',.55+.15*Math.sin(t*9));ellipse(x,109,3,6+Math.sin(t*10)*2,'#ff9d4b');px(x-1,105,2,5,'#ffe4a2')}
 for(let i=0;i<25;i++)px((hash(i,1)*W+t*5)%W,hash(i,2)*H,1,1,'#e6c48b',.18);
 if(t>2.3){const a=ease((t-2.3)/1.1);glow(water?328:151,140,50,colors[1],a*.35)}
 c.restore();if(t<.4)fade(1-t/.4);if(t>3.4)fade((t-3.4)/.4);
}
function descent(t){
 const p=ease(t/8.2),im=images.get(water?'ocean.png':'volcano.png'),height=im.height/im.width*W,scroll=p*(height-H);
 c.drawImage(im,0,-scroll,W,height);
 if(water){
  const fish=[{id:170,x:110+t*10,y:159,scale:1.5,dir:2},{id:320,x:405-t*15,y:357,scale:1.9,dir:6},{id:369,x:82+t*19,y:621,scale:1.8,dir:2}];
  for(const f of fish){const yy=f.y-scroll+Math.sin(t*2+f.id)*3;if(yy>-60&&yy<H+60){mon(f.id,'Walk',f.dir,f.x,yy,f.scale,t*.8);if(f.id===170){glow(f.x+15,yy-20,9,'#c7ffb1',.65);glow(f.x-15,yy-15,7,'#c7ffb1',.5)}}}
  for(let i=0;i<46;i++){const yy=(hash(i,8)*1000-t*22-scroll+1100)%1000-80,xx=hash(i,9)*W+Math.sin(t*1.3+i)*3;if(yy<H&&yy>0){const r=i%4?1:3;c.strokeStyle='#9adceb';c.globalAlpha=.3;c.strokeRect(Math.round(xx),Math.round(yy),r*2,r*2);c.globalAlpha=1}}
  fade(.16*p,'#000915');
 }else{
  for(const f of [{id:218,x:26,y:164.5,scale:1.25,dir:2},{id:219,x:417,y:342,scale:1.35,dir:6},{id:218,x:85,y:483,scale:1.4,dir:2}]){const yy=f.y-scroll;if(yy>-55&&yy<H+55){glow(f.x,yy-15,24,'#fa682e',.35);ellipse(f.x,yy,10*f.scale,1.4,'#30252d',.45);mon(f.id,'Idle',f.dir,f.x,yy,f.scale,t)}}
  for(let i=0;i<65;i++){const yy=(hash(i,6)*1050-t*(25+hash(i,3)*35)-scroll+1300)%1050-100,xx=hash(i,4)*W+Math.sin(t*2+i)*5;if(yy>0&&yy<H)px(xx,yy,i%4?1:2,3,i%3?'#f58a3d':'#ffd175',.45)}
  glow(240,270,200,'#ff5324',.2+.3*p);
 }
 if(t<.45)fade(1-t/.45);if(t>7.65)fade((t-7.65)/.55);
}
// Calibrated to the original 1672 × 941 paintings, inside their eye sockets.
// Every point receives the same centered zoom as the background image.
const EYE_SOCKETS={
 382:[[[708,484],[717,482],[727,488],[735,498],[739,510],[727,511],[718,505],[712,497]],[[955,482],[966,484],[961,497],[954,505],[944,511],[932,510],[938,498],[946,489]]],
 383:[[[769,180],[774,183],[781,197],[791,201],[777,200],[770,195]],[[873,181],[868,185],[863,196],[851,201],[866,200],[873,194]]]
};
function eyes(power=1,scale=1){
 const im=images.get(water?'kyogreChamber.png':'groudonChamber.png');
 const point=([x,y])=>[(x/im.width*W-W/2)*scale+W/2,(y/im.height*H-H/2)*scale+H/2];
 for(const polygon of EYE_SOCKETS[species]){
  const points=polygon.map(point),cx=points.reduce((a,p)=>a+p[0],0)/points.length,cy=points.reduce((a,p)=>a+p[1],0)/points.length;
  glow(cx,cy,4,colors[1],power*.7);
  c.save();c.globalAlpha=power;c.fillStyle=colors[0];c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();
  c.fillStyle=colors[1];c.beginPath();points.forEach(([x,y],i)=>{const xx=cx+(x-cx)*.64,yy=cy+(y-cy)*.64;i?c.lineTo(Math.round(xx),Math.round(yy)):c.moveTo(Math.round(xx),Math.round(yy))});c.closePath();c.fill();c.restore();
 }
}
function shrine(t){
 const scale=1+ease(t/3.4)*.018;
 background(water?'kyogreChamber.png':'groudonChamber.png',scale);
 fade(.98,'#01030b');eyes(ease(t/.6)*(.78+.14*Math.sin(t*3)),scale);
 if(t>2.5){const a=ease((t-2.5)/.9);glow(240,217,7,colors[1],a*.35);ellipse(240,217,4,4,colors[0],a*.25)}
 if(t<.35)fade(1-t/.35);
}
function awakening(t){
 const p=ease(t/3.6),charge=ease(t/1.8),y=217-ease((t-1.2)/1.6)*25;
 background(water?'kyogreChamber.png':'groudonChamber.png',1.018);
 fade(.98-p*.78,'#01030b');eyes(.95,1.018);
 ellipse(240,222,25+charge*12,6,colors[0],.3*charge);glow(240,y,22+charge*36,colors[1],charge);
 ellipse(240,y,7+charge*4,8+charge*4,colors[0],.45+charge*.55);
 ellipse(239,y-2,5+charge*2,5+charge*2,colors[1],charge);px(237,y-6,3,3,colors[2],charge);
 // The circular motif on the orb is revealed as it charges.
 c.strokeStyle=colors[2];c.globalAlpha=charge*.8;c.lineWidth=1;c.beginPath();c.arc(240,y,4,0,Math.PI*1.8);c.stroke();c.globalAlpha=1;
 for(let i=0;i<35;i++){const a=i*2.4+t*3,r=(13+hash(i,3)*43)*(1-.35*charge);px(240+Math.cos(a)*r,y+Math.sin(a)*r*.65,2,2,colors[i%3],charge*.8)}
 if(t>1.8){const lift=ease((t-1.8)/1.4);beam(240,y,240,y-lift*330,water?'water':'fire',t,.9*lift,10+lift*14);burst(240,y,t-2.85,colors[2],1.5)}
 if(t>3.0)fade(ease((t-3.0)/.6),colors[1]);
}
function bolt(x,t,at,seed=1){
 const age=t-at;if(age<0||age>.32)return;
 c.save();c.globalAlpha=1-age/.32;c.strokeStyle='#c8f2ff';c.lineWidth=3;c.beginPath();let xx=x;c.moveTo(xx,-4);
 for(let y=12;y<=150;y+=18){xx=x+(hash(y,seed)-.5)*45;c.lineTo(Math.round(xx),y)}c.stroke();
 c.lineWidth=1;c.strokeStyle='#ffffff';c.stroke();c.restore();fade((1-age/.32)*.16,'#dbf7ff');
}
function sea(t){
 c.save();camera(1+ease(t/7)*.035,240,180);background('kyogreSurface.png',1.025);
 for(let i=0;i<11;i++){const x=(i*47+t*28)%530-25,y=147+i%4*20;px(x,y+Math.sin(t*4+i)*2,24+i%3*9,2,'#268ca8',.48)}
 const arrive=ease(t/1.15),roaring=t>1.2&&t<2.8;
 ellipse(240,234,89,7,'#03182c',.7);glow(240,229,78,'#2589e5',.4);
 // Left-facing three-quarter view, opposite Groudon; the head clears the water.
 mon(382,roaring?'Swell':'Idle',7,240,mix(263,234,arrive)+Math.sin(t*2)*1.5,3.15,roaring?(t-1.2)*.28:t*.85,{alpha:arrive,oneShot:roaring});
 for(let x=-4;x<W+4;x+=4){const y=246+Math.sin(x*.046-t*4.2)*3+Math.sin(x*.09+t*3)*1.5;px(x,y,4,H-y,'#082447');if((x+Math.floor(t*18))%52<28)px(x,y,5,2,'#6bd8e6',.8)}
 for(let i=0;i<30;i++){const a=i*Math.PI/15,r=arrive*107+Math.sin(t*3)*6;px(240+Math.cos(a)*r,233+Math.sin(a)*r*.075,7,2,'#a4ecf6',.65)}
 rain(t, .55);rain(t+.7,.22);bolt(111,t,.65,1);bolt(371,t,3.35,2);bolt(62,t,5.4,3);c.restore();
 if(t<.7)fade(1-ease(t/.7),colors[1]);
}
function continent(t){
 const arrive=ease(t/.9),impact=Math.exp(-Math.abs(t-.9)*9);
 c.save();camera(1+ease(t/7)*.055,240,190,impact*.8,t);background('groudonSurface.png',1.025);
 for(let i=0;i<8;i++){const y=142+i*7;px(5+Math.sin(t*3+i)*9,y,470,1,'#ffda82',.045)}
 ellipse(240,231,71,8,'#542d25',.6);
 const roaring=t>1.2&&t<2.8;
 mon(383,roaring?'Emit':'Idle',1,240,232+Math.sin(t*2)*.4,3.15,roaring?(t-1.2)*.33:t*.8,{alpha:arrive,oneShot:roaring});
 burst(240,232,t-.65,'#f5bc73',1.5);
 for(let i=0;i<22;i++){const xx=hash(i,4)*W,yy=225+hash(i,3)*35;if(t<2.4){const a=Math.sin(clamp((t-.2)/2.2)*Math.PI);px(xx,yy-a*(5+hash(i,2)*19),3,3,'#683c2c',a*.7)}}
 // Restrained sun haze, no dark storm or falling rain in Groudon's scene.
 glow(373,51,68,'#fff5bd',.45+.1*Math.sin(t*.9));
 c.restore();if(t<.7)fade(1-ease(t/.7),'#ffad65');
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;if(t<3.8){shot=1;opening(t)}else if(t<12){shot=2;descent(t-3.8)}else if(t<15.4){shot=3;shrine(t-12)}else if(t<19){shot=4;awakening(t-15.4)}else{shot=5;water?sea(t-19):continent(t-19)}
 if(t>25.5)fade(ease((t-25.5)/.5));
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {species,time:t,shot,legendaryVisible:t>=19,cryAt:CRY};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(modes=>Object.values(modes).map(m=>m.src)))].map(load));await Promise.all(['mural','ocean','volcano','kyogreChamber','groudonChamber','kyogreSurface','groudonSurface'].map(n=>load(n+'.png')));document.querySelector('#status').hidden=true;render(0)})();
window.primalFilm={ready,duration:DURATION,species,render,cuts:CUTS,cryAt:CRY};await ready;
