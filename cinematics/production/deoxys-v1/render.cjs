const fs=require('node:fs'),path=require('node:path'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const all=process.argv.includes('all');const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4192');await p.waitForFunction(()=>window.deoxysFilm);await p.evaluate(()=>deoxysFilm.ready);
  const info=await p.evaluate(()=>({duration:deoxysFilm.duration,cuts:deoxysFilm.cuts,cryAt:deoxysFilm.cryAt,trianglePath:deoxysFilm.trianglePath}));Object.assign(info,{fps:24,frames:864,width:960,height:540});
  const folder=path.join(__dirname,all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});
  const times=all?Array.from({length:864},(_,i)=>i/24):[1,3.8,6.2,7.6,8.6,9.3,10.25,10.7,11.8,13.2,14.5,14.79,15.05,15.5,16.2,17.4,24,32.6];
  for(let i=0;i<times.length;i++){
   const result=await p.evaluate(t=>({state:deoxysFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);
   fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(result.png,'base64'));
   if(all&&i%120===0)console.log(JSON.stringify({frame:i,shot:result.state.shot}));
  }
  if(errors.length)throw Error(errors.join('\n'));
  fs.writeFileSync(path.join(__dirname,'render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+times.length+' frames');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
