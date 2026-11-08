const LAKES={480:{color:'#ffe7a1'},481:{color:'#ffc5e0'},482:{color:'#b5efff'}};let layouts;
function layout(id){
 const m=sprites[id].Idle,fs=Array.from({length:m.frames},(_,i)=>frameInfo(id,'Idle',0,m.durations.slice(0,i).reduce((a,b)=>a+b,0)+.001)),anchor={x:fs[0].cx,y:fs[0].bottom};let l=999,r=-999,top=999,b=-999;
 for(const f of fs){const a=f.canvas.getContext('2d').getImageData(0,0,m.w,m.h).data;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(a[(y*m.w+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x+1);top=Math.min(top,y);b=Math.max(b,y+1)}}
 const scale=Math.min((id>482?210:150)/(r-l),(id>482?157:110)/(b-top));return{anchor,scale,bounds:{left:240+(l-anchor.x)*scale,right:240+(r-anchor.x)*scale,top:190+(top-anchor.y)*scale,bottom:190+(b-anchor.y)*scale}};
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
 const cf=LAKES[id];c.save();camera(1+ease(t/2)*.03,240,140);background(cf.plate);if(id===480)snow(t,.3);ripples(t,170,cf.color,.2);
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
 for(const n of nodes){const color=LAKES[n.id].color,yy=n.y+Math.sin(t*1.6+n.id)*2;glow(n.x,yy-10,22,color,s*.45);spirit(n.id,t,n.x,yy,.88,s*.8,'#1b2035');lightBall(n.x,yy-12,2.1,'#ff8899',s);const pts=[];for(let k=0;k<=24;k++){const q=k/24;pts.push([mix(n.x,240,q),mix(yy-12,147,q)+Math.sin(q*6-t*3)*5])}line(pts,'#ff8d9e',1,s*.55)}
 const links=redChain(t,p);if(t>3){motes(t,'#ff9daa',.65);glow(240,147,73,'#f2859c',.3+Math.sin(t*4)**2*.15)}
 if(t<.25)fade(1-ease(t/.25));if(t>4.7)fade(ease((t-4.7)/.3),'#ffe7ef');return{links,ids:nodes.map(x=>x.id)};
}
