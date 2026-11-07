const ID=Number(new URLSearchParams(location.search).get('id'))||245;
const FILM_DURATION=30,CUTS=[0,2.5,7.5,8,13.5,14,20,22],REVEAL=21.25,CRY=23.1;
const CONFIG={243:{name:'Raikou',plate:'storm.png',color:'#ffeb97',ground:230,title:'Le Rugissement du tonnerre'},244:{name:'Entei',plate:'volcano.png',color:'#ffb16d',ground:230,title:'Le Souffle du volcan'},245:{name:'Suicune',plate:'lake.png',color:'#b5f6ff',ground:188,title:'Le Miroir de la nuit'}};
const cfg=CONFIG[ID];let beasts,heroLayout;
function makeLayout(){
 const mode=sprites[ID].Idle,frames=Array.from({length:mode.frames},(_,i)=>frameInfo(ID,'Idle',1,mode.durations.slice(0,i).reduce((a,b)=>a+b,0)+.001));
 const anchor={x:frames[0].cx,y:frames[0].bottom};let left=999,right=-999,top=999,bottom=-999;
 for(const f of frames){const a=f.canvas.getContext('2d').getImageData(0,0,mode.w,mode.h).data;for(let y=0;y<mode.h;y++)for(let x=0;x<mode.w;x++)if(a[(y*mode.w+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1)}}
 const scale=Math.min(142/(right-left),108/(bottom-top));return{anchor,scale,width:(right-left)*scale,height:(bottom-top)*scale,bounds:{left:240+(left-anchor.x)*scale,right:240+(right-anchor.x)*scale,top:cfg.ground+(top-anchor.y)*scale,bottom:cfg.ground+(bottom-anchor.y)*scale}};
}
function hero(t,x=240,y=cfg.ground,alpha=1,tint=null){
 const f=frameInfo(ID,'Idle',1,t*.8),s=heroLayout.scale;c.save();c.globalAlpha=alpha;
 if(tint){const mask=document.createElement('canvas');mask.width=f.mode.w;mask.height=f.mode.h;const m=mask.getContext('2d');m.drawImage(f.canvas,0,0);m.globalCompositeOperation='source-in';m.fillStyle=tint;m.fillRect(0,0,mask.width,mask.height);c.drawImage(mask,Math.round(x-heroLayout.anchor.x*s),Math.round(y-heroLayout.anchor.y*s),f.mode.w*s,f.mode.h*s)}
 else c.drawImage(f.canvas,Math.round(x-heroLayout.anchor.x*s),Math.round(y-heroLayout.anchor.y*s),f.mode.w*s,f.mode.h*s);c.restore();
}
function ripples(t,y=188,a=.4){
 for(let i=0;i<5;i++){const p=(t*.24+i*.2)%1,rx=15+p*90,ry=3+p*13;ellipse(240,y,rx,ry,'#80c7dd',a*(1-p)*.35);ellipse(240,y-1,Math.max(2,rx-3),Math.max(1,ry-1),'#163c70',a*(1-p)*.4)}
 for(let i=0;i<15;i++){const p=(t*.15+i*.13)%1,x=160+hash(i,6)*160;line([[x-7,p*72+y],[x+8,p*72+y]],'#6cc7e8',1,a*.2)}
}
function reflection(t,y=188,a=.55){
 c.save();c.beginPath();c.rect(145,y,190,Math.min(270-y,77));c.clip();c.translate(240,y);c.scale(1,-.52);hero(t,0,0,a,'#020b20');c.restore();
 for(let i=0;i<13;i++){const yy=y+4+i*4,dx=Math.sin(t*2+i*.7)*4;line([[161+dx,yy],[318+dx,yy]],'#15497e',1,a*.65)}
}
function motes(t,color,amount=1){for(let i=0;i<30;i++){const age=(hash(i,27)+t*.14)%1,x=150+hash(i,18)*190+Math.sin(t+i)*7,y=238-age*154;px(x,y,1+i%2,2,color,amount*Math.sin(age*Math.PI)*.55)}}
function lightning(t,at,a=1){
 const age=t-at,p=age>=0&&age<.34?Math.min(1,age/.025)*(1-ease((age-.025)/.315))*a:0;
 if(!p)return 0;fade(p*.33,'#e8e5ff');
 line([[355,0],[338,29],[351,37],[319,67],[330,72],[301,109]],'#faf4c8',3,p);line([[319,67],[344,81],[350,96]],'#e0d9ff',1,p);glow(256,134,113,'#e6deff',p*.9);return p;
}
function volcanoSmoke(t,power=1,clear=0){
 for(let layer=0;layer<3;layer++)for(let i=0;i<7;i++){
  const age=(t*.15+i*.177+layer*.13)%1,side=i%2?1:-1,x=240+side*(13+i*8+clear*128)+Math.sin(t*.6+i)*13,y=245-age*123-layer*12;
  cloud(x-59,y,118+age*53,44+age*25,layer===0?'#302533':layer===1?'#58404b':'#86605c',i+layer*8,power*(1-age)*(.6-layer*.11));
 }
}
function lakeScene(t){
 c.save();camera(1+ease(t/16)*.035,240,166);background(cfg.plate);
 const visible=ease((t-7.25)/1.05),shadow=ease((t-.65)/1.7)*(1-ease((t-6.4)/1.2));
 reflection(t,cfg.ground,visible>.01?.35:shadow*.82);ripples(t,cfg.ground,.15+shadow*.65+visible*.3);
 if(t>4.8){const p=ease((t-4.8)/2.6);glow(240,177,62,cfg.color,p*.3);for(let i=0;i<10;i++){const age=(t*.33+i*.1)%1,x=185+i*12;line([[x,191],[x+Math.sin(t+i)*5,191-age*74]],'#8ad4ed',1,p*(1-age)*.22)}}
 if(visible>0){glow(240,165,78,cfg.color,visible*.23);hero(t,240,cfg.ground,visible);motes(t,cfg.color,visible*.6)}
 // A low sheet of lake mist opens away from the creature as it materialises.
 const mist=(.12+shadow*.08)*(1-visible*.8);cloud(78-visible*50,177,148,10,'#8abbd5',1,mist);cloud(282+visible*50,183,152,9,'#bedce9',3,mist);
 if(t<.35)fade(1-ease(t/.35));const flash=Math.sin(Math.PI*clamp((t-6.9)/.55));if(t>=6.9&&t<7.45)fade(flash*.82,'#d9faff');c.restore();
 return{heroAlpha:visible,shadowAlpha:shadow,reflectionOnly:t<7.25,feetY:cfg.ground};
}
function stormScene(t){
 background(cfg.plate);fade(.28*(1-ease((t-7.25)/1.1)),'#100b24');rain(t+20,.38);
 const p=Math.max(lightning(t,2.2),lightning(t,4),lightning(t,5.5)),visible=ease((t-7.25)/.65);
 if(p>0&&visible===0)hero(t,240,cfg.ground,p,'#0b0a17');
 if(visible>0){const leap=1-ease((t-7.25)/.75),x=240+leap*40,y=cfg.ground-leap*32;ellipse(x,cfg.ground+1,57,6,'#100d21',visible*.45);hero(t,x,y,visible);motes(t,cfg.color,visible*.65)}
 for(let i=0;i<8;i++){const age=(t*.7+i*.125)%1,x=173+hash(i,7)*138;if(visible>.5)line([[x,231-age*68],[x+3,223-age*68],[x-2,217-age*68]],'#fce3a1',1,(1-age)*visible*.45)}
 if(t>=7.1&&t<7.55)fade(Math.sin(Math.PI*(t-7.1)/.45)*.9,'#fff0c8');if(t<.35)fade(1-ease(t/.35));
 return{heroAlpha:visible,shadowAlpha:p,reflectionOnly:false,feetY:cfg.ground};
}
function volcanoScene(t){
 background(cfg.plate);const visible=ease((t-7.25)/1.1),shadow=ease((t-2.4)/1.4)*(1-visible),clear=ease((t-6.5)/2.2);
 glow(240,176,102,'#ff9f54',.24+shadow*.37);ellipse(240,cfg.ground+2,58,6,'#1c1124',.5);
 if(shadow>.01)hero(t,240,cfg.ground,shadow*.94,'#160e1b');
 if(visible>0)hero(t,240,cfg.ground,visible);
 volcanoSmoke(t,1-clear*.6,clear);motes(t,'#ffb760',.45+visible*.45);
 if(t>=7.05&&t<7.55)fade(Math.sin(Math.PI*(t-7.05)/.5)*.65,'#ffcf97');if(t<.35)fade(1-ease(t/.35));
 return{heroAlpha:visible,shadowAlpha:shadow,reflectionOnly:false,feetY:cfg.ground,smokeClear:clear};
}
function render(time){
 const t=clamp(time,0,29.9999);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,storm=null,res=null,personal=null;
 if(t<2.5){shot=1;calmFire(t)}else if(t<7.5){shot=2;storm=stormSummon(t-2.5)}else if(t<8){shot=3;fade(1)}else if(t<13.5){shot=4;res=resurrection(t-8)}else if(t<14){shot=5;fade(1)}else{shot=t<20?6:t<22?7:8;personal=(ID===245?lakeScene:ID===243?stormScene:volcanoScene)(t-14)}
 if(t<.4)fade(1-ease(t/.4));if(t>29.4)fade(ease((t-29.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:ID,shot,blackTransition:shot===3||shot===5,beastIds:res&&res.appear>.01?beasts.map(b=>b.id):[],rainbow:res?.arc||0,stormStrength:storm?.storm||0,lugiaSilhouette:!!storm?.silhouetteVisible,heroVisible:(personal?.heroAlpha||0)>.01,personal,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{[sprites,beasts]=await Promise.all(['sprites.json','beasts.json'].map(async src=>(await fetch(src)).json()));await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['calm.png','ruins.png','lake.png','storm.png','volcano.png'].map(load));heroLayout=makeLayout();document.title=cfg.name+' — '+cfg.title;document.querySelector('#status').hidden=true;render(1.2)})();
window.beastFilm={ready,render,duration:FILM_DURATION,cuts:CUTS,cryAt:CRY,revealAt:REVEAL,id:ID,config:cfg,layout:()=>heroLayout};await ready;
