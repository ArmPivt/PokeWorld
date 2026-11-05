import {flame,loadImage} from './art.mjs';
import {trainerSrc} from './player-profile.mjs';
const cache=new Map(),TAU=Math.PI*2,noise=(x,y=0)=>{let n=Math.imul(x+19,374761393)^Math.imul(y+7,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function ring(c,x,y,rx,ry,color,width=1){for(let py=-Math.ceil(ry);py<=ry;py++){const q=Math.sqrt(Math.max(0,1-py*py/(ry*ry))),xx=rx*q,inside=Math.max(0,(rx-width)*Math.sqrt(Math.max(0,1-py*py/((ry-width)*(ry-width)))));rect(c,x-xx,y+py,Math.max(1,xx-inside),1,color);rect(c,x+inside,y+py,Math.max(1,xx-inside),1,color)}}
export function arenaGeometry(w,h,positions){const boss=positions?.boss||{x:w/2,y:h*.43},allies=positions?Object.entries(positions).filter(([k,v])=>k!=='boss'&&v&&typeof v==='object'&&Number.isFinite(v.y)).map(([,v])=>v):[{x:w/2,y:h*.72}],allyY=Math.max(...allies.map(a=>a.y));return{left:Math.max(24,w*.095),right:w-Math.max(24,w*.095),top:Math.max(65,boss.y-42),bottom:Math.min(h-12,allyY+33),boss,allies}}
function make(w,h,theme,g){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),night=theme==='moon',den=theme==='cavern',pal=den?['#14212e','#243442','#3e5060','#75818e']:night?['#172a3d','#304559','#47667a','#829d9d']:['#243e4b','#3e5d67','#62838a','#b0c0af'];rect(x,0,0,w,h,pal[0]);
 // Stepped stone masonry and arches enclose the stadium.
 for(let y=0;y<h;y+=12)for(let xx=-16;xx<w;xx+=24){const off=y%24?12:0;rect(x,xx+off,y,23,11,pal[1]);rect(x,xx+off+1,y+1,21,2,pal[2]);if(noise(xx,y)>.7)rect(x,xx+off+5,y+6,9,1,pal[0])}
 const rear=g.top-16;rect(x,12,22,w-24,Math.max(24,rear-22),pal[0]);
 // Three rows of benches, aisles and individually drawn spectators.
 for(let row=0;row<3;row++){const yy=rear-17-row*13;rect(x,18,yy+7,w-36,4,den?'#36475a':'#4b5555');rect(x,18,yy+7,w-36,1,pal[3]);if(!den)for(let xx=22;xx<w-20;xx+=8){if(Math.abs(xx-w/2)<24||Math.abs(xx-w*.2)<7||Math.abs(xx-w*.8)<7)continue;const seed=Math.floor(noise(xx,row)*7),shirt=['#a57667','#64859a','#8e9c76','#b1a47b','#6b728f','#9e7a99','#60978d'][seed];rect(x,xx,yy,4,6,shirt);rect(x,xx+1,yy-3,3,3,['#dbc1a0','#b3977b','#8c7564'][seed%3]);rect(x,xx,yy+6,2,2,'#1b2b39');rect(x,xx+3,yy+6,2,2,'#1b2b39')}}
 rect(x,w/2-24,rear-40,48,45,pal[2]);rect(x,w/2-19,rear-35,38,40,pal[0]);for(let i=0;i<6;i++)rect(x,w/2-17+i*6,rear-31,2,34,pal[1]);rect(x,w/2-27,rear-42,54,4,pal[3]);
 const left=g.left,right=g.right,top=g.top,bottom=Math.max(top+74,g.bottom),fw=right-left,fh=bottom-top;
 rect(x,left-12,top-7,fw+24,fh+20,'#152a35');rect(x,left-10,top-5,fw+20,fh+16,pal[3]);rect(x,left-7,top-3,fw+14,fh+10,'#525e60');
 for(let yy=top;yy<bottom;yy+=7)for(let xx=left;xx<right;xx+=7){const colors=den?['#43525b','#4c5b64','#53616b']:night?['#425f62','#4c6e6b','#57756d']:['#487554','#4e7f58','#58865b'];rect(x,xx,yy,Math.min(7,right-xx),Math.min(7,bottom-yy),colors[Math.floor(noise(xx,yy)*3)]);if(noise(xx+91,yy)>.76)rect(x,xx+1,yy+2,2,1,den?'#6b7a7f':'#6c9465')}
 // White battle court, center mark, deployment ends and inset stone tiles.
 const ink=den?'#96a6a3':'#d1d7ad',mid=(top+bottom)/2;for(let xx=left+8;xx<right-8;xx++){if(noise(xx,9)>.08){rect(x,xx,top+8,1,1,ink);rect(x,xx,bottom-8,1,1,ink)}}for(let yy=top+8;yy<bottom-7;yy++){rect(x,left+8,yy,1,1,ink);rect(x,right-9,yy,1,1,ink)}
 for(let xx=left+9;xx<right-8;xx+=4)rect(x,xx,mid,3,1,ink);const r=Math.min(fw*.12,fh*.28);ring(x,w/2,mid,r,r*.62,ink,2);ring(x,w/2,mid,5,3.4,ink,2);rect(x,w/2-r,mid,r*2,1,ink);rect(x,w/2-3,mid-2,6,4,den?'#43525b':'#55815b');
 for(const yy of[top+3,bottom-3]){rect(x,left+fw*.18,yy-2,fw*.64,4,'#bfc7ac');rect(x,left+fw*.18+2,yy-1,fw*.64-4,2,'#6f7a6a')}
 for(const [xx,yy]of[[left-17,top-4],[right+9,top-4],[left-17,bottom-14],[right+9,bottom-14]]){rect(x,xx,yy,10,28,pal[0]);rect(x,xx-2,yy-2,14,5,pal[3]);rect(x,xx+2,yy+3,5,18,pal[2]);rect(x,xx-2,yy+23,14,4,pal[3])}
 // Banner cloth, lighting gantries and trainer entrance stairs.
 for(const xx of[w*.22,w*.78]){rect(x,xx-1,20,2,42,pal[3]);rect(x,xx+1,23,18,25,xx<w/2?'#885c4a':'#426d8d');rect(x,xx+3,25,14,2,'#c4b087');ring(x,xx+10,35,5,5,'#d5c9a7');rect(x,xx+4,35,12,1,'#d5c9a7')}
 for(const xx of[25,w-36]){rect(x,xx+4,15,3,rear-20,pal[3]);rect(x,xx-7,13,27,9,pal[0]);for(let i=0;i<5;i++)rect(x,xx-5+i*5,15,3,4,den?'#8ac5c3':'#e9dfaa')}
 for(let i=0;i<4;i++)rect(x,left-24-i*2,bottom+9+i*3,48+i*4,3,i%2?pal[2]:pal[1]);return c;
}
export function drawClassicArena(c,w,h,theme='garden',time=0,{weather='',reducedMotion=false,positions,playerAvatar,enemyAvatar}={}){const g=arenaGeometry(w,h,positions),key=[w,h,theme,Math.round(g.top),Math.round(g.bottom)].join(':');let base=cache.get(key);if(!base){base=make(w,h,theme,g);if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(key,base)}c.imageSmoothingEnabled=false;c.drawImage(base,0,0);const den=theme==='cavern';
 if(den){for(const xx of[g.left-12,g.right+13]){flame(c,xx,g.top+10,7,reducedMotion?0:time,'#75c9cf');flame(c,xx,g.bottom+4,6,reducedMotion?0:time+.4,'#8ba7df')}}else if(!reducedMotion){for(let i=0;i<11;i++){const xx=20+noise(i,13)*(w-40),yy=g.top-32-(i%3)*13;c.fillStyle=i%2?'#d0c2a0':'#86a8ab';c.fillRect(xx,yy+Math.sin(time*2+i)*1.3,2,3)}}
 if(playerAvatar){const im=loadImage(trainerSrc(playerAvatar));if(im.complete&&im.naturalWidth)c.drawImage(im,g.left-21,g.bottom-38,30,38)}if(enemyAvatar&&!den){const im=loadImage(trainerSrc(enemyAvatar));if(im.complete&&im.naturalWidth)c.drawImage(im,g.right-12,g.top-40,27,34)}
 if(weather){c.save();c.globalAlpha=.12;c.fillStyle=weather==='sun'?'#ffcd68':weather==='rain'?'#123c67':weather==='sand'?'#c29968':'#d4eef1';c.fillRect(0,0,w,h);if(!reducedMotion){for(let i=0;i<45;i++){const xx=(noise(i,52)*w+time*(weather==='sand'?23:5))%w,yy=(noise(i,82)*h+time*(weather==='rain'?125:20))%h;rect(c,xx,yy,weather==='rain'?1:2,weather==='rain'?6:1,weather==='rain'?'#9ab6cc':'#dccca7')}}c.restore()}
}
