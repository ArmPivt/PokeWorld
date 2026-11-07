const fs=require('node:fs');
(async()=>{
 const base='https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/';
 async function csv(name){const r=await fetch(base+name+'.csv');if(!r.ok)throw Error(name+': '+r.status);const [header,...rows]=(await r.text()).trim().replace(/\r/g,'').split('\n'),keys=header.split(',');return rows.map(row=>Object.fromEntries(row.split(',').map((v,i)=>[keys[i],v])))}
 const [moves,names,types,learn,abilities,abilityNames]=await Promise.all(['moves','move_names','types','pokemon_moves','pokemon_abilities','ability_names'].map(csv));
 const dex=JSON.parse(fs.readFileSync('dist/client/data/dex.json')),typeNames=Object.fromEntries(types.map(t=>[t.id,t.identifier])),fr=Object.fromEntries(names.filter(n=>n.local_language_id==='5').map(n=>[n.move_id,n.name]));
 const moveData=Object.fromEntries(moves.filter(m=>+m.power>0&&['2','3'].includes(m.damage_class_id)).map(m=>[m.id,{id:+m.id,slug:m.identifier,name:fr[m.id]||m.identifier,type:typeNames[m.type_id],power:+m.power,pp:+m.pp||15,accuracy:+m.accuracy||100,special:m.damage_class_id==='3'}]));
 const versions={},entries={};for(const m of learn){if(dex[m.pokemon_id]&&m.pokemon_move_method_id==='1'&&moveData[m.move_id])versions[m.pokemon_id]=Math.max(versions[m.pokemon_id]||0,+m.version_group_id)}
 for(const m of learn){if(+m.version_group_id!==versions[m.pokemon_id]||m.pokemon_move_method_id!=='1'||!moveData[m.move_id])continue;const id=m.pokemon_id;entries[id]||=new Map();const L=Math.max(1,+m.level),old=entries[id].get(+m.move_id);if(!old||L<old.level)entries[id].set(+m.move_id,{...moveData[m.move_id],level:L})}
 const abilityFr=Object.fromEntries(abilityNames.filter(n=>n.local_language_id==='5').map(n=>[n.ability_id,n.name]));
 for(const p of Object.values(dex)){p.learnset=[...(entries[p.id]?.values()||[])].sort((a,b)=>a.level-b.level||a.id-b.id);if(!p.learnset.length)p.learnset=p.moves.map(m=>({...m,slug:moveData[m.id]?.slug||'struggle',level:1}));p.abilities=abilities.filter(a=>+a.pokemon_id===p.id).sort((a,b)=>+a.slot-+b.slot).map(a=>({id:+a.ability_id,name:abilityFr[a.ability_id]||'Talent',hidden:a.is_hidden==='1'}));p.moves=p.learnset.filter(m=>m.level<=5).slice(-4);while(p.moves.length<4)p.moves.push({id:165,slug:'struggle',name:'Lutte',type:'normal',power:50,pp:999,accuracy:100,special:false,level:1})}
 fs.writeFileSync('dist/client/data/dex.json',JSON.stringify(dex));console.log('Learnsets with levels and hidden abilities: '+Object.keys(dex).length+' Pokémon');
})().catch(e=>{console.error(e.message);process.exit(1)});
