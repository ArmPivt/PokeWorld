const fs=require('node:fs'),path=require('node:path'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const all=process.argv.includes('all');const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4193');await p.waitForFunction(()=>window.jirachiFilm);await p.evaluate(()=>jirachiFilm.ready);
  const counters=await p.evaluate(()=>[0,3.5,3.72,4.8].map(t=>jirachiFilm.render(t).counter));
  if(JSON.stringify(counters)!==JSON.stringify([994,999,1000,1000]))throw Error('Counter must finish at 1000');
  const info=await p.evaluate(()=>({duration:jirachiFilm.duration,cuts:jirachiFilm.cuts,cryAt:jirachiFilm.cryAt,trianglePath:jirachiFilm.trianglePath}));Object.assign(info,{fps:24,frames:648,width:960,height:540});
  const folder=path.join(__dirname,all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});
  const times=all?Array.from({length:648},(_,i)=>i/24):[.8,3.5,3.95,4.8,6.4,8.8,10.9,11.8,14,16.2,17,18.6,19.9,20.2,20.7,21.5,22.3,24.7,26];
  for(let i=0;i<times.length;i++){
   const result=await p.evaluate(t=>({state:jirachiFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);
   fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(result.png,'base64'));
   if(all&&i%120===0)console.log(JSON.stringify({frame:i,shot:result.state.shot}));
  }
  if(errors.length)throw Error(errors.join('\n'));
  fs.writeFileSync(path.join(__dirname,'render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+times.length+' frames');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
