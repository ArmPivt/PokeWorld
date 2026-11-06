const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const all=process.argv.includes('all'),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4197');await p.waitForFunction(()=>window.mewtwoFilm);await p.evaluate(()=>mewtwoFilm.ready);
  const info=await p.evaluate(()=>({duration:mewtwoFilm.duration,cuts:mewtwoFilm.cuts,cryAt:mewtwoFilm.cryAt,explosionAt:mewtwoFilm.explosionAt,revealAt:mewtwoFilm.revealAt,cast:mewtwoFilm.cast}));Object.assign(info,{species:150,fps:24,frames:960,width:960,height:540});
  const folder=path.join(__dirname,all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});
  const times=all?Array.from({length:960},(_,i)=>i/24):[1.2,4.5,6.7,8.2,9.6,10.8,12.7,15.4,18.1,19.8,21.3,22.7,24.3,25.55,26.7,29.3,31.3,32.2,32.5,33.35,34.05,34.6,35.3,37.3,39];
  for(let i=0;i<times.length;i++){
   const r=await p.evaluate(t=>({state:mewtwoFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);
   assert.equal(r.state.species,150);if(times[i]<34.28)assert.equal(r.state.mewtwoVisible,false);
   fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(r.png,'base64'));
   if(all&&i%192===0)console.log(JSON.stringify({frame:i,shot:r.state.shot}));
  }
  info.visualChecks=await p.evaluate(()=>{
   function inspect(t){const state=mewtwoFilm.render(t),a=document.querySelector('canvas').getContext('2d').getImageData(0,0,960,540).data;let sum=0,blue=0;for(let i=0;i<a.length;i+=4){sum+=a[i]+a[i+1]+a[i+2];if(a[i+2]>90&&a[i+1]>70&&a[i+2]>a[i]*1.1)blue++}return{time:t,state,mean:sum/(960*540*3),bluePixels:blue,center:Array.from(a.slice(((270*960+480)*4),((270*960+480)*4)+3))}}
   return{ditto:inspect(23),explosionBlack:inspect(25.55),blinkBlack:inspect(32.2),labBetweenBlinks:inspect(32.5),purpleFlash:inspect(34),reveal:inspect(36)};
  });
  assert.equal(info.visualChecks.ditto.state.normalDittoCount,5);assert(info.visualChecks.ditto.state.shinyDittoVisible);assert(info.visualChecks.ditto.bluePixels>5000,'Real blue shiny Ditto pixels must be present');
  assert.equal(info.visualChecks.explosionBlack.mean,0,'The explosion must be heard on black before returning to the lab');assert.equal(info.visualChecks.blinkBlack.mean,0);assert(info.visualChecks.labBetweenBlinks.mean>10);
  const purple=info.visualChecks.purpleFlash.center;assert(purple[2]>purple[0]+20&&purple[0]>purple[1]+35,'The reveal flash must be violet');assert(info.visualChecks.reveal.mean>12);
  if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(path.join(__dirname,'render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+times.length+' frames; normal and blue shiny Ditto, explosion on black, black pulses and violet reveal passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

