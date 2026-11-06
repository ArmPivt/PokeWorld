const fs=require('node:fs'),path=require('node:path'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const all=process.argv.includes('all');const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{for(const species of [382,383]){
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4190/?species='+species);await p.waitForFunction(()=>window.primalFilm);await p.evaluate(()=>primalFilm.ready);
  const info=await p.evaluate(()=>({duration:primalFilm.duration,cuts:primalFilm.cuts,cryAt:primalFilm.cryAt}));Object.assign(info,{fps:24,frames:624,width:960,height:540,species});
  const folder=path.join(__dirname,String(species),all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});
  const times=all?Array.from({length:624},(_,i)=>i/24):[1.5,3.1,4.8,6.6,8.5,10.5,11.5,12.8,14.5,15.8,16.8,17.9,18.7,19.4,20.3,21.1,22.6,24.8];
  for(let i=0;i<times.length;i++){
   const r=await p.evaluate(t=>({state:primalFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);
   fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(r.png,'base64'));
   if(all&&i%120===0)console.log(JSON.stringify({species,frame:i,shot:r.state.shot}));
  }
  if(errors.length)throw Error(errors.join('\n'));
  fs.writeFileSync(path.join(__dirname,String(species),'render-info.json'),JSON.stringify(info,null,2));await p.close();
  console.log('RENDERED '+species+' '+times.length+' frames');
 }}finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
