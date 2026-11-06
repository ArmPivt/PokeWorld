const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const TIMES=[1.2,2.8,3.35,3.75,4.4,5.3,6.2,7.3,8.7,9.35,9.75,10.4,11.6,12.8,14.4,15.8,17.7,19.5,20.7,21.4,22.3,23.2,25,27,28.8];
(async()=>{
 const all=process.argv.includes('all'),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4201');await p.waitForFunction(()=>window.hoohFilm);await p.evaluate(()=>hoohFilm.ready);
  const info=await p.evaluate(()=>({duration:hoohFilm.duration,cuts:hoohFilm.cuts,cryAt:hoohFilm.cryAt,revealAt:hoohFilm.revealAt,bellTimes:hoohFilm.bellTimes,women:hoohFilm.women,beasts:hoohFilm.beasts(),layout:hoohFilm.layout()}));Object.assign(info,{species:250,fps:24,frames:720,width:960,height:540});
  const folder=path.join(__dirname,all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});const times=all?Array.from({length:720},(_,i)=>i/24):TIMES;
  for(let i=0;i<times.length;i++){
   const r=await p.evaluate(t=>({state:hoohFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);assert.equal(r.state.species,250);
   if(times[i]<21.2)assert.equal(r.state.hoohVisible,false);
   if(r.state.rainbowProgress>0)assert.equal(r.state.fireStrength,0);
   if(times[i]>=10&&times[i]<15||times[i]>=21)assert.equal(r.state.dancers,5);
   fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(r.png,'base64'));
   if(all&&i%240===0)console.log(JSON.stringify({frame:i,shot:r.state.shot}));
  }
  info.visualChecks=await p.evaluate(times=>times.map(t=>{const state=hoohFilm.render(t),d=document.querySelector('canvas').getContext('2d').getImageData(0,0,960,540).data;let sum=0;for(let i=0;i<d.length;i+=4)sum+=d[i]+d[i+1]+d[i+2];return{time:t,state,mean:sum/(960*540*3)}}),TIMES);
  for(const q of info.visualChecks)assert(q.state.blackTransition?q.mean===0:q.mean>5);assert.equal(new Set(info.visualChecks.map(x=>x.state.shot)).size,7);
  info.silhouetteChecks=await p.evaluate(()=>{
   const state=hoohFilm.render(7.5),ctx=document.querySelector('canvas').getContext('2d'),d=ctx.getImageData(0,0,960,540).data;
   return{state,regions:hoohFilm.beasts().map(b=>{let dark=0;for(let y=356;y<480;y++)for(let x=Math.round((b.x-29)*2);x<Math.round((b.x+29)*2);x++){const i=(y*960+x)*4;if(d[i]<28&&d[i+1]<28&&d[i+2]<36)dark++}return{id:b.id,darkPixels:dark}})};
  });assert.deepEqual(info.silhouetteChecks.state.beastIds,[243,244,245]);assert(info.silhouetteChecks.regions.every(r=>r.darkPixels>180));assert(info.silhouetteChecks.state.lightStrength>.99);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+times.length+' frames; 30s cut, two pure-black transitions, three dark beast silhouettes, dense light and 5s dance passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
