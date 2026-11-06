const CUTS=[0,5.5,11.5,16.5,20.2,22],CRY=22,FLASH=20.2;
function fade(a,color='#04091e'){px(0,0,W,H,color,clamp(a))}
function polygon(points,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();c.restore()}
function star(x,y,r,color='#ffedb0',alpha=1,rotation=0){
 const points=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5+rotation,rr=i%2?r*.43:r;points.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}polygon(points,color,alpha);
}
function twinkle(x,y,r,t,alpha=1){
 const a=(.25+.75*Math.sin(t*2+x)**2)*alpha;
 px(x-r,y,2*r+1,1,'#dbf6ff',a);px(x,y-r,1,2*r+1,'#fff3c5',a);px(x,y,1,1,'#ffffff',a);
}
function sky(t,zoom=1,x=0,y=0){
 background('sky.png',zoom,x,y);
 for(let i=0;i<35;i++)twinkle(hash(i,1)*480,hash(i,2)*230,i%9?1:2,t+hash(i,3)*4,.55);
}
const DIGITS=['11111100011000110001100011000111111','00100011000010000100001000010001110','11111000010000111111100001000011111','11111000010000101111000010000111111','10001100011000111111000010000100001','11111100001000011111000010000111111','11111100001000011111100011000111111','11111000010001000100010000100001000','11111100011000111111100011000111111','11111100011000111111000010000111111'];
function numeral(s,x,y,scale,color){
 [...s].forEach((digit,i)=>{const bitmap=DIGITS[Number(digit)];for(let j=0;j<35;j++)if(bitmap[j]==='1')px(x+i*30+j%5*scale,y+Math.floor(j/5)*scale,scale,scale,color)});
}
function counterValue(t){return 994+Math.min(6,Math.floor(Math.max(0,t)/.62))}
function counter(t){
 c.save();camera(1+.06*ease(t/5.5),240,146);background('counter.png');
 const value=counterValue(t),str=String(value).padStart(4,'0'),phase=(t%.62)/.62,roll=phase>.79&&value<1000?ease((phase-.79)/.21):0;
 c.save();c.beginPath();c.rect(142,128,196,39);c.clip();
 if(roll){numeral(str,185,135-roll*38,4,'#a9c9d8');numeral(String(value+1).padStart(4,'0'),185,173-roll*38,4,'#e3edcc')}
 else{numeral(str,185,135,4,value===1000?'#fff2aa':'#bddae3')}
 c.restore();
 const p=ease((t-3.72)/.5);
 if(p){
  glow(240,148,78,'#f8d882',p*.26);
  for(let i=0;i<16;i++){const a=i*Math.PI/8+t*.23,r=54+(t-3.72)*7;twinkle(240+Math.cos(a)*r,148+Math.sin(a)*r*.55,2,t,p*.8)}
 }
 c.restore();if(t<.45)fade(1-t/.45);if(t>5.18)fade(ease((t-5.18)/.32));
}
function smallMeteor(t,start,x,y,speed=125){
 const age=t-start;if(age<0||age>.85)return;
 const xx=x+age*speed,yy=y+age*speed*.4,a=Math.sin(age/.85*Math.PI);
 c.save();c.strokeStyle='#b8eaff';c.globalAlpha=a*.7;c.lineWidth=1;c.beginPath();c.moveTo(xx-25,yy-10);c.lineTo(xx,yy);c.stroke();c.restore();
 px(xx,yy,2,2,'#fffce2',a);
}
function comet(x,y,size,t,tail=150,alpha=1){
 const dx=.93,dy=.36;
 // Layered tapered ribbons with curved edges, square sparks and a solid star core.
 for(let j=0;j<3;j++){
  const w=size*(.42-j*.11),len=tail*(1-j*.15),col=['#547fae','#a9ddeb','#ffe49d'][j];
  polygon([[x,y-w],[x-len*dx,y-len*dy-w*.12],[x-len*dx+12,y-len*dy+w*.12],[x,y+w]],col,alpha*(.18+j*.15));
 }
 for(let i=0;i<32;i++){
  const p=((hash(i,8)+t*.38)%1),lag=p*tail,spread=size*(.2+p*.8);
  px(x-lag*dx,y-lag*dy+(hash(i,9)-.5)*spread,1+(i%5===0?2:0),1,i%3?'#b8e9ff':'#ffe7a1',alpha*(1-p)*.7);
 }
 glow(x,y,size*1.8,'#a8e5ff',alpha*.2);glow(x,y,size*.9,'#ffe7aa',alpha*.38);
 star(x,y,size,'#d6f2ff',alpha,t*.3);star(x,y,size*.7,'#ffe6a1',alpha,t*.3);star(x,y,size*.36,'#ffffff',alpha,t*.3);
}
function observers(t){
 c.save();camera(1+.035*ease(t/6),300,164);background('watchers.png');
 for(let i=0;i<20;i++)twinkle(hash(i,34)*420,hash(i,35)*118,1,t,.45);
 for(const [start,x,y,speed] of [[.3,20,18,110],[1.2,210,9,100],[2.1,70,57,135],[3.4,170,19,125],[4.1,15,72,110]])smallMeteor(t,start,x,y,speed);
 // Their clasped hands and gaze belong to the background illustration.
 if(t>2.1&&t<4.9){
  const alpha=ease((t-2.1)/.45)*(1-ease((t-4.4)/.5));c.save();c.globalAlpha=alpha;c.textAlign='center';c.font='italic 8px Georgia';c.fillStyle='#e4e8ef';c.shadowColor='#111e40';c.shadowBlur=3;c.fillText('Je fais un vœu…',231,204);c.restore();
 }
 const a=t-5.1;if(a>=0){
  const x=mix(-20,125,clamp(a/.9)),y=mix(24,70,clamp(a/.9));comet(x,y,7+a*4,t,120);
  glow(364,175,18,'#b3e9ff',a*.1);
 }
 c.restore();if(t<.35)fade(1-t/.35);
}
function crossing(t){
 sky(t);
 const p=clamp(t/5),x=mix(102,397,p),y=mix(65,147,p);
 for(let i=0;i<17;i++){const q=(hash(i,45)+t*.22)%1;px(q*530-30,hash(i,46)*270,4,1,'#cbe5ff',.25)}
 comet(x,y,mix(10,18,ease(p)),t,180);
}
function pursuit(t){
 const p=clamp(t/3.7),zoom=1+ease(p)*1.7;
 sky(t+5,zoom,-p*45,-p*25);
 for(let i=0;i<30;i++){
  const a=hash(i,52)*Math.PI*2,r=40+((hash(i,53)+t*.35)%1)*240;
  c.save();c.globalAlpha=.2+p*.35;c.strokeStyle=i%3?'#a7d9f1':'#fff1b8';c.lineWidth=1;c.beginPath();c.moveTo(240+Math.cos(a)*r,126+Math.sin(a)*r*.7);c.lineTo(240+Math.cos(a)*(r+10+p*15),126+Math.sin(a)*(r+10+p*15)*.7);c.stroke();c.restore();
 }
 comet(mix(334,240,ease(p)),mix(145,126,ease(p)),mix(20,72,p**1.5),t,180+p*80);
 if(t>3.05)fade(ease((t-3.05)/.65),'#ffffff');
}
function reveal(t){
 sky(t+9,1.1);
 const appear=ease((t-.2)/1.2),age=Math.max(0,t-.15),scale=mix(5.8,7.1,appear);
 for(let i=0;i<35;i++){
  const a=i*2.399,r=22+age*(13+hash(i,61)*12);
  twinkle(240+Math.cos(a)*r,128+Math.sin(a)*r*.7,1+(i%7===0),t+hash(i,62)*4,.65*(1-ease((age-4)/2)));
 }
 glow(240,132,72,'#f9e6a9',.24);
 const kind=t>1.6&&t<3.1?'Pose':'Idle',ft=kind==='Pose'?(t-1.6)*.28:t*.6;
 mon(385,kind,0,240,208+Math.sin(t*1.8)*4,scale,ft,{alpha:appear,oneShot:kind==='Pose'});
 // Flash begins fully white at the cut and clears into the animated Pokémon.
 if(t<.75)fade(1-ease(t/.75),'#ffffff');
 if(t<1.5){c.save();c.globalAlpha=(1-appear)*.5;c.strokeStyle='#fff0b5';c.lineWidth=2;c.beginPath();c.ellipse(240,128,24+t*110,18+t*72,0,0,Math.PI*2);c.stroke();c.restore()}
}
function render(time){
 const t=clamp(time,0,DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 let shot;if(t<5.5){shot=1;counter(t)}else if(t<11.5){shot=2;observers(t-5.5)}else if(t<16.5){shot=3;crossing(t-11.5)}else if(t<20.2){shot=4;pursuit(t-16.5)}else{shot=t<22?5:6;reveal(t-20.2)}
 if(t>26.4)fade(ease((t-26.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return {time:t,shot,counter:t<5.5?counterValue(t):null,flashAt:FLASH,cryAt:CRY,jirachiVisible:t>=20.65};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['counter.png','watchers.png','sky.png'].map(load));document.querySelector('#status').hidden=true;render(0)})();
window.jirachiFilm={ready,duration:DURATION,render,cuts:CUTS,cryAt:CRY,flashAt:FLASH,counterValue};await ready;

