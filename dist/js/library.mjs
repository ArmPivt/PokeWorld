import {REGIONS,RATES,isShiny} from './model.mjs';
import {profile,level} from './training.mjs';
import * as Art from './art.mjs';
const SIZE=36,fold=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function speciesEntries(g,f){
 const owned=new Set(g.state.roster),entries=[];
 for(const d of Object.values(g.dex)){
  if(f.gen&&d.gen!==+f.gen||f.rarity&&d.rarity!==f.rarity||f.type&&!d.types.includes(f.type)||f.query&&!fold(d.name+' '+d.id).includes(fold(f.query)))continue;
  const normal=String(d.id),shiny=d.shiny?normal+'s':null,all=[normal,...(shiny?[shiny]:[])],candidates=f.shiny==='yes'?(shiny?[shiny]:[]):f.shiny==='no'?[normal]:all;
  if(!candidates.length||f.owned==='owned'&&!candidates.some(k=>owned.has(k))||f.owned==='missing'&&candidates.some(k=>owned.has(k)))continue;
  const preferred=g.state.pokemonVariants?.[d.id]==='shiny'?shiny:normal,key=candidates.find(k=>k===preferred&&owned.has(k))||candidates.find(k=>owned.has(k))||candidates.find(k=>k===preferred)||candidates[0];
  entries.push({id:d.id,key,normal,shiny,owned:owned.has(key),ownedKeys:all.filter(k=>owned.has(k))});
 }
 const val=e=>f.sort==='name'?g.poke(e.key).name:f.sort==='level'?-(e.owned?level(profile(g.state,e.key)):0):f.sort==='iv'?-(e.owned?profile(g.state,e.key).iv.reduce((a,b)=>a+b,0):0):e.id;
 return entries.sort((a,b)=>typeof val(a)==='string'?val(a).localeCompare(val(b),'fr'):val(a)-val(b)||a.id-b.id);
}
export class PokemonLibrary{
 constructor(g){this.g=g;this.filters={}}
 settings(context){return this.filters[context]||={query:'',gen:'',rarity:'',owned:'owned',shiny:'',type:'',sort:'id',page:0}}
 render(context,action,selected=[]){
  const g=this.g,f=this.settings(context),entries=speciesEntries(g,f),pages=Math.max(1,Math.ceil(entries.length/SIZE));f.page=Math.max(0,Math.min(f.page,pages-1));
  const select=(key,label,options)=>`<label>${label}<select data-library-filter="${key}" data-context="${context}">${options.map(([v,n])=>`<option value="${v}" ${String(f[key])===String(v)?'selected':''}>${n}</option>`).join('')}</select></label>`;
  return `<section class="library" data-library="${context}"><div class="library-filters"><label class="library-search">Recherche<input data-library-filter="query" data-context="${context}" value="${g.escape(f.query)}" placeholder="Nom ou numéro…" aria-label="Rechercher un Pokémon"></label>${select('gen','Génération',[['','Toutes'],...REGIONS.map((r,i)=>[i+1,`${i+1} · ${r}`])])}${select('rarity','Rareté',[['','Toutes'],...RATES.map(r=>[r.key,r.name])])}${select('owned','Collection',[['owned','Obtenus'],['all','Tous'],['missing','Non obtenus']])}${select('shiny','Apparence',[['','Toutes'],['no','Normale'],['yes','Chromatique ✧']])}${select('type','Type',[['','Tous'],...Object.entries(Art.TYPE_NAMES)])}${select('sort','Trier par',[['id','Numéro'],['name','Nom'],['level','Niveau'],['iv','Meilleurs IV']])}</div><div class="library-count"><b>${entries.length} espèce${entries.length>1?'s':''}</b><span>Page ${f.page+1} / ${pages}</span><button data-act="library-reset" data-context="${context}">Réinitialiser</button></div><div class="mon-grid">${entries.slice(f.page*SIZE,(f.page+1)*SIZE).map(e=>{
   const d=g.poke(e.key),p=e.owned?profile(g.state,e.key):null,selectedHere=selected.includes(e.key),hasSelected=e.ownedKeys.some(k=>selected.includes(k));
   const chips=`<span class="species-variants"><span class="${e.ownedKeys.includes(e.normal)?'available':''}">Normal${selected.includes(e.normal)?' ✓':''}</span>${e.shiny?`<span class="${e.ownedKeys.includes(e.shiny)?'available chromatic':''}">✧ Chromatique${selected.includes(e.shiny)?' ✓':''}</span>`:''}</span>`;
   return `<div class="species-card" data-species="${e.id}"><button class="mon-card ${hasSelected?'selected':''} ${isShiny(e.key)?'shiny-card':''} ${!e.owned?'not-owned':''}" data-act="${action}" data-key="${e.key}" ${!e.owned&&action!=='inspect'?'disabled':''} ${action!=='inspect'?`aria-pressed="${selectedHere}"`:''}><small>#${String(d.id).padStart(3,'0')} ${isShiny(e.key)?'✧':''}</small><canvas width="130" height="105" data-mon="${e.key}"></canvas><b>${d.name}</b><span class="rarity-tag ${d.rarity}">${g.rarity(d.rarity).name}</span><span>${e.owned?'Niv. '+level(p)+' · IV '+p.iv.reduce((a,b)=>a+b,0)+'/186':'Non obtenu'}</span>${chips}${selectedHere?'<i>✓ Sélectionné</i>':''}</button>${action!=='inspect'?`<button class="species-details" data-act="inspect" data-key="${e.key}">Fiche & variantes ↗</button>`:''}</div>`;
  }).join('')||'<div class="panel empty-state">Aucun Pokémon ne correspond à ces critères.</div>'}</div><div class="library-pagination"><button data-act="library-page" data-context="${context}" data-page="${f.page-1}" ${!f.page?'disabled':''}>← Précédent</button><span>${f.page+1} / ${pages}</span><button data-act="library-page" data-context="${context}" data-page="${f.page+1}" ${f.page>=pages-1?'disabled':''}>Suivant →</button></div></section>`;
 }
 change(input){const context=input.dataset.context,f=this.settings(context),name=input.dataset.libraryFilter;f[name]=input.value;f.page=0;const pos=input.selectionStart;this.g.render();const next=this.g.root.querySelector(`[data-library-filter="${name}"][data-context="${context}"]`);next?.focus();if(name==='query')next?.setSelectionRange(pos,pos)}
 action(act,d){if(act==='library-reset')delete this.filters[d.context];else this.settings(d.context).page=Math.max(0,+d.page||0);this.g.render()}
}
