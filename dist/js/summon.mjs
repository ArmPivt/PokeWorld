import {REGIONS,RATES,SHINY_RATE,summonRoll,isShiny} from './model.mjs';
import {icon,drawMon,preload,loadImage} from './art.mjs';
export class Summoning {
 constructor(game){this.g=game;this.gen=1;this.busy=false}
 render(){const g=this.g,featured=[150,249,384,487,643,716,791,888,1007][this.gen-1];return `${g.heading('LES PORTAILS DE LA TOUR','Le cercle d’invocation','Neuf régions à découvrir. Un seul ticket pour tous les portails.')}<div class="ticket-explainer"><div class="ticket-glyph"></div><div><strong>${g.state.tickets} tickets universels</strong><p>1 ticket = 1 invocation, dans le portail de ton choix.</p></div><button data-act="route" data-page="survival">Gagner des tickets ↗</button></div><div class="region-tabs">${REGIONS.map((r,i)=>`<button class="${i+1===this.gen?'selected':''}" data-act="portal" data-gen="${i+1}"><small>GÉN. ${i+1}</small>${r}</button>`).join('')}</div><section class="summon-showcase"><div class="portal-visual"><div class="portal-ring"></div><div class="portal-ring ring-two"></div><img class="portal-featured" src="${icon(String(featured))}" alt="${g.poke(featured).name}"><span class="portal-rune">✦</span></div><div class="portal-copy"><span class="eyebrow">PORTAIL ${REGIONS[this.gen-1].toUpperCase()}</span><h2>Les échos de<br>${REGIONS[this.gen-1]}</h2><p>Chaque invocation peut ouvrir la voie à un nouveau compagnon. Qui répondra à ton appel ?</p><span class="shiny-note">✧ Shiny : 1 % · en plus de la rareté</span><button class="primary summon-button" data-act="summon" ${g.state.tickets<1||!g.state.starter?'disabled':''}><span class="ticket-mark">▱</span> Invoquer un Pokémon <small>1 ticket universel</small></button><button class="summon-button summon-ten" data-act="summon-ten" ${g.state.tickets<10||!g.state.starter?'disabled':''}>Invoquer ×10 <small>10 tickets universels</small></button><p class="multi-rates-note">10 tirages indépendants · mêmes taux · aucun bonus garanti</p><div class="portal-actions"><button class="text-button" data-act="rates">Voir tous les Pokémon et leurs taux →</button></div></div></section><section class="rates-panel"><div class="section-title"><h2>Les taux du portail</h2><span>Identiques sur les 9 portails</span></div><div class="rates-grid">${RATES.map(r=>`<div class="rate ${r.key}"><span>◆ ${r.name}</span><strong>${r.rate}<small>%</small></strong><i style="--rate:${r.rate}%;--rarity:${r.color}"></i></div>`).join('')}</div><p>Le shiny est tiré séparément avec une probabilité de 1 % : il conserve la rareté du Pokémon. Les légendaires incluent les fabuleux. Les variantes disponibles et leurs taux individuels figurent dans le détail.</p></section><div class="summon-bottom"><section class="panel"><h3>Comment obtenir des tickets ?</h3><div class="earning-row"><span>✦</span><div><b>Survis dans les terres de cendre</b><p>1 ticket toutes les 20 secondes de survie.</p></div></div><div class="earning-row"><span>♜</span><div><b>Triomphe d’un gardien</b><p>2 tickets pour chaque étage vaincu.</p></div></div></section><section class="panel"><h3>Dernières invocations</h3><div class="summon-history">${g.state.history.slice(0,6).map(r=>`<button class="history-mon ${r.rarity}" data-act="inspect" data-key="${r.key}"><img src="${icon(r.key)}" alt="${g.poke(r.key).name}"><span>${g.poke(r.key).name}${isShiny(r.key)?' ✧':''}</span></button>`).join('')||'<p class="muted">Le cercle attend ta première invocation.</p>'}</div></section></div>`}
 async invoke(count=1){
  const g=this.g;if(this.busy||!g.requireStarter())return;
  if(count!==1&&count!==10)return;
  if(g.state.tickets<count)return g.toast(`Il te faut ${count} ticket${count>1?'s':''} universel${count>1?'s':''} pour cette invocation.`);
  this.busy=true;this.skipRequested=false;this.stopAnimation();
  // Commit the complete batch before playing any animation: refresh cannot lose rewards.
  const results=Array.from({length:count},()=>summonRoll(g.dex,this.gen));
  for(const result of results){result.duplicate=g.state.roster.includes(result.key);result.fragments=result.duplicate?(isShiny(result.key)?80:30):0;if(!result.duplicate)g.state.roster.push(result.key);else g.state.coins+=result.fragments}
  g.state.tickets-=count;g.state.history=[...results.slice().reverse(),...g.state.history].slice(0,30);g.save();preload(results.map(r=>r.key));
  this.batch=results;
  try{
   for(let i=0;i<results.length;i++){
    if(this.skipRequested)break;
    await this.reveal(results[i],i,count);
    if(count>1&&!this.skipRequested)await new Promise(resolve=>{this.advance=resolve});
   }
   if(count>1)this.summary(results);
  }catch(error){this.summary(results);g.toast('Tes Pokémon sont sauvegardés. Voici tous les résultats.');console.error(error)}
  finally{this.busy=false;this.advance=null}
 }
 stopAnimation(){cancelAnimationFrame(this.revealFrame);this.revealFrame=0}
 cleanup(){this.stopAnimation();this.g.modal.classList.remove('summon-dialog');this.g.modal.style.removeProperty('--summon-color');if(this.g.page==='gacha')this.g.render()}
 next(){if(!this.busy)return;const advance=this.advance;this.advance=null;advance?.()}
 skip(){if(!this.busy)return;this.skipRequested=true;this.next()}
 animateCanvas(canvas,key){
  this.stopAnimation();const ctx=canvas.getContext('2d');
  const animate=t=>{if(!canvas.isConnected||!this.g.modal.open)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;drawMon(ctx,key,canvas.width/2,canvas.height*.49,canvas.height*.86,'Idle',0,t/1000);this.revealFrame=requestAnimationFrame(animate)};
  this.revealFrame=requestAnimationFrame(animate);
 }
 async reveal(result,index,count){
  const g=this.g,rarity=g.rarity(result.rarity),reduced=g.state.settings.reducedMotion;
  // Load a real sprite before silhouette arrival, with a bounded wait for remote assets.
  const image=loadImage(icon(result.key));
  if(!image.complete)await Promise.race([new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true})}),new Promise(r=>setTimeout(r,1200))]);
  if(this.skipRequested)return;
  g.modal.classList.add('summon-dialog');g.modal.style.removeProperty('--summon-color');
  g.openModal(`<div class="invocation-sequence silhouette-sequence" id="invocation-stage"><span class="eyebrow">${count===10?`MULTI-INVOCATION · ${index+1} / 10`:'LE PORTAIL S’ÉVEILLE'}</span><div class="silhouette-halo"></div><div class="silhouette-frame"><canvas class="silhouette-mon" width="300" height="250" aria-label="Silhouette du Pokémon à découvrir"></canvas></div><h2>Qui répond à ton appel ?</h2><p>Une présence traverse le portail…</p>${count>1?'<button class="text-button skip-reveals" data-act="summon-skip">Voir les 10 résultats →</button>':''}</div>`,{locked:true});
  this.animateCanvas(g.modal.querySelector('canvas'),result.key);
  await new Promise(r=>setTimeout(r,reduced?80:1400));
  if(this.skipRequested)return;
  this.stopAnimation();g.modal.style.setProperty('--summon-color',rarity.color);g.audio.chime(result.rarity);
  g.openModal(`<div class="invocation-result rarity-reveal ${result.rarity} ${isShiny(result.key)?'is-shiny':''}" style="--summon-color:${rarity.color}"><div class="reveal-rays"></div><span class="eyebrow">${count>1?`INVOCATION ${index+1} / ${count}`:result.duplicate?'UN VISAGE FAMILIER':'UNE NOUVELLE ALLIANCE'}</span><span class="rarity-tag ${result.rarity}">${rarity.name}${isShiny(result.key)?' · ✧ SHINY':''}</span><canvas class="reveal-mon colored-arrival" width="300" height="250" aria-label="${g.poke(result.key).name}"></canvas><h2>${g.poke(result.key).name}</h2><p>${result.duplicate?`Doublon converti en ${result.fragments} poussières d’étoiles.`:'A rejoint ta collection.'}</p>${isShiny(result.key)?'<p class="shiny-note">Variante chromatique · 1 % de chance</p>':''}${count>1?`<button class="primary" data-act="summon-next">${index===count-1?'Voir le récapitulatif des 10':'Suivant · '+(index+2)+' / 10'} →</button><button class="text-button" data-act="summon-skip">Voir les 10 résultats</button>`:`<button class="primary" data-act="close-modal">Accueillir ${g.poke(result.key).name}</button><button data-act="summon-again" ${g.state.tickets<1?'disabled':''}>Invoquer à nouveau · 1 ticket</button>`}</div>`,count>1?{locked:true}:{onClose:()=>this.cleanup()});
  this.animateCanvas(g.modal.querySelector('canvas'),result.key);
 }
 summary(results){
  const g=this.g;this.stopAnimation();g.modal.style.removeProperty('--summon-color');
  const fragments=results.reduce((n,r)=>n+r.fragments,0),newCount=results.filter(r=>!r.duplicate).length;
  g.openModal(`<div class="multi-summary"><span class="eyebrow">LE CERCLE A RÉPONDU À TON APPEL</span><h2>Tes 10 invocations</h2><p>${newCount} nouveau${newCount>1?'x':''} compagnon${newCount>1?'s':''}${fragments?' · +'+fragments+' poussières d’étoiles':''}</p><div class="multi-results">${results.map((r,i)=>`<article class="multi-result ${r.rarity} ${isShiny(r.key)?'multi-shiny':''}" style="--summon-color:${g.rarity(r.rarity).color}"><small>${String(i+1).padStart(2,'0')} · ${g.rarity(r.rarity).name}${isShiny(r.key)?' · ✧ SHINY':''}</small><canvas width="130" height="110" data-result-key="${r.key}" aria-label="${g.poke(r.key).name}"></canvas><b>${g.poke(r.key).name}</b><span>${r.duplicate?'+'+r.fragments+' poussières d’étoiles':'Nouveau !'}</span></article>`).join('')}</div><div class="multi-summary-actions"><button class="primary" data-act="close-modal">Accueillir mes Pokémon</button><button data-act="summon-again-ten" ${g.state.tickets<10?'disabled':''}>Invoquer ×10 · 10 tickets</button></div><p class="muted">Les 10 tirages sont sauvegardés. Même taux et même chance de shiny que les invocations simples.</p></div>`,{onClose:()=>this.cleanup()});
  const canvases=[...g.modal.querySelectorAll('canvas')];const animate=t=>{if(!g.modal.open||!canvases[0]?.isConnected)return;for(const c of canvases){const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);drawMon(ctx,c.dataset.resultKey,c.width/2,c.height/2,100,'Idle',0,t/1000)}this.revealFrame=requestAnimationFrame(animate)};this.revealFrame=requestAnimationFrame(animate);
 }

 rates(){const g=this.g,pool=Object.values(g.dex).filter(p=>p.gen===this.gen);g.openModal(`<span class="eyebrow">TRANSPARENCE DES INVOCATIONS</span><h2>Portail ${REGIONS[this.gen-1]}</h2><p>Le taux total inclut la variante normale et la variante shiny. Le tirage shiny indépendant à 1 % utilise uniquement les espèces disposant d’une variante PMD vérifiée.</p><div class="all-rates">${RATES.map(r=>{const mons=pool.filter(p=>p.rarity===r.key),rate=r.rate/mons.length;return `<details><summary><span class="${r.key}">◆ ${r.name}</span><b>${r.rate} % · ${mons.length} espèces</b></summary><div class="rates-list">${mons.map(p=>`<div><span>${p.name}</span><b>${((r.rate*.99/mons.length)+(p.shiny!==false?r.rate*.01/Math.max(1,mons.filter(p=>p.shiny!==false).length):0)).toFixed(5)} %</b><small>dont shiny ${p.shiny!==false?(r.rate*.01/Math.max(1,mons.filter(p=>p.shiny!==false).length)).toFixed(6)+' %':'indisponible'}</small></div>`).join('')}</div></details>`}).join('')}</div>`)}
}
