import {migrate} from './model.mjs';
import {applyReleaseGift} from './genetics.mjs';

export const MAX_SAVE_BYTES=5*1024*1024;
export const saveStorageKey=()=>globalThis.PW_SAVE_KEY||'tour-infernale-v1';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const validKey=k=>/^[1-9]\d{0,3}s?$/.test(String(k))&&parseInt(k)<=1025;
const fail=message=>{throw new Error(message)};
function checkStructure(raw){
 const stack=[{value:raw,depth:0}];let count=0;
 while(stack.length){const {value,depth}=stack.pop();if(depth>40||++count>100000)fail('Le fichier contient trop de données imbriquées.');if(value&&typeof value==='object')for(const [key,v]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))fail('Le fichier contient une structure non autorisée.');stack.push({value:v,depth:depth+1})}}
}
export function prepareSave(text,dex){
 if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>MAX_SAVE_BYTES)fail('Le fichier doit faire moins de 5 Mo.');
 let raw;try{raw=JSON.parse(text.replace(/^\uFEFF/,''))}catch{fail('Ce fichier ne contient pas un JSON valide.')}
 if(!object(raw)||!Array.isArray(raw.roster)||!Array.isArray(raw.team)||!object(raw.settings)||!('starter'in raw))fail('Ce fichier ne ressemble pas à une sauvegarde PokéWorld.');
 checkStructure(raw);
 if(raw.version!==undefined&&(!Number.isInteger(raw.version)||raw.version<1||raw.version>9))fail('Cette version de sauvegarde n’est pas compatible avec ce jeu.');
 if(raw.roster.length>4000||!raw.roster.every(validKey)||raw.team.length>6||!raw.team.every(validKey))fail('La collection ou l’équipe contient des Pokémon invalides.');
 if(raw.starter!==null&&!validKey(raw.starter))fail('Le premier partenaire est invalide.');
 if(raw.training!==undefined&&!object(raw.training))fail('Les données d’entraînement sont invalides.');
 for(const [key,p]of Object.entries(raw.training||{})){
  if(!validKey(key)||!object(p))fail('Un profil de Pokémon est invalide.');
  if(p.xp!==undefined&&(!Number.isFinite(p.xp)||p.xp<0||p.xp>1000000))fail('L’expérience d’un Pokémon est invalide.');
  for(const [stat,max]of [['iv',31],['ev',252]])if(p[stat]!==undefined&&(!Array.isArray(p[stat])||p[stat].length!==6||p[stat].some(v=>!Number.isInteger(v)||v<0||v>max)))fail('Les statistiques d’un Pokémon sont invalides.');
  if(p.ev?.reduce((a,b)=>a+b,0)>510)fail('Un Pokémon dépasse la limite de 510 EV.');
  if(p.moves!==undefined&&(!Array.isArray(p.moves)||p.moves.length>4||p.moves.some(v=>!Number.isInteger(v)||v<0||v>9999)))fail('Les capacités d’un Pokémon sont invalides.');
 }
 const state=migrate(raw);applyReleaseGift(state,raw);
 const excluded=state.roster.filter(k=>!dex[parseInt(k)]||(k.endsWith('s')&&!dex[parseInt(k)].shiny));
 state.archivedRoster=[...new Set([...state.archivedRoster,...excluded])];state.roster=state.roster.filter(k=>!excluded.includes(k));
 state.team=state.team.filter(k=>state.roster.includes(k));if(!state.team.length)state.team=state.roster.slice(0,1);
 if(!dex[state.starter])state.starter=parseInt(state.roster[0])||null;
 if(!state.roster.includes(state.survivor))state.survivor=state.roster[0]||null;
 if(raw.roster.length&&!state.roster.length)fail('Aucun Pokémon de cette sauvegarde n’est compatible avec le catalogue actuel.');
 const legendaries=state.roster.filter(k=>dex[parseInt(k)]?.rarity==='legendary');
 return{state,summary:{trainer:state.player.name,pokemon:state.roster.length,species:new Set(state.roster.map(k=>parseInt(k))).size,shinies:state.roster.filter(k=>k.endsWith('s')).length,legendaryMax:legendaries.filter(k=>(state.training[k]?.xp||0)>=1000000).length,tickets:state.tickets,floor:state.floor,archived:excluded.length}};
}
export function commitSaveImport(storage,key,next,current){
 const oldJSON=JSON.stringify(current),nextJSON=JSON.stringify(next),stamp=new Date().toISOString(),id=globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2),backupKey=key+':backup:'+stamp+':'+id;
 // Each backup is immutable. Failure to store it aborts the replacement.
 storage.setItem(backupKey,oldJSON);if(storage.getItem(backupKey)!==oldJSON)fail('La copie de secours n’a pas pu être vérifiée.');
 storage.setItem(key+':last-import-backup',backupKey);
 storage.setItem(key,nextJSON);
 if(storage.getItem(key)!==nextJSON)fail('La sauvegarde importée n’a pas pu être vérifiée.');
 // Notify other tabs only after the new state is committed. Missing notification
 // never invalidates an already verified import or discards its backup.
 try{storage.setItem(key+':import-revision',stamp+':'+id)}catch{}
 return{backupKey,stamp};
}
export function readImportBackup(storage,key){const pointer=storage.getItem(key+':last-import-backup');return pointer?.startsWith(key+':backup:')?storage.getItem(pointer):null}
export function saveBackupButton(){try{return readImportBackup(localStorage,saveStorageKey())?'<button data-act="save-backup-restore">Restaurer la sauvegarde précédente</button><button data-act="save-backup-export">Exporter la copie de secours</button>':''}catch{return''}}

