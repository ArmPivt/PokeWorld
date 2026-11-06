const fs=require('node:fs'),path=require('node:path'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const mode=process.argv[2]||'preview',folder=path.join(__dirname,mode==='all'?'frames-v2':'previews');fs.mkdirSync(folder,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:600},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>window.rayFilm);await page.evaluate(()=>window.rayFilm.ready);
  const duration=await page.evaluate(()=>rayFilm.duration),fps=24,count=Math.ceil(duration*fps);
  const times=mode==='all'?Array.from({length:count},(_,i)=>i/fps):[.2,4.35,6.5,10.1,12.7,13.1,13.5,13.9,14.7,15.1,15.6,16.1,16.52,16.8,17.1,17.6,18.5,20.6];
  for(let i=0;i<times.length;i++){
   const time=times[i],result=await page.evaluate(t=>{const state=rayFilm.render(t);return{state,png:document.querySelector('#movie').toDataURL('image/png').split(',')[1]}},time);
   fs.writeFileSync(path.join(folder,mode==='all'?String(i).padStart(5,'0')+'.png':'frame-'+time.toFixed(2)+'.png'),Buffer.from(result.png,'base64'));
   if(mode!=='all'||i%48===0)console.log(JSON.stringify({frame:i,time,shot:result.state.shot,rayquazaVisible:result.state.rayquazaVisible}));
  }
  if(errors.length)throw Error(errors.join('\n'));
  fs.writeFileSync(path.join(__dirname,'render-info.json'),JSON.stringify({fps,frames:count,duration:count/fps,width:960,height:540,shotCuts:[0,6,8.6,12.4,14.8],flashPeak:16.52,cryAt:16.85,renderedAt:new Date().toISOString()},null,2));
  console.log('RENDERED '+mode+' '+times.length+' frames');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
