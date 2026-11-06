const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
(async()=>{
 const {LEGENDARY_MEDIA,legendaryMedia}=await import('./dist/js/legendary-media.mjs');
 const dex=JSON.parse(fs.readFileSync('dist/data/dex.json')),supported=new Map(JSON.parse(fs.readFileSync('dist/data/supported.json')).map(p=>[p.id,p]));
 const review=JSON.parse(fs.readFileSync('cinematics/production/reviewed-media.json')),catalog=JSON.parse(fs.readFileSync('cinematics/production/catalog.json'));
 assert(LEGENDARY_MEDIA['384'],'Approved Rayquaza movie is registered');
 assert.equal(catalog.speciesCount,87);assert.equal(catalog.variantCount,172);assert.equal(new Set(catalog.species.map(p=>p.action+'|'+p.environment)).size,87);
 const planned=catalog.species.flatMap(p=>p.variants);assert.equal(new Set(planned.map(v=>v.key)).size,172);
 for(const p of catalog.species){assert(supported.has(p.id));assert.equal(dex[p.id].rarity,'legendary');assert.equal(p.variants.length,supported.get(p.id).shiny?2:1);for(const v of p.variants){assert.equal(v.key,String(p.id)+(v.shiny?'s':''));assert(fs.existsSync(v.identityReference));assert.equal(v.status==='reviewed-media',!!LEGENDARY_MEDIA[v.key]);}}
 assert.deepEqual(Object.keys(review).sort(),Object.keys(LEGENDARY_MEDIA).sort());
 for(const [key,m]of Object.entries(LEGENDARY_MEDIA)){
  const r=review[key];assert(r.reviewed);assert.equal(key,String(r.id)+(r.shiny?'s':''));assert.equal(m.src,r.src);assert.equal(m.duration,r.duration);assert.equal(m.width,r.width);assert.equal(m.height,r.height);assert.equal(dex[r.id].rarity,'legendary');
  const bytes=fs.readFileSync('dist/'+m.src);assert.equal(bytes.toString('ascii',4,8),'ftyp');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),r.sha256);assert(fs.existsSync('dist/'+m.poster));assert(r.frameCount>=48);assert(Math.abs(r.frameCount/r.fps-r.duration)<.001);
  assert.equal(legendaryMedia(key).src,m.src);assert.equal(legendaryMedia(key,{reducedMotion:true}).manualStart,true);
  const other=String(r.id)+(r.shiny?'':'s');if(!LEGENDARY_MEDIA[other])assert.equal(legendaryMedia(other),null,'Never reuse a movie for a different color variant');
 }
 assert.equal(legendaryMedia('999999'),null);assert.equal(catalog.reviewed,Object.keys(LEGENDARY_MEDIA).length);
 console.log(`PASS: ${Object.keys(LEGENDARY_MEDIA).length} reviewed MP4 assets with matching hashes and exact variant routing; 87 distinct production directions, 172 variants, correct sprite exclusions and honest readiness counts.`);
})().catch(e=>{console.error(e);process.exit(1)});
