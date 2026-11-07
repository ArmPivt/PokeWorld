import * as Art from './art.mjs';
import {profile,level} from './training.mjs';

export function teamSelection(g){
 return `<section class="selected-team" aria-label="Les six emplacements de mon équipe"><div class="selected-team-title"><h3>Ton équipe</h3><span>Clique sur un partenaire pour le gérer</span></div><div class="selected-team-slots">${Array.from({length:6},(_,i)=>{const key=g.state.team[i],d=key&&g.dex[parseInt(key)];return d?`<button class="team-slot" data-act="team-slot" data-key="${key}" aria-label="Gérer ${g.escape(d.name)}${key.endsWith('s')?' chromatique':''}"><small>${i+1} · ${i?'Réserve':'Actif'}</small><canvas width="180" height="120" data-mon="${key}" aria-hidden="true"></canvas><b>${g.escape(d.name)}</b><span>Niv. ${level(profile(g.state,key))}${key.endsWith('s')?' · ✧ Chromatique':''}</span></button>`:`<button class="team-slot team-slot-empty" data-act="team-empty" aria-label="Choisir le Pokémon de l’emplacement ${i+1}"><small>${i+1} · Libre</small><i aria-hidden="true">+</i><b>Emplacement libre</b><span>Choisir un Pokémon</span></button>`}).join('')}</div></section>`;
}
export function teamSelectionAction(g,act,d){
 if(act==='team-empty'){const input=g.root.querySelector('[data-library-filter="query"]');input?.scrollIntoView({block:'center',behavior:g.state.settings.reducedMotion?'instant':'smooth'});input?.focus({preventScroll:true});return}
 const key=d.key;if(!g.state.team.includes(key))return;
 if(act==='team-summary'){g.lab.tab='stats';g.lab.picker=null;g.inspect(key);return}
 if(act==='team-remove'){
  if(g.state.team.length<=1){g.toast('Garde au moins un Pokémon dans ton équipe.');return}
  const index=g.state.team.indexOf(key);g.state.team.splice(index,1);g.save();g.closeModal();g.render();g.root.querySelectorAll('.team-slot')[index]?.focus();return;
 }
 if(act!=='team-slot')return;
 const mon=g.dex[parseInt(key)];let frame;
 g.openModal(`<div class="team-choice"><span class="eyebrow">TON ÉQUIPE</span><canvas width="240" height="170" aria-label="${g.escape(mon.name)}"></canvas><h2>${g.escape(mon.name)}</h2><p>Niveau ${level(profile(g.state,key))}${key.endsWith('s')?' · ✧ Chromatique':''}</p><button class="primary" data-act="team-summary" data-key="${key}">Voir son résumé ↗</button><button data-act="team-remove" data-key="${key}" ${g.state.team.length<=1?'disabled':''}>Retirer de l’équipe</button>${g.state.team.length<=1?'<small>Garde au moins un Pokémon dans ton équipe.</small>':'<small>Il restera disponible dans ta collection.</small>'}</div>`,{className:'team-choice-dialog',onClose:()=>cancelAnimationFrame(frame)});
 const canvas=g.modal.querySelector('canvas'),ctx=canvas.getContext('2d');Art.preload([key]);
 const draw=t=>{if(!canvas.isConnected||!g.modal.open)return;ctx.clearRect(0,0,canvas.width,canvas.height);Art.drawPortrait(ctx,key,120,85,140,'Idle',0,g.state.settings.reducedMotion?0:t/1000);frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw);
}
