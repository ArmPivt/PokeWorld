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

const RAINBOW=['#ed767b','#f6ad65','#f6dd85','#94d799','#73c6df','#8389d6','#b493d9'];
function rainbow(progress,alpha=1){
 if(progress<=0)return;
 for(let band=0;band<7;band++){
  const rx=222-band*3,ry=116-band*3,pts=[],steps=Math.max(2,Math.round(progress*180));
  for(let i=0;i<=steps;i++){const a=Math.PI-Math.PI*progress*i/steps;pts.push([240+Math.cos(a)*rx,151-Math.sin(a)*ry])}
  line(pts,RAINBOW[band],3.1,alpha*.68);
 }
}
function resurrection(t){
 c.save();camera(1.015+ease(t/5.5)*.025,240,180);background('ruins.png');
 const arc=ease((t-.3)/2.6),light=ease((t-.7)/1.7),appear=ease((t-1.6)/.65);
 rainbow(arc,.98);
 // Dense light stays behind the three opaque silhouettes, making each outline
 // readable while the rest of the burnt tower remains visible around the beam.
 polygon([[224,66],[256,66],[365,246],[115,246]],'#ffe4a5',light*.2);
 polygon([[232,72],[248,72],[333,243],[147,243]],'#fff8d9',light*.23);
 for(let i=0;i<7;i++)polygon([[196+i*12,77],[207+i*12,77],[330+i*8,245],[139+i*7,245]],RAINBOW[i],light*.05);
 glow(240,192,110,'#ffe9ab',light*.65);
 ellipse(240,200,99,49,'#fff4d4',light*.19);ellipse(240,227,116,13,'#fff1c1',light*.3);
 for(let i=0;i<18;i++){const x=137+hash(i,37)*207,y=124+((hash(i,38)*110-t*12+400)%110);px(x,y,1,4,'#fff6d4',light*.2)}
 for(const b of beasts){
  ellipse(b.x,237,25,3,'#1d1a2b',appear*.35);
  mon(b.id,'Idle',b.dir,b.x,b.y,b.scale,t*.55,{tint:'#100f19',alpha:appear});
 }
 c.restore();if(t<.25)fade(1-ease(t/.25));if(t>5.2)fade(ease((t-5.2)/.3));
 return{arc,light,appear};
}
