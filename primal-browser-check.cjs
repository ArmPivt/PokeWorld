const {chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.Game);await p.locator('[data-act="choose-starter"][data-key="4"]').click();
  await p.evaluate(()=>{Game.state.tickets=4;Game.state.settings.reducedMotion=false;Game.state.settings.music=true;Game.state.legendaryStories={seen:[],pending:[]}});
  for(const [species,version,name] of [[382,3,'Kyogre'],[383,3,'Groudon']].filter(([id])=>!process.argv[2]||id===Number(process.argv[2]))){
   const before=await p.evaluate(()=>Game.state.tickets);
   await p.evaluate(async id=>{const g=Game;g.summoning.gen=3;g.route('gacha');const {summonPool}=await import('./js/summon-catalog.mjs'),pool=summonPool(g.dex,3,'legendary'),index=pool.findIndex(x=>x.id===id),random=Math.random,values=[.999,(index+.1)/pool.length,.8,.2,.3,.4,.5,.6,.7];if(index<0)throw Error('Species missing');Math.random=()=>values.shift()??.5;g.summoning.invoke().finally(()=>Math.random=random)},species);
   await p.waitForFunction(()=>Game.cinema.videoPlayer.state==='playing');
   const meta=await p.locator('video').evaluate(v=>{const stream=v.captureStream(),audio=stream.getAudioTracks().length;stream.getTracks().forEach(t=>t.stop());return{src:v.currentSrc,duration:v.duration,width:v.videoWidth,height:v.videoHeight,audio,muted:v.muted}});
   assert(meta.src.endsWith(`/assets/cinematics/${species}-appearance-v${version}.mp4`));assert(Math.abs(meta.duration-26)<.05);assert.equal(meta.width,960);assert.equal(meta.height,540);assert.equal(meta.audio,1);assert.equal(meta.muted,false);
   assert.equal(await p.evaluate(()=>Game.state.tickets),before-1);assert.equal(await p.evaluate(id=>Game.state.roster.includes(String(id)),species),true);assert.equal(await p.evaluate(()=>Game.audio.music.holds.has('legendary-video')),true);
   await p.locator('video').evaluate(v=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=22}));
   await p.screenshot({path:`qa-legendary-${species}-desktop.png`});await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await p.screenshot({path:`qa-legendary-${species}-mobile.png`});
   await p.waitForFunction(()=>!Game.cinema.active&&!Game.summoning.busy,null,{timeout:30000});assert.equal(await p.locator('.invocation-result h2').innerText(),name);assert.equal(await p.evaluate(id=>Game.state.legendaryStories.seen.includes(id),species),true);assert.equal(await p.evaluate(()=>Game.state.legendaryStories.pending.length),0);assert.equal(await p.evaluate(()=>Game.audio.music.holds.has('legendary-video')),false);
   await p.locator('.primary[data-act="close-modal"]').click();await p.evaluate(key=>Game.lab.open(key),String(species));await p.locator('[data-act="legendary-replay"]').click();await p.waitForFunction(()=>Game.cinema.videoPlayer.state==='playing');assert((await p.locator('video').evaluate(v=>v.currentSrc)).endsWith(`/assets/cinematics/${species}-appearance-v${version}.mp4`));await p.locator('[data-act="legendary-skip"]').click();await p.waitForFunction(()=>!!document.querySelector('.pokemon-detail-sheet'));assert.equal(await p.evaluate(()=>Game.state.tickets),before-1);await p.evaluate(()=>Game.closeModal(true));await p.setViewportSize({width:1440,height:900});console.log('PASS '+name+': 26s MP4 and actual audio track, first-obtainment reward, native end, mobile layout, collection replay and ticket balance.');
  }
  assert.deepEqual(errors,[]);
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
