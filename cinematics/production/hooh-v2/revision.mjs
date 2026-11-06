let beasts;
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
function render(time){
 const t=clamp(time,0,FILM_DURATION-.0001);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,poses=[],reveal=null,resurrectionState=null;
 if(t<3.5){shot=1;burning(t*1.4);if(t>3.15)fade(ease((t-3.15)/.35))}
 else if(t<4){shot=2;fade(1)}
 else if(t<9.5){shot=3;resurrectionState=resurrection(t-4)}
 else if(t<10){shot=4;fade(1)}
 else if(t<15){shot=5;poses=ritual(t-10);if(t<10.25)fade(1-ease((t-10)/.25))}
 else if(t<21){shot=6;skyArrival(t-15)}
 else{shot=7;reveal=revelation(t-21);poses=reveal.poses}
 if(t<.45)fade(1-ease(t/.45));if(t>29.4)fade(ease((t-29.4)/.6));
 out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:250,shot,blackTransition:shot===2||shot===4,fireStrength:t<3.5?.75+ease(t/5)*.4:0,rainbowProgress:resurrectionState?.arc||0,lightStrength:resurrectionState?.light||0,beastIds:resurrectionState&&resurrectionState.appear>.01?beasts.map(b=>b.id):[],beastOpacity:resurrectionState?.appear||0,dancers:poses.length,poses,reveal,hoohVisible:!!reveal&&reveal.alpha>.01,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{
 [sprites,dancers,birdLayout,beasts]=await Promise.all(['sprites.json','dancers.json','bird-layout.json','beasts.json'].map(async src=>(await fetch(src)).json()));
 await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['tower.png','ruins.png','terrace.png','sky.png','dancers.png'].map(load));document.querySelector('#status').hidden=true;render(1.2);
})();
window.hoohFilm={ready,duration:FILM_DURATION,render,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,bellTimes:[11.6,14.1,21.1,25.2],women:WOMEN,beasts:()=>beasts,layout:()=>birdLayout,spriteFrame:t=>frameInfo(250,'Walk',0,(t-21)*.73)};await ready;
