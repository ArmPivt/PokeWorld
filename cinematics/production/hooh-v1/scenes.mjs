const FILM_DURATION=44,CUTS=[0,7,13,20,29,35],REVEAL=35.2,CRY=37.15;
let dancers,birdLayout;
const WOMEN=[{row:0,x:155,y:216,h:35},{row:1,x:240,y:219,h:36},{row:2,x:325,y:216,h:35},{row:3,x:105,y:234,h:39},{row:4,x:375,y:234,h:39}];
const BELL_TIMES=[21.6,24.1,26.6,28.2,35.1,39.2];
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
function burning(t){
 c.save();camera(1+ease(t/7)*.075,240,150,.15,t);background('tower.png');flames(t,.75+ease(t/7)*.4);towerSmoke(t,.95);rain(t,.15);puddles(t);c.restore();
}
function extinguishing(t){
 c.save();camera(1.075*(1-ease(t/6))+.999*ease(t/6),240,150);background('tower.png');
 imageOverlay('ruins.png',ease((t-2)/2.6));const p=1-ease(t/4.8);flames(t+7,p*1.15);towerSmoke(t+7,.4+p*.6);
 // Wet smoke hides the collapsing upper stories, then clears above the ruins.
 const smoke=Math.sin(Math.PI*clamp((t-1.8)/3.3));
 for(let i=0;i<8;i++)cloud(112+(i%3)*49+Math.sin(t+i)*8,49+Math.floor(i/3)*52,160,65,'#788394',i,smoke*.2);
 rain(t+7,.35*(1-ease((t-4)/2)));puddles(t+7,.4);c.restore();
}
const RAINBOW=['#ed767b','#f6ad65','#f6dd85','#94d799','#73c6df','#8389d6','#b493d9'];
function rainbow(progress,alpha=1){
 if(progress<=0)return;
 for(let band=0;band<7;band++){
  const rx=222-band*3,ry=116-band*3,pts=[],steps=Math.max(2,Math.round(progress*180));
  for(let i=0;i<=steps;i++){const a=Math.PI-Math.PI*progress*i/steps;pts.push([240+Math.cos(a)*rx,151-Math.sin(a)*ry])}
  line(pts,RAINBOW[band],3.1,alpha*.68);
 }
}
function rainbowOverRuins(t){
 c.save();camera(1.004+ease(t/7)*.025,240,165);background('ruins.png');const p=ease((t-1.15)/3.2),warm=ease((t-2.7)/3.2);
 rainbow(p,.92);towerSmoke(t+13,.17*(1-t/7));
 for(let i=0;i<7;i++)polygon([[150+i*25,81-i%3*5],[171+i*25,79-i%3*5],[286+i*10,238],[181+i*9,238]],RAINBOW[i],warm*.045);
 glow(240,197,82,'#ffdb99',warm*.31);fade(warm*.1,'#f3c484');
 for(let i=0;i<18;i++)spark(164+hash(i,8)*151,156+hash(i,9)*79,1,'#ffeabb',warm*(.12+.15*Math.sin(t*2+i)**6));
 c.restore();
}
function goldenLeaves(t,amount=.5){
 for(let i=0;i<22;i++){
  const age=(hash(i,8)+t*.1)%1,x=(hash(i,7)*590+t*15)%590-50,y=age*290-20,s=1+i%2;
  polygon([[x-s*2,y],[x,y-s*2],[x+s*2,y+s],[x,y+s*2],[x-s,y+s]],i%3?'#dc9c57':'#f3cc7a',Math.sin(age*Math.PI)*amount);
 }
}
function dancer(row,x,y,height,pose,alpha=1,mirror=false){
 const entry=dancers[row],r=entry.poses[pose],s=height/entry.referenceHeight;
 c.save();c.globalAlpha=alpha;c.translate(x,y);if(mirror)c.scale(-1,1);
 c.drawImage(images.get(entry.src),r.x,r.y,r.w,r.h,Math.round(-r.anchorX*s),Math.round(-r.anchorY*s),r.w*s,r.h*s);c.restore();
}
function dance(t,absolute){
 const sequence=[0,1,2,1,3,0,2,1],beat=.64;
 const poses=[];
 for(let i=0;i<WOMEN.length;i++){
  const w=WOMEN[i],phase=(t/beat+(i%2)*.35)%sequence.length,k=Math.floor(phase),f=phase-k,pose=sequence[k],next=sequence[(k+1)%sequence.length],transition=ease((f-.83)/.17);
  const x=w.x+Math.sin(t*.7+i*.4)*2.4,y=w.y;ellipse(x,y+1,7,1.8,'#452237',.24);
  dancer(w.row,x,y,w.h,pose,1-transition,i>2);if(transition>0)dancer(w.row,x,y,w.h,next,transition,i>2);poses.push(pose);
 }
 return poses;
}
function bellWaves(absolute){
 for(let i=0;i<BELL_TIMES.length;i++){
  const age=absolute-BELL_TIMES[i];if(age<0||age>1.6)continue;
  for(const x of [74,405]){
   const rr=5+age*40,pts=[];for(let k=0;k<=40;k++){const a=k*Math.PI/20;pts.push([x+Math.cos(a)*rr,139+Math.sin(a)*rr*.7])}
   line(pts,'#ffe5a0',1.2,(1-age/1.6)*.55);glow(x,138,17,'#ffe8a3',(1-age/1.6)*.25);
  }
 }
}
function ritual(t){
 const close=ease((t-3.2)/1.2)*(1-ease((t-6.1)/1.5));
 c.save();camera(1+ease(t/9)*.035+close*.22,240,199);background('terrace.png');const poses=dance(t,t+20);bellWaves(t+20);goldenLeaves(t+20,.5);
 for(let i=0;i<12;i++)px(153+hash(i,3)*175,210-hash(i,4)*70-t*1.4,1,1,'#ffebba',.2);
 c.restore();return poses;
}
function skyArrival(t){
 c.save();camera(1+ease(t/6)*.13,240,132);background('sky.png');
 const p=ease(t/5.4),x=mix(81,240,p),y=mix(179,123,p)+Math.sin(t*1.1)*8,r=mix(3,27,p);
 for(let band=6;band>=0;band--){const pts=[];for(let k=0;k<28;k++){const q=k/27,xx=x-q*(55+p*55),yy=y+q*36+Math.sin(q*4-t)*4;pts.push([xx,yy+band*.8])}line(pts,RAINBOW[band],1.4,.32*p)}
 glow(x,y,r*1.8,'#ffe5a5',.65);ellipse(x,y,r*.65,r*.65,'#fff5ce',.9);spark(x,y,r,'#ffedb7',.9);
 for(let i=0;i<18;i++){const age=(t*.45+i*.13)%1,a=i*2.399; spark(x+Math.cos(a)*age*(32+r),y+Math.sin(a)*age*(22+r),1+i%2,'#fff0bc',(1-age)*p*.7)}
 goldenLeaves(t+29,.25);c.restore();if(t>5.35)fade(ease((t-5.35)/.65),'#fff3cf');
}
function hoohBird(t,alpha){
 const f=frameInfo(250,'Walk',0,t*.73),s=birdLayout.scale,x=240+Math.sin(t*1.2)*1.3,y=mix(-28,birdLayout.targetY,ease(t/2.05))+Math.sin(t*1.7)*1.3;
 c.save();c.globalAlpha=alpha;c.drawImage(f.canvas,Math.round(x-birdLayout.anchor.x*s),Math.round(y-birdLayout.anchor.y*s),f.mode.w*s,f.mode.h*s);c.restore();return{x,y,scale:s,frame:f.index};
}
function revelation(t){
 background('terrace.png');const poses=dance(t+9,t+35);bellWaves(t+35);goldenLeaves(t+35,.6);
 const alpha=ease((t-.2)/.65);glow(240,100,72,'#ffe4a5',alpha*.22);
 const bird=hoohBird(t,alpha);
 for(let i=0;i<18;i++){const a=i*2.399,r=36+hash(i,4)*83;spark(240+Math.cos(a+t*.25)*r,105+Math.sin(a+t*.25)*r*.62,1+i%3,'#ffedb7',alpha*(.13+.18*Math.sin(t*2+i)**4))}
 if(t<.9)fade(1-ease(t/.9),'#fff3cf');return{bird,poses,alpha};
}
function render(time){
 const t=clamp(time,0,FILM_DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,poses=[],reveal=null;
 if(t<7){shot=1;burning(t)}else if(t<13){shot=2;extinguishing(t-7)}else if(t<20){shot=3;rainbowOverRuins(t-13)}else if(t<29){shot=4;poses=ritual(t-20)}else if(t<35){shot=5;skyArrival(t-29)}else{shot=6;reveal=revelation(t-35);poses=reveal.poses}
 if(t<.45)fade(1-ease(t/.45));if(t>43.4)fade(ease((t-43.4)/.6));
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:250,shot,fireStrength:t<7?.75+ease(t/7)*.4:t<11.8?(1-ease((t-7)/4.8))*1.15:0,rainbowProgress:t>=13&&t<20?ease((t-14.15)/3.2):0,dancers:poses.length,poses,reveal,hoohVisible:!!reveal&&reveal.alpha>.01,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{
 [sprites,dancers,birdLayout]=await Promise.all(['sprites.json','dancers.json','bird-layout.json'].map(async src=>(await fetch(src)).json()));
 await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['tower.png','ruins.png','terrace.png','sky.png','dancers.png'].map(load));document.querySelector('#status').hidden=true;render(1.2);
})();
window.hoohFilm={ready,duration:FILM_DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,bellTimes:BELL_TIMES,women:WOMEN,layout:()=>birdLayout,spriteFrame:t=>frameInfo(250,'Walk',0,(t-35)*.73)};await ready;
