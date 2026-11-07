const ID=Number(new URLSearchParams(location.search).get('id'))||480;
const FILM_DURATION=30,CUTS=[0,2,4,6,11,16,21],REVEAL=21.2,CRY=22.7;
const CFG={480:{name:'Créhelf',lake:'Lac Savoir',plate:'acuity.png',cave:'acuity-cave.png',color:'#ffe7a1',dark:'#27283f',title:'Les Liens du savoir'},481:{name:'Créfollet',lake:'Lac Vérité',plate:'verity.png',cave:'verity-cave.png',color:'#ffc5e0',dark:'#302238',title:'Le Reflet de l’émotion'},482:{name:'Créfadet',lake:'Lac Courage',plate:'valor.png',cave:'valor-cave.png',color:'#b5efff',dark:'#14283e',title:'La Force de la volonté'}};
const cfg=CFG[ID];let layouts;
function layout(id){
 const m=sprites[id].Idle,fs=Array.from({length:m.frames},(_,i)=>frameInfo(id,'Idle',0,m.durations.slice(0,i).reduce((a,b)=>a+b,0)+.001)),anchor={x:fs[0].cx,y:fs[0].bottom};let l=999,r=-999,top=999,b=-999;
 for(const f of fs){const a=f.canvas.getContext('2d').getImageData(0,0,m.w,m.h).data;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(a[(y*m.w+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x+1);top=Math.min(top,y);b=Math.max(b,y+1)}}
 const scale=Math.min(150/(r-l),110/(b-top));return{anchor,scale,bounds:{left:240+(l-anchor.x)*scale,right:240+(r-anchor.x)*scale,top:190+(top-anchor.y)*scale,bottom:190+(b-anchor.y)*scale}};
}
function spirit(id,t,x,y,scale,alpha=1,tint=null){
 const f=frameInfo(id,'Idle',0,t*.8),anchor=layouts[id].anchor;c.save();c.globalAlpha=alpha;
 if(tint){const mask=document.createElement('canvas');mask.width=f.mode.w;mask.height=f.mode.h;const m=mask.getContext('2d');m.drawImage(f.canvas,0,0);m.globalCompositeOperation='source-in';m.fillStyle=tint;m.fillRect(0,0,mask.width,mask.height);c.drawImage(mask,Math.round(x-anchor.x*scale),Math.round(y-anchor.y*scale),f.mode.w*scale,f.mode.h*scale)}
 else c.drawImage(f.canvas,Math.round(x-anchor.x*scale),Math.round(y-anchor.y*scale),f.mode.w*scale,f.mode.h*scale);c.restore();
}
function snow(t,a=.4){for(let i=0;i<36;i++){const x=(hash(i,41)*480+Math.sin(t*.5+i)*4),y=(hash(i,42)*270+t*17)%270;px(x,y,1+i%2,1+i%2,'#def6ff',a*.65)}}
function ripples(t,y=207,color='#93bdd8',amount=.5){for(let i=0;i<4;i++){const p=(t*.23+i*.25)%1,pts=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*2;pts.push([240+Math.cos(a)*(12+p*83),y+Math.sin(a)*(3+p*14)])}line(pts,color,1,amount*(1-p)*.7)}}
function motes(t,color,a=.5){for(let i=0;i<24;i++){const age=(hash(i,10)+t*.14)%1,x=146+hash(i,11)*188+Math.sin(t+i)*5,y=233-age*140;spark(x,y,1+i%2,color,Math.sin(age*Math.PI)*a*.5)}}
function lightBall(x,y,r,color,a=1){glow(x,y,r*2,color,a);ellipse(x,y,r,r,color,a*.6);ellipse(x,y,r*.36,r*.36,'#fff5e7',a*.9)}
function lakeIntro(t,id){
 const cf=CFG[id];c.save();camera(1+ease(t/2)*.03,240,140);background(cf.plate);if(id===480)snow(t,.3);ripples(t,170,cf.color,.2);
 const p=ease((t-.35)/1.3),x=240+Math.sin(t*1.7)*7,y=134-p*46;lightBall(x,y,3+p*2,cf.color,p*.9);for(let i=0;i<12;i++){const q=i/12;px(x-Math.sin(q*2+t)*4,y+q*25,1,2,cf.color,p*(1-q)*.5)}c.restore();
 if(t<.15)fade(1-ease(t/.15));if(t>1.82)fade(ease((t-1.82)/.18));
}
function chainLink(x,y,angle,edge,alpha=1,scale=1){
 c.save();c.translate(Math.round(x),Math.round(y));c.rotate(angle);c.scale(scale,scale);const pts=edge?[[-1,-4],[1,-4],[2,-2],[2,2],[1,4],[-1,4],[-2,2],[-2,-2],[-1,-4]]:[[-4,-3],[4,-3],[6,-1],[6,1],[4,3],[-4,3],[-6,1],[-6,-1],[-4,-3]];
 line(pts,'#541b32',3.5,alpha);line(pts,'#f45d74',1.8,alpha);line(edge?[[-1,-3],[1,-3],[1,0]]:[[-4,-3],[3,-3],[5,-1]],'#ffc4b8',1,alpha*.9);c.restore();
}
function redChain(t,progress=1,x=240,y=147,rx=82,ry=29,alpha=1,scale=1){
 const links=[];for(let i=0;i<42;i++){const a=i/42*Math.PI*2+t*.15;links.push({i,a,x:x+Math.cos(a)*rx,y:y+Math.sin(a)*ry})}links.sort((a,b)=>a.y-b.y);
 for(const p of links){const appear=ease((progress-p.i/42)*12);if(!appear)continue;chainLink(p.x,p.y,Math.atan2(Math.cos(p.a)*ry,-Math.sin(p.a)*rx),p.i%2,alpha*appear,scale)}
 return Math.min(42,Math.ceil(progress*42));
}
function forging(t){
 background('pillar.png');const p=ease((t-.4)/2.4),s=ease((t-.2)/1.1);glow(240,151,95,'#ef6b91',p*.45);
 const nodes=[{id:480,x:167,y:120},{id:481,x:240,y:88},{id:482,x:313,y:120}];
 for(const n of nodes){const color=CFG[n.id].color,yy=n.y+Math.sin(t*1.6+n.id)*2;glow(n.x,yy-10,22,color,s*.45);spirit(n.id,t,n.x,yy,.88,s*.8,'#1b2035');lightBall(n.x,yy-12,2.1,'#ff8899',s);const pts=[];for(let k=0;k<=24;k++){const q=k/24;pts.push([mix(n.x,240,q),mix(yy-12,147,q)+Math.sin(q*6-t*3)*5])}line(pts,'#ff8d9e',1,s*.55)}
 const links=redChain(t,p);if(t>3){motes(t,'#ff9daa',.65);glow(240,147,73,'#f2859c',.3+Math.sin(t*4)**2*.15)}
 if(t<.25)fade(1-ease(t/.25));if(t>4.7)fade(ease((t-4.7)/.3),'#ffe7ef');return{links,ids:nodes.map(x=>x.id)};
}
function approach(t){
 c.save();camera(1+ease(t/5)*.7,240,137);background(cfg.plate);const p=ease(t/2);glow(240,137,22,cfg.color,p*.35);redChain(t,p,240,143,31,12,(1-ease((t-2.6)/2.1))*.5,.55);ripples(t,157,cfg.color,.35);if(ID===480)snow(t,.2);c.restore();if(t<.3)fade(1-ease(t/.3),'#ffe7ef');
}
function knowledge(t,power=1){
 for(let i=0;i<10;i++){const a=i*Math.PI*.2+t*.35,x=240+Math.cos(a)*63,y=142+Math.sin(a)*34;const variant=i%3;if(variant===0)line([[x,y-4],[x+4,y],[x,y+4],[x-4,y],[x,y-4]],'#ffe3a4',1,power*.7);else if(variant===1){line([[x-3,y-3],[x+3,y-3],[x+3,y+3],[x-3,y+3],[x-3,y-3]],'#ffe3a4',1,power*.7);px(x,y,1,1,'#fff4d5',power)}else{line([[x-3,y],[x+3,y]],'#ffe3a4',1,power*.7);line([[x,y-3],[x,y+3]],'#ffe3a4',1,power*.7)}}
}
function emotion(t,power=1){
 const pulse=.55+Math.sin(t*3.5)**4*.45;glow(240,172,65,'#f8a3cc',power*pulse*.4);
 for(let i=0;i<3;i++){const age=(t*.34+i/3)%1,r=6+age*10,pts=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*2;pts.push([240+Math.pow(Math.sin(a),3)*r*3,204-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*r*.32])}line(pts,'#ffc5df',1,power*(1-age)*.55)}
}
function currents(t,power=.5){
 for(let i=0;i<12;i++){const x=(i*47-t*54+960)%560-40,y=172+i%4*20;const pts=[];for(let k=0;k<12;k++)pts.push([x+k*4,y-Math.sin(k*.3+t*2+i)*3]);line(pts,i%3?'#6bbbe4':'#d1f8ff',1,power*.4)}
}
function mystery(t){
 background(cfg.cave);fade(.32,'#11192d');const p=ease((t-.3)/1.5);glow(240,146,73,cfg.color,p*.42);spirit(ID,t,240,185,layouts[ID].scale*.85,p*.73,cfg.dark);
 if(ID===480){knowledge(t,p);for(let i=0;i<4;i++)ripples(t+i,202,cfg.color,p*.2)}
 else if(ID===481){emotion(t,p);c.save();c.translate(240,204);c.scale(1,-.45);spirit(ID,t,0,0,layouts[ID].scale*.8,p*.4,'#401c45');c.restore();motes(t,cfg.color,p*.5)}
 else{currents(t,.8);const beam=ease((t-.4)/1.7)*(1-ease((t-4)/.8));glow(240,146,34,'#87dfff',beam*.8);line([[240,222],[240,81]],'#55beed',8,beam*.5);line([[240,222],[240,81]],'#d5fbff',2,beam*.8);for(let i=0;i<12;i++){const age=(t*.6+i*.08)%1;px(218+hash(i,5)*44,216-age*137,1,5,'#c0f4ff',beam*(1-age)*.8)}}
 ripples(t,207,cfg.color,p*.45);if(t<.3)fade(1-ease(t/.3));if(t>4.6)fade(ease((t-4.6)/.4),cfg.color);return{shadow:p>.01};
}
function revelation(t){
 background(cfg.cave);const a=ease((t-.2)/.7),entry=1-ease(t/1.2),x=240+Math.sin(t*1.1)*5+(ID===482?entry*24:0),y=190+Math.sin(t*1.6)*2.5-entry*12;glow(x,y-45,73,cfg.color,a*.35);ripples(t,214,cfg.color,.4);spirit(ID,t,x,y,layouts[ID].scale,a);motes(t,cfg.color,a*.65);
 if(ID===480){knowledge(t+8,a*.28)}else if(ID===481)emotion(t+8,a*.35);else currents(t+8,.5);
 if(t<.7)fade(1-ease(t/.7),cfg.color);return{alpha:a,x,y};
}
function render(time){
 const t=clamp(time,0,29.9999);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);let shot,forge=null,shadow=null,reveal=null;
 if(t<2){shot=1;lakeIntro(t,480)}else if(t<4){shot=2;lakeIntro(t-2,481)}else if(t<6){shot=3;lakeIntro(t-4,482)}else if(t<11){shot=4;forge=forging(t-6)}else if(t<16){shot=5;approach(t-11)}else if(t<21){shot=6;shadow=mystery(t-16)}else{shot=7;reveal=revelation(t-21)}
 if(t<.35)fade(1-ease(t/.35));if(t>29.4)fade(ease((t-29.4)/.6));out.imageSmoothingEnabled=false;out.clearRect(0,0,output.width,output.height);out.drawImage(stage,0,0,output.width,output.height);
 return{time:t,species:ID,shot,chainLinks:forge?.links||0,trioIds:forge?.ids||[],ownLake:t>=11?cfg.lake:null,location:t>=16?cfg.cave:t>=11?cfg.plate:null,insideCave:t>=16,shadowVisible:!!shadow?.shadow,heroVisible:!!reveal&&reveal.alpha>.01,reveal,cryAt:CRY,revealAt:REVEAL};
}
const ready=(async()=>{sprites=await(await fetch('sprites.json')).json();await Promise.all([...new Set(Object.values(sprites).flatMap(m=>Object.values(m).map(a=>a.src)))].map(load));await Promise.all(['acuity.png','verity.png','valor.png','pillar.png','acuity-cave.png','verity-cave.png','valor-cave.png'].map(load));layouts=Object.fromEntries([480,481,482].map(id=>[id,layout(id)]));document.title=cfg.name+' — '+cfg.title;document.querySelector('#status').hidden=true;render(1.2)})();
window.lakeFilm={ready,render,duration:FILM_DURATION,cuts:CUTS,id:ID,config:cfg,layout:()=>layouts[ID],cryAt:CRY,revealAt:REVEAL};await ready;
