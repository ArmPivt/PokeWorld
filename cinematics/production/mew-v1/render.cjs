const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const TIMES=[1.2,4.5,6.5,7.4,8.2,9,9.8,10.5,11.2,12.5,13.5,14.3,15.3,16.3,17.2,18.3,19.3,20.3,21.3,22.3,23.7,24.2,25.3,26.8,28.5,30.5];
(async()=>{
 const all=process.argv.includes('all'),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4198');await p.waitForFunction(()=>window.mewFilm);await p.evaluate(()=>mewFilm.ready);
  const info=await p.evaluate(()=>({duration:mewFilm.duration,cuts:mewFilm.cuts,cryAt:mewFilm.cryAt,revealAt:mewFilm.revealAt,paths:mewFilm.paths}));Object.assign(info,{species:151,fps:24,frames:768,width:960,height:540});
  const folder=path.join(__dirname,all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});
  const times=all?Array.from({length:768},(_,i)=>i/24):TIMES;
  for(let i=0;i<times.length;i++){
   const r=await p.evaluate(t=>({state:mewFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);
   assert.equal(r.state.species,151);assert.equal(r.state.dnaCollection,false);if(times[i]<24.35)assert.equal(r.state.mewVisible,false);
   fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(r.png,'base64'));
   if(all&&i%192===0)console.log(JSON.stringify({frame:i,shot:r.state.shot}));
  }
  info.visualChecks=await p.evaluate(()=>{
   function inspect(t){const state=mewFilm.render(t),a=document.querySelector('canvas').getContext('2d').getImageData(0,0,960,540).data;let sum=0;for(let i=0;i<a.length;i+=4)sum+=a[i]+a[i+1]+a[i+2];return{time:t,state,mean:sum/(960*540*3)}}
   return{island:inspect(4),floor:inspect(8),canopy:inspect(14),approach:inspect(21),reveal:inspect(28)};
  });
  for(const q of Object.values(info.visualChecks))assert(q.mean>20,'Each story shot must be painted and readable');
  assert(info.visualChecks.floor.state.shadowOnly);assert(info.visualChecks.canopy.state.shadowOnly);assert(info.visualChecks.approach.state.shadowOnly);assert(info.visualChecks.reveal.state.revealed.colorAlpha>.99);
  info.motionChecks=await p.evaluate(()=>{const q=[];for(let t=6.2;t<23.8;t+=1/24){const a=mewFilm.render(t),b=mewFilm.render(t+1/24);if(a.shot===b.shot&&a.shadow&&b.shadow)q.push(Math.hypot(a.shadow.x-b.shadow.x,a.shadow.y-b.shadow.y))}return{maxStep:Math.max(...q),meanStep:q.reduce((a,b)=>a+b,0)/q.length,frames:q.length}});
  assert(info.motionChecks.maxStep<15,'No teleports between consecutive pursuit frames');assert(info.motionChecks.meanStep>1,'The shadow actually travels through the jungle');assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+times.length+' frames; island, three moving shadow shots, clearing reveal and continuous travel passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
