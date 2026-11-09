const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const all=process.argv.includes('all'),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4200');await p.waitForFunction(()=>window.victiniFilm);await p.evaluate(()=>victiniFilm.ready);
 const info=await p.evaluate(()=>({duration:victiniFilm.duration,cuts:victiniFilm.cuts,cryAt:victiniFilm.cryAt,revealAt:victiniFilm.revealAt}));assert.equal(info.duration,30);Object.assign(info,{species:494,fps:24,frames:720,width:960,height:540});
 const folder=path.join(__dirname,'494',all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});
 const times=all?Array.from({length:720},(_,i)=>i/24):[1,3.5,4.6,5.3,6.8,8.3,9,10.5,13.5,16.8,18.3,20.5,23,24.8,26.2,27.8,29];
 for(let i=0;i<times.length;i++){const result=await p.evaluate(t=>({state:victiniFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(result.png,'base64'));if(all&&i%192===0)console.log(JSON.stringify({frame:i,shot:result.state.shot}))}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'494/render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED Victini: '+times.length+' frames; nine cinematic shots; no page errors');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
