export const THEMES=[
 {id:'daylight',name:'Clair',description:'Ciel doux et menus lumineux',bg:'#edf3f8',panel:'#ffffff',accent:'#347ca5'},
 {id:'night',name:'Nuit étoilée',description:'Bleu profond et lueurs turquoise',bg:'#0c1423',panel:'#17253b',accent:'#78d6df'},
 {id:'inferno',name:'Tour Infernale',description:'Obsidienne, braises et cuivre',bg:'#1b1117',panel:'#2b1c25',accent:'#efb477'},
 {id:'forest',name:'Forêt ancienne',description:'Sous-bois, mousse et jade',bg:'#101e1b',panel:'#1c3029',accent:'#b5d995'}
];
export const normalizeTheme=value=>THEMES.some(t=>t.id===value)?value:'daylight';
export function applyTheme(value,root=document.documentElement){const id=normalizeTheme(value);root.dataset.theme=id;root.style.colorScheme=id==='daylight'?'light':'dark';const theme=THEMES.find(t=>t.id===id);root.ownerDocument.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme.bg);return id}
export function themeSettingsHTML(value){const id=normalizeTheme(value);return `<section class="theme-settings"><h3>Thème du jeu</h3><p>Choisis l’ambiance de tes menus. Ton choix est sauvegardé.</p><div class="theme-options" role="group" aria-label="Thème du jeu">${THEMES.map(t=>`<button data-act="set-theme" data-theme="${t.id}" aria-pressed="${id===t.id}" class="theme-option ${id===t.id?'selected':''}" style="--preview-bg:${t.bg};--preview-panel:${t.panel};--preview-accent:${t.accent}"><span class="theme-preview" aria-hidden="true"><i></i><i></i><i></i></span><b>${t.name}</b><small>${t.description}</small><span class="theme-check" aria-hidden="true">${id===t.id?'✓':''}</span></button>`).join('')}</div></section>`}
