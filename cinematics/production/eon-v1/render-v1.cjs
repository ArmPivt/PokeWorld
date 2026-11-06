const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const all=process.argv.includes('all'),filter=process.argv.map(Number).find(x=>[380,381].includes(x));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{for(const id of [380,381].filter(x=>!filter||x===filter)){
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4195/?id='+id);await p.waitForFunction(()=>window.eonFilm);await p.evaluate(()=>eonFilm.ready);
  const info=await p.evaluate(()=>({duration:eonFilm.duration,cuts:eonFilm.cuts,cryAt:eonFilm.cryAt,revealAt:eonFilm.revealAt,species:eonFilm.species}));Object.assign(info,{fps:24,frames:768,width:960,height:540});
  const folder=path.join(__dirname,String(id),all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});
  const times=all?Array.from({length:768},(_,i)=>i/24):[1,3.8,5.6,6.9,7.7,8.8,11.5,13.6,14.5,16.2,17.5,20,22.5,24.3,25.5,26.5,27.3,29.5,31];
  for(let i=0;i<times.length;i++){
   const result=await p.evaluate(t=>({state:eonFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);assert.equal(result.state.guideSpecies,id);if(times[i]>=26)assert.equal(result.state.revealedSpecies,id);
   fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(result.png,'base64'));
   if(all&&i%192===0)console.log(JSON.stringify({species:id,frame:i,shot:result.state.shot}));
  }
  info.whiteChecks=await p.evaluate(()=>[18,22,24.8,25.5].map(t=>{const state=eonFilm.render(t),d=document.querySelector('canvas').getContext('2d').getImageData(0,0,960,540).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>240&&d[i+1]>240&&d[i+2]>240)n++;return{time:t,whiteFraction:n/(960*540),progress:state.forestProgress}}));
  assert.equal(info.whiteChecks[3].whiteFraction,1,'White screen must occur before the reveal');assert(info.whiteChecks[2].whiteFraction>.85,'Approaching the forest opening must fill the view with light');assert(info.whiteChecks[0].progress<info.whiteChecks[1].progress);
  if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(path.join(__dirname,String(id),'render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+id+': '+times.length+' frames; correct guide/reveal species; forest approach and full-white transition passed.');await p.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

