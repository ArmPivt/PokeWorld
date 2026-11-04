export const WIDTH=160,HEIGHT=104,STEP=.25,MAX_PLAYERS=9;
const FACTION_PERKS={
 "rocket": {
  "name": "Réseau clandestin",
  "desc": "+35 % de revenus sur tes échanges commerciaux avec une team alliée.",
  "bonuses": {
   "alliedTrade": 1.35
  }
 },
 "aqua": {
  "name": "Maîtres des océans",
  "desc": "+40 % de revenus sur ton commerce maritime.",
  "bonuses": {
   "seaTrade": 1.4
  }
 },
 "magma": {
  "name": "Expansion continentale",
  "desc": "Conquête terrestre 20 % plus rapide et 15 % moins coûteuse en Poké Balls.",
  "bonuses": {
   "conquestSpeed": 1.2,
   "conquestCost": 0.85
  }
 },
 "galactic": {
  "name": "Distorsion spatiale",
  "desc": "Temps de recharge de tes légendaires réduit de 20 % après un assaut.",
  "bonuses": {
   "legendCooldown": 0.8
  }
 },
 "plasma": {
  "name": "Rempart royal",
  "desc": "+20 % de résistance pour toutes tes terres face aux conquêtes ennemies.",
  "bonuses": {
   "defense": 1.2
  }
 },
 "flare": {
  "name": "Fortune écarlate",
  "desc": "+20 % de Pokédollars générés chaque seconde par ton territoire et tes bâtiments.",
  "bonuses": {
   "income": 1.2
  }
 },
 "aether": {
  "name": "Protection lumineuse",
  "desc": "Temps de recharge des interceptions de tes stations Gardevoir réduit de 25 %.",
  "bonuses": {
   "shieldCooldown": 0.75
  }
 },
 "cosmos": {
  "name": "Énergie industrielle",
  "desc": "+30 % de production de Poké Balls pour tes usines.",
  "bonuses": {
   "factory": 1.3
  }
 },
 "skull": {
  "name": "Flotte de pillards",
  "desc": "Tes transports Lokhlass et tes patrouilles Léviator naviguent 25 % plus vite.",
  "bonuses": {
   "navalSpeed": 1.25
  }
 },
 "yell": {
  "name": "Clameur des supporters",
  "desc": "+20 % de recrutement naturel et dans les repaires, avant le ralentissement lié à ta réserve.",
  "bonuses": {
   "recruit": 1.2
  }
 },
 "star": {
  "name": "Union des escouades",
  "desc": "Temps de construction et d’amélioration de tous tes bâtiments réduit de 25 %.",
  "bonuses": {
   "buildTime": 0.75
  }
 }
};
export const FACTIONS=[
 {id:'rocket',name:'Team Rocket',mark:'R',color:'#df6370',legend:150,legendName:'Mewtwo',type:'psychic',unit:24,motto:'Le monde est notre terrain de chasse.'},
 {id:'aqua',name:'Team Aqua',mark:'A',color:'#4bb7df',legend:382,legendName:'Kyogre',type:'water',unit:319,motto:'Que les océans reprennent leurs droits.'},
 {id:'magma',name:'Team Magma',mark:'M',color:'#ed8958',legend:383,legendName:'Groudon',type:'fire',unit:323,motto:'Une nouvelle terre à conquérir.'},
 {id:'galactic',name:'Team Galaxie',mark:'G',color:'#74c7c9',legend:487,legendName:'Giratina',type:'ghost',unit:435,motto:'Réécrivons les frontières du monde.'},
 {id:'plasma',name:'Team Plasma',mark:'P',color:'#a6a5e9',legend:646,legendName:'Kyurem',type:'ice',unit:625,motto:'Un royaume sous une seule bannière.'},
 {id:'flare',name:'Team Flare',mark:'F',color:'#ed718d',legend:717,legendName:'Yveltal',type:'dark',unit:229,motto:'Un monde à notre image.'},
 {id:'aether',name:'Fondation Æther',mark:'Æ',color:'#e4d5a4',legend:800,legendName:'Necrozma',type:'psychic',unit:773,motto:'La lumière au service de notre empire.'},
 {id:'cosmos',name:'Macro Cosmos',mark:'C',color:'#a3bf76',legend:890,legendName:'Éthernatos',type:'dragon',unit:823,motto:'L’énergie qui fera tourner la région.'},
 {id:'skull',name:'Team Skull',mark:'S',color:'#bd9acb',legend:792,legendName:'Lunala',type:'ghost',unit:768,motto:'Même la nuit porte notre drapeau.',alternate:true},
 {id:'yell',name:'Team Yell',mark:'Y',color:'#da9ebe',legend:888,legendName:'Zacian',type:'fairy',unit:862,motto:'Fais entendre les couleurs de ton camp.',alternate:true},
 {id:'star',name:'Team Star',mark:'★',color:'#d5ae67',legend:1007,legendName:'Koraidon',type:'dragon',unit:966,motto:'Ensemble, décrochons les étoiles.',alternate:true}
].map(f=>({...f,perk:FACTION_PERKS[f.id]}));
export const BUILDINGS=[
 {id:'city',name:'Repaire',icon:'⌂',cost:360,time:4,desc:'Augmente de 650 la réserve de Poké Balls et accélère le recrutement.',color:'#d3c7a4',sprite:143},
 {id:'factory',name:'Usine de Poké Balls',icon:'▥',cost:480,time:5,desc:'+18 de production de base/s. Convois Magnéti entre tes bâtiments.',color:'#dba58a',sprite:81},
 {id:'port',name:'Base maritime',icon:'⚓',cost:550,time:6,coast:true,desc:'Commerce maritime, transports Lokhlass et patrouilles Léviator.',color:'#86bed0',sprite:131},
 {id:'fort',name:'Bastion Ronflex',icon:'♜',cost:300,time:4,desc:'Renforce la défense des cases dans un rayon de 7 cases.',color:'#a9c08c',sprite:143},
 {id:'shrine',name:'Sanctuaire légendaire',icon:'✧',cost:1350,time:10,desc:'Prépare les interventions du légendaire de ta team.',color:'#c6a5d8',sprite:150},
 {id:'shield',name:'Station Gardevoir',icon:'◈',cost:1500,time:8,desc:'Intercepte les légendaires adverses dans sa zone de protection.',color:'#a5d9c2',sprite:282}
];
export const STRIKES=[
 {id:'signature',name:'Attaque signature',cost:850,level:1,radius:4,power:1,desc:'Frappe ciblée. Une interception suffit à l’arrêter.'},
 {id:'cataclysm',name:'Déchaînement',cost:2300,level:2,radius:8,power:3,desc:'Grande zone, trois charges de protection à traverser.'},
 {id:'constellation',name:'Assaut multiple',cost:4500,level:3,radius:3,power:1,desc:'Cinq assauts sur les territoires de la team ciblée.'}
];
export const TOOLS=[['attack','⚑','Étendre'],['build','▥','Construire'],['transport','≈','Débarquer'],['patrol','♞','Patrouiller'],['legend','✧','Légendaire'],['diplomacy','♧','Diplomatie']];
export const FACTION=id=>FACTIONS.find(f=>f.id===id)||FACTIONS[0];
export const BUILDING=id=>BUILDINGS.find(b=>b.id===id);
export const STRIKE=id=>STRIKES.find(s=>s.id===id);
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const point=i=>({x:i%WIDTH,y:Math.floor(i/WIDTH)});
export const index=(x,y)=>Math.floor(y)*WIDTH+Math.floor(x);
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
