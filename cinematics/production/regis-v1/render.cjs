const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const all=process.argv.includes('all'),filter=process.argv.map(Number).find(x=>[377,378,379].includes(x));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  for(const id of [377,378,379].filter(x=>!filter||x===filter)){
   const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4194/?id='+id);await p.waitForFunction(()=>window.regisFilm);await p.evaluate(()=>regisFilm.ready);
   const info=await p.evaluate(()=>({duration:regisFilm.duration,cuts:regisFilm.cuts,cryAt:regisFilm.cryAt,revealAt:regisFilm.revealAt,eyePoints:regisFilm.eyePoints()}));Object.assign(info,{species:id,fps:24,frames:672,width:960,height:540});assert.equal(info.eyePoints.length,7);
   const folder=path.join(__dirname,String(id),all?'frames':'previews');fs.mkdirSync(folder,{recursive:true});
   const times=all?Array.from({length:672},(_,i)=>i/24):[1,4.4,5.8,7.8,10.8,12.8,14.2,16,17.5,18.3,19.6,20.7,21.5,21.8,22.6,24.8,26.8];
   for(let i=0;i<times.length;i++){
    const result=await p.evaluate(t=>({state:regisFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);
    fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(result.png,'base64'));
    if(all&&i%168===0)console.log(JSON.stringify({species:id,frame:i,shot:result.state.shot}));
   }
   // Darkness must contain only the seven face lights and their tiny halos.
   const dark=await p.evaluate(()=>{regisFilm.render(20.7);const x=document.querySelector('canvas').getContext('2d'),d=x.getImageData(0,0,960,540).data;let lit=0;for(let i=0;i<d.length;i+=4)if(d[i]+d[i+1]+d[i+2]>20)lit++;return lit/(960*540)});assert(dark<.02&&dark>.0001,'Only seven tiny face lights may be visible in the dark chamber');
   info.darkLitPixelFraction=dark;if(errors.length)throw Error(errors.join('\n'));
   fs.writeFileSync(path.join(__dirname,String(id),'render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+id+': '+times.length+' frames; seven source-aligned face dots; dark-room assertion passed.');await p.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

