export const MATERIALS=[
 {key:'mint',name:'Aromate',plural:'Aromates',icon:'✿',rarity:'rare',desc:'Change la nature d’un Pokémon.'},
 {key:'abilityPill',name:'Pilule Talent',plural:'Pilules Talent',icon:'◐',rarity:'rare',desc:'Passe d’un talent classique à un autre.'},
 {key:'abilityPatch',name:'Patch Talent',plural:'Patchs Talent',icon:'▧',rarity:'epic',desc:'Débloque le talent caché, ou revient à un talent classique.'},
 {key:'heartScale',name:'Écaille Cœur',plural:'Écailles Cœur',icon:'♥',rarity:'common',desc:'Réapprend une capacité débloquée au niveau actuel.'},
 {key:'silverCap',name:'Capsule d’argent',plural:'Capsules d’argent',icon:'◈',rarity:'epic',desc:'Au niveau 100, maximise un IV à 31.'},
 {key:'goldCap',name:'Capsule d’or',plural:'Capsules d’or',icon:'◆',rarity:'legendary',desc:'Au niveau 100, maximise les six IV à 31.'}
].map(m=>({...m,image:({mint:'adamant-mint',abilityPill:'ability-capsule',abilityPatch:'ability-patch',heartScale:'heart-scale',silverCap:'bottle-cap',goldCap:'gold-bottle-cap'})[m.key]+'.png'}));
export function normalizeMaterials(raw={}){return Object.fromEntries(MATERIALS.map(m=>[m.key,Math.max(0,Math.floor(Number(raw?.[m.key])||0))]))}
export function materials(state){return state.materials=normalizeMaterials(state.materials)}
export function spend(state,key,count=1){const bag=materials(state);if(!Number.isInteger(count)||count<0||!(key in bag)||bag[key]<count)return false;bag[key]-=count;return true}
export function materialLoot(random=Math.random){const roll=random()*100;const key=roll<40?'heartScale':roll<70?'mint':roll<87?'abilityPill':roll<94?'abilityPatch':roll<99?'silverCap':'goldCap';return{...MATERIALS.find(m=>m.key===key),count:key==='heartScale'?2:1}}
export function awardMaterial(state,drop){const bag=materials(state);if(drop&&drop.key in bag)bag[drop.key]+=Math.max(0,Math.floor(drop.count)||0)}
export function bagHTML(g){const bag=materials(g.state);return `<section class="material-bag"><div><span class="eyebrow">ENTRAÎNEMENT & SOINS</span><h2>Objets de progression</h2><p>À trouver dans les coffres de survie. ${g.state.coins.toLocaleString('fr')} poussières d’étoiles disponibles.</p></div><div class="material-grid">${MATERIALS.map(m=>`<article class="material-card ${m.rarity}"><img class="material-icon" src="assets/materials/${m.image}" alt=""><b>${m.name}</b><strong>×${bag[m.key]}</strong><small>${m.desc}</small></article>`).join('')}</div></section>`}
