const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/arman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const TIMES={144:[1.2,3.8,5.6,8.3,10.3,11.6,14,16.5,17.5,19,20.6,21.3,22.3,24,26,28.5],145:[1.2,3.6,5.3,6.8,9,11.4,12.5,14.5,17.5,18.5,20,21.8,22.3,23.1,25,28.5],146:[1.2,4.4,6.6,9,11.3,12.5,15,17.7,18.8,21,23.7,24.3,25.1,27,29,30.8]};
(async()=>{
 const all=process.argv.includes('all'),ids=process.argv[2]&&process.argv[2]!=='all'?[Number(process.argv[2])]:[144,145,146],browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  for(const id of ids){
   await p.goto('http://127.0.0.1:4199/?id='+id);await p.waitForFunction(()=>window.birdsFilm);await p.evaluate(()=>birdsFilm.ready);
   const info=await p.evaluate(()=>({...birdsFilm.config,species:birdsFilm.species}));Object.assign(info,{fps:24,frames:info.duration*24,width:960,height:540});
   const folder=path.join(__dirname,all?'frames':'previews',String(id));fs.mkdirSync(folder,{recursive:true});
   const times=all?Array.from({length:info.frames},(_,i)=>i/24):TIMES[id];
   for(let i=0;i<times.length;i++){
    const r=await p.evaluate(t=>({state:birdsFilm.render(t),png:document.querySelector('canvas').toDataURL('image/png').split(',')[1]}),times[i]);
    assert.equal(r.state.species,id);if(times[i]<info.revealAt)assert.equal(r.state.birdVisible,false);
    fs.writeFileSync(path.join(folder,all?String(i).padStart(5,'0')+'.png':times[i].toFixed(2)+'.png'),Buffer.from(r.png,'base64'));
    if(all&&i%240===0)console.log(JSON.stringify({species:id,frame:i,shot:r.state.shot}));
   }
   info.visualChecks=await p.evaluate(times=>times.map(t=>{const state=birdsFilm.render(t),a=document.querySelector('canvas').getContext('2d').getImageData(0,0,960,540).data;let sum=0;for(let i=0;i<a.length;i+=4)sum+=a[i]+a[i+1]+a[i+2];return{time:t,state,mean:sum/(960*540*3)}}),TIMES[id]);
   for(const q of info.visualChecks)assert(q.mean>8,'All story shots must be visibly painted');
   assert.equal(new Set(info.visualChecks.map(x=>x.state.shot)).size,5);assert(info.visualChecks.at(-1).state.bird.alpha>.99);
   info.bodyBounds=await p.evaluate(()=>{
    const result=[];const scale=birdsFilm.species===145?3.85:birdsFilm.species===146?3.1:3.45;
    for(let t=birdsFilm.config.cuts.at(-1)+2.5;t<birdsFilm.duration-.6;t+=1/24){
     const s=birdsFilm.render(t),f=birdsFilm.spriteFrame(t),d=f.canvas.getContext('2d').getImageData(0,0,f.mode.w,f.mode.h).data;let minX=999,maxX=0,minY=999,maxY=0;
     for(let y=0;y<f.mode.h;y++)for(let x=0;x<f.mode.w;x++)if(d[(y*f.mode.w+x)*4+3]>32){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
     result.push({left:s.bird.x+(minX-f.anchorCx)*scale,right:s.bird.x+(maxX+1-f.anchorCx)*scale,top:s.bird.y+(minY-f.anchorBottom)*scale,bottom:s.bird.y+(maxY+1-f.anchorBottom)*scale});
    }
    return{left:Math.min(...result.map(x=>x.left)),right:Math.max(...result.map(x=>x.right)),top:Math.min(...result.map(x=>x.top)),bottom:Math.max(...result.map(x=>x.bottom)),frames:result.length};
   });
   assert(info.bodyBounds.left>8&&info.bodyBounds.right<472&&info.bodyBounds.top>8&&info.bodyBounds.bottom<255,'The complete revealed bird must remain in frame: '+JSON.stringify(info.bodyBounds));
   fs.writeFileSync(path.join(__dirname,id+'-render-info.json'),JSON.stringify(info,null,2));console.log('RENDERED '+id+' '+times.length+' frames; 5 shots, delayed reveal and whole-bird framing passed.');
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
