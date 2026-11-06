const CUTS=[0,5.5,10.5,16.5,19,27],CRY=32;
let meteorBounds;
function fade(alpha,color='#030611'){px(0,0,W,H,color,clamp(alpha))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function entity(id,kind,dir,x,y,scale,t,options={}){
 const f=frameInfo(id,kind,dir,t,options.oneShot),mid=(f.top+f.bottom)/2;
 c.save();c.globalAlpha=options.alpha??1;if(options.angle){c.translate(x,y);c.rotate(options.angle);c.translate(-x,-y)}
 c.drawImage(f.canvas,Math.round(x-f.cx*scale),Math.round(y-mid*scale),f.mode.w*scale,f.mode.h*scale);c.restore();
}
function meteor(x,y,size,angle,t,alpha=1){
 const im=images.get('meteor.png'),[sx,sy,ex,ey]=meteorBounds,ww=ex-sx,hh=ey-sy;
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.drawImage(im,sx,sy,ww,hh,-size/2,-size*hh/ww/2,size,size*hh/ww);c.restore();
 glow(x,y,size*.4,'#a93ee8',(.25+.1*Math.sin(t*2))*alpha);
}
function stars(t,amount=.8){for(let i=0;i<85;i++){const x=hash(i,36)*W,y=hash(i,37)*H;px(x,y,i%17?1:2,i%17?1:2,i%5?'#c8e3ff':'#c795ff',(.2+.5*Math.sin(t*.6+i)**2)*amount)}}
function space(t,zoom=1){background('space.png',zoom);stars(t,.7)}
const label=(text,x,y,color='#8ee7ed',size=5)=>{c.save();c.font=size+'px monospace';c.textBaseline='top';c.fillStyle=color;c.fillText(text,x,y);c.restore()};
function laboratory(t){
 c.save();camera(1+ease(t/5.5)*.045,240,130);background('lab-analysis-v2.png');
 // Calibrated display interiors, in the 480 x 270 scene coordinates.
 c.save();c.beginPath();c.rect(147,56,185,84);c.clip();px(147,56,185,84,'#0a1730');
 label('ANALYSE METEORITE',153,60);px(151,69,177,1,'#2b6f8c');
 for(let i=0;i<5;i++){px(152,77+i*12,79,1,'#1a3651',.7);px(155+i*17,73,1,59,'#1a3651',.7)}
 meteor(191,104,48,Math.sin(t*.7)*.15,t,.9);
 c.save();c.strokeStyle='#6ee6e1';c.globalAlpha=.6;c.lineWidth=1;c.beginPath();c.ellipse(191,104,32,24,-.3,0,Math.PI*2);c.stroke();c.restore();
 px(235,74,1,59,'#31516f');
 label('TRAJECTOIRE',243,75);ellipse(313,98,8,8,'#327fa1');ellipse(312,97,4,5,'#69b4b8');
 for(let i=0;i<10;i++)px(246+i*6,86+i*1.2,2,1,'#b27ee9',.8);
 const q=(t*.27)%1;px(mix(247,304,q),mix(86,98,q),3,3,'#f1b7fc');
 label('VITESSE',243,112);px(271,113,50,3,'#1a3853');px(271,113,25+t*3.7,3,'#6adbd8');
 label('ENERGIE',243,124);px(271,125,50,3,'#1a3853');px(271,125,15+t*5.7,3,t>3.8?'#e68ccc':'#829fec');
 px(151,74+(t*17)%60,79,1,'#a1f6f2',.3);c.restore();
 // The left wall screen analyses DNA rather than showing another asteroid.
 c.save();c.beginPath();c.rect(42,80,78,39);c.clip();px(42,80,78,39,'#0b1830');label('ADN / SEQUENCE',46,83);
 for(let y=0;y<25;y+=2){const a=y*.35+t*2,x1=81+Math.sin(a)*20,x2=81-Math.sin(a)*20;
  if(y%4===0)px(Math.min(x1,x2),92+y,Math.abs(x1-x2),1,'#6e62ad',.8);
  px(x1,92+y,3,2,'#69dedc');px(x2,92+y,3,2,'#c18ff3');
 }c.restore();
 c.save();c.beginPath();c.rect(359,80,79,39);c.clip();px(359,80,79,39,'#0b1830');label('SIGNAL COSMIQUE',363,83);
 for(let k=0;k<70;k++)px(363+k,103+Math.sin(k*.19-t*3)*5+Math.sin(k*.6+t)*2,1,1,'#91cff3',.9);
 for(let k=0;k<4;k++)px(365+k*17,114,10+Math.sin(t+k)*3,2,'#607bab');c.restore();
 c.restore();if(t<.35)fade(1-t/.35);if(t>5.15)fade(ease((t-5.15)/.35));
}
const rayNoses=new Map();
function stretchedRay(x,y,scale,t,angle=0,alpha=1){
 const indices=[5,6,7,8,7,6],index=indices[Math.floor(t*9)%indices.length],mode=sprites[384].Attack;
 const at=mode.durations.slice(0,index).reduce((a,b)=>a+b,0)+mode.durations[index]/2;
 const f=frameInfo(384,'Attack',6,at,true);
 if(!rayNoses.has(index)){
  const data=f.canvas.getContext('2d').getImageData(0,0,mode.w,mode.h).data;let min=mode.w;
  for(let yy=0;yy<mode.h;yy++)for(let xx=0;xx<mode.w;xx++)if(data[(yy*mode.w+xx)*4+3]>32)min=Math.min(min,xx);
  let yySum=0,n=0;for(let yy=0;yy<mode.h;yy++)for(let xx=min;xx<min+8;xx++)if(data[(yy*mode.w+xx)*4+3]>32){yySum+=yy;n++}
  rayNoses.set(index,{x:min,y:yySum/n});
 }
 const nose=rayNoses.get(index);c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;
 c.drawImage(f.canvas,-nose.x*scale,-nose.y*scale,mode.w*scale,mode.h*scale);c.restore();
}
function greenWake(x,y,t,angle,scale=1,alpha=1){
 c.save();c.translate(x,y);c.rotate(angle);glow(8,0,22*scale,'#5dff9e',.32*alpha);
 for(const side of [-1,1])for(let j=0;j<2;j++){
  c.globalAlpha=(.6-j*.2)*alpha;c.strokeStyle=j?'#ccffc8':'#4cf2ab';c.lineWidth=(2-j*.8)*scale;c.beginPath();
  c.moveTo(3,side*2);c.bezierCurveTo(35*scale,side*24*scale,90*scale,side*(12+Math.sin(t*7)*3)*scale,160*scale,side*10*scale);c.stroke();
 }
 for(let i=0;i<19;i++){const xx=20+(i*17+t*100)%170,yy=Math.sin(i*2+t*8)*14*scale;px(xx*scale,yy,7*scale,1,i%4?'#4fecaa':'#dcffd1',alpha*.55*(1-xx/200))}
 c.restore();
}
function meteorFlight(x,y,size,t,angle=.42){
 c.save();c.translate(x,y);c.rotate(angle);
 for(let i=17;i>0;i--){const d=i*8;glow(-d,0,Math.max(2,size*.22*(1-i/21)),'#ae4be9',.07);px(-d,-2+Math.sin(t*17+i)*3,8,2,i%3?'#c975ed':'#ffe4ef',.5*(1-i/20))}
 c.restore();meteor(x,y,size,t*.2,t);
}
function approach(t){
 space(t,1+ease(t/5)*.045);
 if(t<2.9){
  const p=clamp(t/2.9)**1.65,x=mix(40,276,p),y=mix(18,125,p);
  for(let i=0;i<18;i++){const a=(hash(i,4)*550+t*(45+t*25))%550;px(a-40,hash(i,7)*270,7+t*3,1,'#c8caff',.24)}
  meteorFlight(x,y,mix(46,102,p),t);
 }else{
  const age=t-2.9,p=clamp(age/2.1);
  meteorFlight(mix(276,293,p),mix(125,132,p),102+p*5,t);
  // Launch visibly originates on the Earth's surface, then flies into space.
  const launch=clamp((age-.18)/1.7)**1.35,x=mix(397,326,launch),y=mix(223,148,launch),a=.81;
  glow(397,223,12+age*9,'#5affae',Math.max(0,1-age/1.2)*.8);
  if(age>.18){
   const aLight=ease((age-.18)/.15)*(1-.45*ease((age-.8)/1.1));
   glow(x,y,10,'#47ff9c',aLight*.8);glow(x,y,4,'#d7ffe3',aLight*.9);
   c.save();c.strokeStyle='#78ffc0';c.globalAlpha=aLight*.65;c.lineWidth=2;c.beginPath();c.moveTo(397,223);c.lineTo(x,y);c.stroke();c.restore();
   greenWake(x,y,age,a,.7,ease(age/.35));
   stretchedRay(x,y,.64+launch*.16,age,a,ease((age-.55)/.5));
   glow(x,y,8,'#abffd1',.23);
  }
 }
 if(t<.35)fade(1-t/.35);
}
const HIT=4.3;
function intercept(t){
 background('deep-space-v2.png');stars(t+5,.6);
 const p=clamp(t/HIT),mp=p**1.25;
 const mx=mix(98,238,mp),my=mix(57,125,mp),size=mix(82,118,mp);
 if(t<HIT)meteorFlight(mx,my,size,t,.45);
 let x=mix(380,289,p**1.6),y=mix(219,125,p**1.25),angle=mix(.65,0,ease(p)),scale=mix(.76,1.38,ease(p));
 if(t>=HIT){const q=clamp((t-HIT)/1.1);x=mix(289,-170,ease(q));y=mix(125,4,ease(q));angle=.26}
 if(t<HIT+1.15){greenWake(x,y,t,angle,scale*.75);stretchedRay(x,y,scale,t,angle)}
 if(t>=HIT){debris(t-HIT,238,125);collisionExplosion(t-HIT,238,125)}
}
function collisionExplosion(t,x,y){
 if(t<0)return;const a=clamp(1-t/.9);
 glow(x,y,22+t*90,'#d5ffcc',a);burst(x,y,t,'#c7ffd8',2.2);
 for(let i=0;i<52;i++){const ang=i*2.399,speed=55+hash(i,3)*130;px(x+Math.cos(ang)*speed*t,y+Math.sin(ang)*speed*t,3,3,i%3?'#dfffe6':'#b18aff',Math.max(0,1-t/1.9)*.8)}
 if(t<.42)fade(Math.sin(clamp(t/.42)*Math.PI)*.78,'#dcffe0');
}


function debris(t,x=300,y=125){
 if(t<0)return;const im=images.get('meteor.png'),[sx,sy,ex,ey]=meteorBounds,sw=(ex-sx)/3,sh=(ey-sy)/3;
 for(let i=0;i<9;i++){
  const a=i*Math.PI*2/9+.3,speed=35+hash(i,5)*55,xx=x+Math.cos(a)*speed*t,yy=y+Math.sin(a)*speed*t+t*t*3,size=22+hash(i,6)*24;
  c.save();c.globalAlpha=clamp(1-(t-2.2)/2.7);c.translate(xx,yy);c.rotate(a+t*(hash(i,8)-.5));c.drawImage(im,sx+i%3*sw,sy+Math.floor(i/3)*sh,sw,sh,-size/2,-size/2,size,size);c.restore();
 }
}
function triangle(x,y,size,red=0,alpha=1){
 const h=size*.866,front=`rgb(${Math.round(22+red*125)},${Math.round(30-red*19)},${Math.round(34-red*11)})`;
 polygon([[x,y-h*.6],[x-size/2,y+h*.4],[x+size/2,y+h*.4]],front,alpha);
 polygon([[x,y-h*.6],[x-size/2,y+h*.4],[x-size*.32,y+h*.28]],red>.3?'#b3333e':'#354445',alpha*.65);
 polygon([[x,y-h*.6],[x+size/2,y+h*.4],[x+size*.32,y+h*.28]],red>.3?'#6d152a':'#0f1926',alpha*.85);
}
function aftermath(t){
 space(t+11,1.045);debris(t+1.5);
 const appear=ease((t-.15)/1.05);glow(240,125,27,'#9a70ba',appear*.2);triangle(240,125,34*appear,0,appear);
}
// Relative motion observed in the user-supplied video, approx. 90.8–97.2 s.
// Same order of fast straight hops and holds, fitted to the pixel-art framing.
const TRIANGLE_PATH=[
 [0,240,125],[.6,240,125],[1.1,48,225],[1.85,48,225],
 [2.4,240,43],[2.85,240,43],[3.35,432,225],[3.6,432,225],
 [4.1,91,82],[4.35,91,82],[4.85,391,101],[5.1,391,101],
 [5.35,240,222],[5.6,116,171],[6.1,366,171],[6.35,240,208],[6.6,240,125],[8,240,125]
];
function trianglePosition(t){
 let i=0;while(i<TRIANGLE_PATH.length-2&&t>=TRIANGLE_PATH[i+1][0])i++;
 const a=TRIANGLE_PATH[i],b=TRIANGLE_PATH[i+1],p=ease((t-a[0])/(b[0]-a[0]));return{x:mix(a[1],b[1],p),y:mix(a[2],b[2],p)};
}
function movements(t){
 space(t+14,1.045);const p=trianglePosition(t),red=ease((t-3.5)/4.5);
 for(let i=3;i>0;i--){const old=trianglePosition(Math.max(0,t-i*.035));if(Math.hypot(old.x-p.x,old.y-p.y)>2)triangle(old.x,old.y,34,red,.08*(4-i))}
 glow(p.x,p.y,20,'#b64f8f',red*.17);triangle(p.x,p.y,34,red);
}
function tentacles(t,size,alpha=1){
 const grow=ease((t-2.15)/1.25);if(!grow)return;
 c.save();c.globalAlpha=alpha;c.lineCap='square';
 for(const side of [-1,1])for(let j=0;j<2;j++){
  const x=240+side*(size*.26+j*5),y=133+j*10,endX=x+side*(16+j*12)*grow,endY=y-(32-j*8)*grow;
  c.strokeStyle='#0a111c';c.lineWidth=4;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+side*30*grow,y-10,x-side*7,y-46,endX,endY);c.stroke();
  c.strokeStyle='#20536a';c.lineWidth=1;c.stroke();
 }c.restore();
}
function revelation(t){
 space(t+22,1.045+ease(t/9)*.025);
 const size=mix(34,118,ease(t/3.1)),breakAt=4.3,appear=ease((t-breakAt)/.85);
 if(t<breakAt+.35){glow(240,125,40,'#d350a2',ease(t/3)*.25);tentacles(t,size,1-appear);triangle(240,125,size,1,1-appear)}
 const age=t-breakAt;
 if(age>=0){
  burst(240,125,age,'#e3c6ff',1.6);glow(240,139,66,'#b36fe2',.45*(1-appear*.45));
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7,r=age*(35+hash(i,11)*38);triangle(240+Math.cos(a)*r,125+Math.sin(a)*r+age*age*12,15+hash(i,12)*14,1,Math.max(0,1-age/1.8))}
  const roaring=t>5&&t<6.45,kind=roaring?'SpAttack':'Idle';
  mon(386,kind,0,240,mix(249,234,appear)+Math.sin(t*1.8)*1.4,5.8,roaring?(t-5)*.33:t*.8,{alpha:appear,oneShot:roaring});
  if(age<.5)fade(Math.sin(age/.5*Math.PI)*.72,'#d7baff');
 }
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;if(t<5.5){shot=1;laboratory(t)}else if(t<10.5){shot=2;approach(t-5.5)}else if(t<16.5){shot=3;intercept(t-10.5)}else if(t<19){shot=4;aftermath(t-16.5)}else if(t<27){shot=5;movements(t-19)}else{shot=6;revelation(t-27)}
 if(t>35.5)fade(ease((t-35.5)/.5));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,shot,cryAt:CRY,deoxysVisible:t>=31.3,triangle:t>=19&&t<27?trianglePosition(t-19):null};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();meteorBounds=(await(await fetch('meteor-geometry.json')).json()).bounds;await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['lab-analysis-v2.png','deep-space-v2.png','space.png','meteor.png'].map(load));document.querySelector('#status').hidden=true;render(0)})();
window.deoxysFilm={ready,duration:DURATION,render,cuts:CUTS,launchAt:8.4,impactAt:14.8,cryAt:CRY,trianglePath:TRIANGLE_PATH};await ready;