function blocked(g){return g.mode||g.cinema?.active||g.summoning?.busy||g.battle?.active||g.duel?.active||g.net?.peer||g.duel?.peer}
function returnToSettings(g){g.pendingSaveImport=null;if(!g.state.starter)g.openStarter();else g.settings()}
function download(data,name){const url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function message(g,text){const el=g.modal.querySelector('#save-import-status');if(el){el.textContent=text;el.focus()}else g.toast(text)}
function choose(g){
 g.pendingSaveImport=null;
 g.openModal(`<section class="save-transfer"><span class="eyebrow">RETROUVE TON AVENTURE</span><h2>Importer une sauvegarde</h2><p>Choisis le fichier JSON exporté depuis PokéWorld. Il sera vérifié avant toute modification de ta partie.</p><label class="save-file-label" for="save-import-file">Fichier de sauvegarde</label><input id="save-import-file" type="file" accept=".json,application/json"><p id="save-import-status" role="status" tabindex="-1"></p><p class="muted">Ta partie actuelle sera conservée dans ce navigateur avant son remplacement. Le fichier choisi reste sur ton appareil.</p><div class="save-transfer-actions"><button data-act="save-import-cancel">Annuler</button></div></section>`,{className:'save-transfer-dialog'});
}
function preview(g,result,name){
 g.pendingSaveImport={...result,name};const s=result.summary;
 g.openModal(`<section class="save-transfer"><span class="eyebrow">FICHIER VÉRIFIÉ</span><h2>Prêt à retrouver ta partie ?</h2><p class="save-file-name">${g.escape(name)}</p><dl class="save-import-summary"><div><dt>Dresseur</dt><dd>${g.escape(s.trainer)}</dd></div><div><dt>Pokémon</dt><dd>${s.pokemon} · ${s.species} espèces</dd></div><div><dt>Légendaires niveau 100</dt><dd>${s.legendaryMax}</dd></div><div><dt>Chromatiques</dt><dd>${s.shinies}</dd></div><div><dt>Tickets</dt><dd>${s.tickets}</dd></div><div><dt>Tour Infernale</dt><dd>Étage ${s.floor}</dd></div></dl>${s.archived?`<p>${s.archived} Pokémon non compatibles seront conservés dans les archives.</p>`:''}<p>Cette partie remplacera celle de ce navigateur. Une copie de secours sera conservée et accessible dans les réglages.</p><p id="save-import-status" role="status" tabindex="-1"></p><div class="save-transfer-actions"><button class="primary" data-act="save-import-confirm">Importer cette sauvegarde</button><button data-act="save-import-choose">Choisir un autre fichier</button><button data-act="save-import-cancel">Annuler</button></div></section>`,{locked:true,className:'save-transfer-dialog'});
}
export function bindSaveTransfer(g){
 if(!document.querySelector('#save-transfer-style')){const el=document.createElement('style');el.id='save-transfer-style';el.textContent='.save-transfer-dialog{max-width:720px}.save-transfer p{line-height:1.6}.save-file-label{display:block;margin:18px 0 8px}.save-transfer input[type=file]{width:100%;padding:14px;border:1px solid var(--pw-line,#547183);border-radius:8px;color:inherit;background:var(--pw-raised,#1d3047);box-sizing:border-box}.save-file-name{overflow-wrap:anywhere}.save-transfer-actions,.save-settings-actions{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}.save-import-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}.save-import-summary div{padding:12px;background:var(--pw-raised,#1d3047);border:1px solid var(--pw-line,#547183);border-radius:8px}.save-import-summary dt{font-size:.8rem;opacity:.75}.save-import-summary dd{margin:6px 0 0;font-weight:700}.save-transfer [role=status]:not(:empty){padding:12px;border:1px solid #dfac76;border-radius:6px}@media(max-width:480px){.save-import-summary{grid-template-columns:1fr}.save-transfer-actions>button{width:100%}}';document.head.append(el)}
 g.modal.addEventListener('change',async e=>{if(e.target.id!=='save-import-file')return;const file=e.target.files?.[0];if(!file)return;try{if(blocked(g))fail('Quitte d’abord le mode ou le salon en cours.');if(file.size>MAX_SAVE_BYTES)fail('Le fichier doit faire moins de 5 Mo.');if(!/\.json$/i.test(file.name))fail('Choisis un fichier de sauvegarde au format .json.');message(g,'Vérification du fichier…');const result=prepareSave(await file.text(),g.dex);preview(g,result,file.name)}catch(error){g.pendingSaveImport=null;message(g,error.message)}});
 addEventListener('storage',e=>{if(e.key===saveStorageKey()+':import-revision'&&e.newValue){g.saveImportCommitted=true;location.reload()}});
}
export async function saveTransferAction(g,act){
 if(act==='save-import-cancel'){returnToSettings(g);return}
 if(act==='save-backup-export'){try{const raw=readImportBackup(localStorage,saveStorageKey());if(!raw)fail('Aucune copie de secours disponible.');download(raw,'pokeworld-avant-import-'+Date.now()+'.json')}catch(e){g.toast(e.message)}return}
 if(blocked(g)){g.toast('Quitte d’abord le mode ou le salon en cours pour importer une partie.');return}
 if(act==='import-save'||act==='save-import-choose'){choose(g);return}
 if(act==='save-backup-restore'){try{const raw=readImportBackup(localStorage,saveStorageKey());if(!raw)fail('Aucune copie de secours disponible.');preview(g,prepareSave(raw,g.dex),'Copie de secours avant le dernier import')}catch(e){g.toast(e.message)}return}
 if(act==='save-import-confirm'){
  const pending=g.pendingSaveImport;if(!pending||g.saveImportBusy)return;g.saveImportBusy=true;const button=g.modal.querySelector('[data-act="save-import-confirm"]');if(button)button.disabled=true;
  try{commitSaveImport(localStorage,saveStorageKey(),pending.state,g.state);g.saveImportCommitted=true;g.pendingSaveImport=null;message(g,'Sauvegarde importée. Rechargement de ta partie…');location.reload()}
  catch(e){g.saveImportBusy=false;if(button)button.disabled=false;message(g,'Import interrompu : ta partie actuelle est conservée. Vérifie que le stockage du navigateur est disponible.')}
 }
}
