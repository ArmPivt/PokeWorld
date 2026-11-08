// Revised Dialga transition: an actual frozen scene followed by an exact backwards
// traversal of the opening's scene time, accompanied by reversed opening PCM.
function dialgaTransition(t){
 if(t<5.25){forging(4.25);return{shot:2,phase:'freeze',sceneTime:4.25,clock:false}}
 if(t<6.25){forging(4.25);const p=ease((t-5.25)/.7);fade(p*.28,'#08152a');timeDial(0,240,132,83,p);return{shot:2,phase:'clock',sceneTime:4.25,clock:true}}
 if(t<10.5){const q=Math.max(0,10.5-t);forging(q);if(q<.25)fade(1-ease(q/.25));fade(.12,'#08152a');timeDial(-(t-6.25)*6.5,240,132,83,.8);if(t>10.22)fade(ease((t-10.22)/.28),'#ffffff');return{shot:3,phase:'rewind',sceneTime:q,clock:true}}
 if(t<11){fade(1,'#ffffff');return{shot:4,phase:'flash',sceneTime:0,clock:false}}
 const u=t-11;
 if(t<19){c.save();camera(1+u*.008,240,140);background('time.png');stars(0,'#92d7ea',0);timeDial(u*.25,240,124,71,.75);debris(2,cfg.color,false,true);c.restore();if(u<1.2)fade(1-ease(u/1.2),'#ffffff');return{shot:4,phase:'dimension',sceneTime:null,clock:true}}
 background('time.png');const v=t-19;timeDial(-v*.4,240,117,78,1-ease(v/4.5));ring(240,130,70+v*14,70+v*14,v,cfg.color,.8*(1-v/5));spirit(ID,t,240,224,layouts[ID].scale,.2+ease(v/4)*.6,cfg.dark);glow(240,132,80,cfg.color,.4+ease(v/5)*.5);if(v>4.3)fade(ease((v-4.3)/.7),cfg.color);return{shot:5,phase:'omen',sceneTime:null,clock:true};
}
const GLASS_POINTS=Array.from({length:6},(_,row)=>Array.from({length:9},(_,col)=>[col===0?0:col===8?480:col*60+(hash(row*9+col,62)-.5)*35,row===0?0:row===5?270:row*54+(hash(row*9+col,63)-.5)*27]));
const SHARDS=[];
for(let row=0;row<5;row++)for(let col=0;col<8;col++){const a=GLASS_POINTS[row][col],b=GLASS_POINTS[row][col+1],d=GLASS_POINTS[row+1][col],e=GLASS_POINTS[row+1][col+1];for(const pts of [[a,b,e],[a,e,d]]){const x=pts.reduce((s,p)=>s+p[0],0)/3,y=pts.reduce((s,p)=>s+p[1],0)/3;SHARDS.push({pts,x,y,i:SHARDS.length})}}
function glassCracks(progress=1){
 const cx=240,cy=134;
 for(let i=0;i<13;i++){
  const a=i/13*Math.PI*2,limit=330,p=clamp((progress-i*.019)*1.5),pts=[[cx,cy]];
  for(let j=1;j<=7;j++){const r=limit*j/7*p,dev=(hash(i*7+j,55)-.5)*20;pts.push([cx+Math.cos(a)*r+Math.sin(a)*dev,cy+Math.sin(a)*r-Math.cos(a)*dev])}
  line(pts,'#302037',3,1);line(pts,'#fff6ff',1,1);
  if(progress>.32)for(let j=2;j<6;j++){const point=pts[j],aa=a+(j%2?1:-1)*.7,len=clamp((progress-.3-j*.035)*3)*35;line([point,[point[0]+Math.cos(aa)*len,point[1]+Math.sin(aa)*len]],'#f9e8ff',1,.85)}
 }
 if(progress>.18)for(let i=0;i<5;i++)ring(cx,cy,7+i*5,5+i*4,0,'#fff3ff',clamp((progress-.18)*2)*.5);
}
let glassPlate;
function shatteredGlass(t){
 if(!glassPlate){forging(4.25);glassCracks(1);glassPlate=document.createElement('canvas');glassPlate.width=W;glassPlate.height=H;glassPlate.getContext('2d').drawImage(stage,0,0)}
 fade(1,'#ffffff');
 for(const shard of SHARDS){
  const {x,y,i,pts}=shard,dx=x-240,dy=y-134,dist=Math.hypot(dx,dy)||1,age=Math.max(0,t-hash(i,83)*.12),travel=age*age*190+age*45;
  c.save();c.globalAlpha=1-ease((age-.85)/.65);c.translate(x+dx/dist*travel,y+dy/dist*travel+age*age*43);c.rotate((hash(i,84)-.5)*age*3);c.scale(Math.max(.25,Math.cos(age*(1+hash(i,85)))),1);c.beginPath();pts.forEach(([xx,yy],j)=>j?c.lineTo(xx-x,yy-y):c.moveTo(xx-x,yy-y));c.closePath();c.clip();c.drawImage(glassPlate,-x,-y);c.restore();
 }
}
function palkiaTransition(t){
 if(t<6.3){forging(4.25);glassCracks(ease((t-4.25)/1.8));return{shot:2,phase:'cracks',white:0,shards:0}}
 if(t<8){shatteredGlass(t-6.3);return{shot:3,phase:'shatter',white:1,shards:SHARDS.length}}
 if(t<8.5){fade(1,'#ffffff');return{shot:3,phase:'white',white:1,shards:0}}
 if(t<11){const u=t-8.5; background('space.png',1+u*.02,-u*1.5,0);stars(u,cfg.color,1);const white=1-ease(u/2.5);fade(white,'#ffffff');return{shot:4,phase:'emergence',white,shards:0}}
 return{shot:spaceFilmV1(t),phase:t<19?'dimension':'omen',white:0,shards:0};
}
