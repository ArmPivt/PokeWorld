import {MOVES} from './combat-moves.mjs';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const moveData=m=>({...MOVES[m?.id||m?.moveId],...m});
export const STATUS={burn:'BRÛ',paralysis:'PAR',poison:'PSN',toxic:'TOX',sleep:'SOM',freeze:'GEL'};
export function initMon(m){m.stages||={};m.volatile||={};m.status||='';m.statusTurns||=0;return m}
export function stage(m,stat,critical=false){const n=clamp(m.stages?.[stat]||0,-6,6);if(critical&&(stat==='atk'||stat==='spa')&&n<0||critical&&(stat==='def'||stat==='spd')&&n>0)return 1;return n>=0?(2+n)/2:2/(2-n)}
export function speed(m,field={}){return(m.speed||1)*stage(m,'speed')*(m.status==='paralysis'&&m.abilityId!==95?.5:1)*(m.abilityId===33&&field.weather==='rain'||m.abilityId===34&&field.weather==='sun'?2:1)}
export function effectiveness(a,d,m,chart){m=moveData(m);let e=(d.types||[]).reduce((n,t)=>n*(chart[m.type]?.[t]??1),1);if((d.abilityId===26&&m.type==='ground')||([11,114].includes(d.abilityId)&&m.type==='water')||([10,31,78].includes(d.abilityId)&&m.type==='electric')||(d.abilityId===18&&m.type==='fire'))e=0;return e}
export function damageEstimate(a,d,move,chart,field={},critical=false){const m=moveData(move);if(m.status)return 0;const e=effectiveness(a,d,m,chart);if(!e)return 0;const atk=(m.special?a.spa:a.atk)*stage(a,m.special?'spa':'atk',critical),def=(m.special?d.spd:d.def)*stage(d,m.special?'spd':'def',critical);let modifier=(a.types.includes(m.type)?a.abilityId===91?2:1.5:1)*e;
 if(!m.special&&[37,74].includes(a.abilityId))modifier*=2;if(a.abilityId===101&&m.power<=60)modifier*=1.5;if(a.hp<=a.max/3&&({65:'grass',66:'fire',67:'water',68:'bug'})[a.abilityId]===m.type)modifier*=1.5;if(d.abilityId===47&&['fire','ice'].includes(m.type))modifier*=.5;
 if(!m.special&&a.status==='burn'&&a.abilityId!==62)modifier*=.5;if(!m.special&&a.status&&a.abilityId===62)modifier*=1.5;
 if(field.weather==='rain')modifier*=m.type==='water'?1.5:m.type==='fire'?.5:1;if(field.weather==='sun')modifier*=m.type==='fire'?1.5:m.type==='water'?.5:1;
 if(!critical&&(m.special?d.volatile?.lightScreen:d.volatile?.reflect))modifier*=.5;if(critical)modifier*=1.5;if(a.volatile?.flashFire&&m.type==='fire')modifier*=1.5;
 let power=m.power;if(!power)power=['low-kick','grass-knot','heavy-slam','heat-crash','electro-ball','gyro-ball','return','frustration','magnitude','present'].includes(m.slug)?80:0;if(['eruption','water-spout','dragon-energy'].includes(m.slug))power=Math.max(1,150*a.hp/a.max);if(['flail','reversal'].includes(m.slug))power=a.hp/a.max<.1?200:a.hp/a.max<.2?150:a.hp/a.max<.35?100:a.hp/a.max<.7?40:20;if(['stored-power','power-trip'].includes(m.slug))power=20+20*Object.values(a.stages||{}).reduce((n,v)=>n+Math.max(0,v),0);if(m.slug==='facade'&&a.status)power*=2;if(m.slug==='hex'&&d.status||m.slug==='venoshock'&&['poison','toxic'].includes(d.status))power*=2;if(m.slug==='brine'&&d.hp<d.max/2)power*=2;if(m.slug==='acrobatics'&&!a.item)power*=2;
 if(m.slug==='counter')return a.lastDamageSpecial?0:(a.lastDamage||0)*2;if(m.slug==='mirror-coat')return a.lastDamageSpecial?(a.lastDamage||0)*2:0;if(m.slug==='metal-burst')return(a.lastDamage||0)*1.5;if(m.slug==='endeavor')return Math.max(0,d.hp-a.hp);if(m.slug==='seismic-toss'||m.slug==='night-shade')return a.level||50;if(m.slug==='dragon-rage')return 40;if(m.slug==='sonic-boom')return 20;if(m.slug==='super-fang'||m.slug==='natures-madness')return Math.max(1,Math.floor(d.hp/2));
 if(!power)return 0;return Math.max(1,Math.floor(((2*(a.level||20)/5+2)*power*atk/Math.max(1,def)/50+2)*modifier));
}
export function calcDamage(a,d,move,chart,random=Math.random,field={}){const m=moveData(move),accuracy=(3+Math.max(0,a.stages?.accuracy||0))/(3+Math.max(0,-(a.stages?.accuracy||0)))*(3+Math.max(0,-(d.stages?.evasion||0)))/(3+Math.max(0,d.stages?.evasion||0));if(!m.alwaysHit&&random()*100>=Math.min(100,m.accuracy*accuracy))return{n:0,text:'L’attaque rate !',effective:1,miss:true};const effective=effectiveness(a,d,m,chart),critical=random()<(m.critRate>=2?.5:m.critRate===1?.125:1/24),base=damageEstimate(a,d,m,chart,field,critical);let n=Math.floor(base*(.85+random()*.15));if(d.abilityId===5&&d.hp===d.max&&n>=d.hp)n=d.hp-1;return{n:effective===0?0:Math.max(m.status?0:base>0?1:0,n),effective,critical,text:effective===0?'Sans effet':(critical?'Coup critique ! ':'')+(effective>1?'Super efficace !':effective<1?'Peu efficace':'')}}
export function describeMove(raw){
 const m=moveData(raw),parts=[],names={atk:'Attaque',def:'Défense',spa:'Atq. spéciale',spd:'Déf. spéciale',speed:'Vitesse',spe:'Vitesse',accuracy:'Précision',evasion:'Esquive'},labels={burn:'Brûlure',paralysis:'Paralysie',poison:'Poison',toxic:'Empoisonnement grave',sleep:'Sommeil',freeze:'Gel',confusion:'Confusion',trap:'Entrave',infatuation:'Attraction'};
 if(m.empty)return 'Choisis une capacité apprenable.';
 if(m.description)parts.push(m.description);
 if(m.status)parts.push('Statut');else parts.push((m.special?'Spéciale':'Physique')+' · '+(m.power||'variable')+' puissance');
 if(m.alwaysHit)parts.push('Ne rate pas');
 if(m.priority)parts.push('Priorité '+(m.priority>0?'+':'')+m.priority);
 if(m.ailment&&m.ailment!=='none'&&m.ailment!=='unknown')parts.push((labels[m.ailment]||m.ailment)+(m.ailmentChance&&!m.status?' · '+m.ailmentChance+' %':''));
 const boosts=m.primaryBoosts||m.boosts||[];
 if(boosts.length)parts.push((m.boostTarget==='self'||m.target===7?'Sur le lanceur : ':'Sur la cible : ')+boosts.map(b=>(names[b.stat]||b.stat)+' '+(b.change>0?'+':'')+b.change).join(', '));
 for(const effect of m.secondaryEffects||[])if(effect.self?.boosts)parts.push((effect.chance??100)+' % : '+Object.entries(effect.self.boosts).map(([k,v])=>(names[k]||k)+' '+(v>0?'+':'')+v).join(', ')+' sur le lanceur');
 if(m.healing)parts.push('Soin '+m.healing+' %');
 if(m.drain>0)parts.push('Drain '+m.drain+' %');
 if(m.drain<0)parts.push('Recul '+(-m.drain)+' %');
 if(m.maxHits>1)parts.push(m.minHits+'–'+m.maxHits+' coups');
 if(m.flinchChance)parts.push('Apeurement '+m.flinchChance+' %');
 return parts.join(' · ');
}
