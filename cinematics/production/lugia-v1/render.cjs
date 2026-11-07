const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const TIMES=[1.2,2.3,2.9,3.3,3.9,4.7,5.6,6.7,7.35,7.75,8.5,9.2,10.7,12.3,13.6,15.2,16.6,17.6,18.4,19.3,20.4,21.4,22.4,24,26.5,28.6];
(async()=>{
 const all=process.argv.includes('all'),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4202');await p.waitForFunction(()=>window.lugiaFilm);await p.evaluate(()=>lugiaFilm.ready);
  const info=await p.evaluate(()=>({duration:lugiaFilm.duration,cuts:lugiaFilm.cuts,stormAt:lugiaFilm.stormAt,cryAt:lugiaFilm.cryAt,revealAt:lugiaFilm.revealAt,women:lugiaFilm.women,layout:lugiaFilm.layout()}));Object.assign(info,{species:249,fps:24,frames:720,width:960,height:540});
  const folder=path.join(__dirname,all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});const times=all?Array.from({length:720},(_,i)=>i/24):TIMES;
  for(let i=0;i<times.length;i++){
   const r=await p.evaluate(t=>({state:lugiaFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);assert.equal(r.state.species,249);
   if(times[i]<3.6)assert.equal(r.state.stormStrength,0,'Clear weather until Lugia casts the storm');
   if(times[i]<18.25)assert.equal(r.state.finalLugiaVisible,false);
   if(times[i]>=8&&times[i]<13||times[i]>=21)assert.equal(r.state.dancers,5);
   fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(r.png,'base64'));
   if(all&&i%240===0)console.log(JSON.stringify({frame:i,shot:r.state.shot}));
  }
  info.visualChecks=await p.evaluate(times=>times.map(t=>{const state=lugiaFilm.render(t),d=document.querySelector('canvas').getContext('2d').getImageData(0,0,960,540).data;let sum=0;for(let i=0;i<d.length;i+=4)sum+=d[i]+d[i+1]+d[i+2];return{time:t,state,mean:sum/(960*540*3)}}),TIMES);
  for(const q of info.visualChecks)assert(q.state.blackTransition?q.mean===0:q.mean>8);assert.equal(new Set(info.visualChecks.map(x=>x.state.shot)).size,7);
  const before=info.visualChecks.find(x=>x.time===3.3),after=info.visualChecks.find(x=>x.time===4.7);assert(before.state.introLugiaVisible);assert.equal(before.state.stormStrength,0);assert(after.state.introLugiaVisible&&after.state.stormStrength>.5);
  info.bodyBounds=await p.evaluate(()=>{
   const result=[],layout=lugiaFilm.layout(),scale=layout.scale;
   for(let t=23.5;t<29.4;t+=1/24){const s=lugiaFilm.render(t),f=lugiaFilm.spriteFrame(t),d=f.canvas.getContext('2d').getImageData(0,0,f.mode.w,f.mode.h).data;let minX=999,maxX=0,minY=999,maxY=0;
    for(let y=0;y<f.mode.h;y++)for(let x=0;x<f.mode.w;x++)if(d[(y*f.mode.w+x)*4+3]>32){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
    result.push({left:s.reveal.bird.x+(minX-layout.anchor.x)*scale,right:s.reveal.bird.x+(maxX+1-layout.anchor.x)*scale,top:s.reveal.bird.y+(minY-layout.anchor.y)*scale,bottom:s.reveal.bird.y+(maxY+1-layout.anchor.y)*scale});
   }
   return{left:Math.min(...result.map(x=>x.left)),right:Math.max(...result.map(x=>x.right)),top:Math.min(...result.map(x=>x.top)),bottom:Math.max(...result.map(x=>x.bottom)),frames:result.length};
  });assert(info.bodyBounds.left>8&&info.bodyBounds.right<472&&info.bodyBounds.top>8&&info.bodyBounds.bottom<176,JSON.stringify(info.bodyBounds));assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+times.length+' frames; clear opening, Lugia causes the storm, black transition, five dancers, waterfall reveal and complete wing framing passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
