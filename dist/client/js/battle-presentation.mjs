import {persistCombatLearning} from './combat-learning.mjs';
import {introRaid} from './raid-scenes.mjs';
import {drawBattleScene,drawCondition} from './battle-scene.mjs';
import * as Art from './art.mjs';
import {drawAttack,attackStyle,drawRelease} from './attack-fx.mjs';
import {trainerSrc} from './player-profile.mjs';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function introBattle(){if(this.data.raid)return introRaid.call(this);
 const session=this.session,b=this.data,g=this.g,reduced=g.state.settings.reducedMotion;
 this.busy=true;this.intro={start:performance.now()/1000,duration:reduced?.45:3.4,reduced};g.modeRoot.classList.add('intro-active');
 if(b.kind!=='den'){const div=document.createElement('div');div.className='trainer-intro';div.innerHTML=`<img src="${trainerSrc(g.state.player.avatar)}" alt="Ton dresseur"><div><span class="eyebrow">${b.kind==='duel'?'DUEL EN LIGNE':'TOUR INFERNALE'}</span><h2>${g.escape(b.trainerName||'Le dresseur')} veut se battre !</h2><p>${g.escape(g.state.player.name)}, prépare tes Pokémon.</p></div><img src="${trainerSrc(b.trainerAvatar)}" alt="Dresseur adverse">`;g.modeRoot.append(div)}
 this.caption(b.kind==='den'?'Le boss de l’Antre vous attend…':`${b.trainerName} veut se battre !`);this.updateHud();
 const duration=this.intro.duration;this.sleep((reduced?.09:1.1)*1000).then(()=>{if(!this.active||session!==this.session)return;g.modeRoot.querySelector('.trainer-intro')?.remove();this.caption(b.kind==='den'?'En avant, partenaires !':`${b.trainerName} envoie ${b.boss.name} !`)});
 this.sleep(duration*1000).then(()=>{if(!this.active||session!==this.session)return;this.intro=null;g.modeRoot.classList.remove('intro-active');this.busy=false;this.caption(b.raid?'À toi de jouer. Choisis une capacité.':'À toi de jouer. Choisis une capacité ou un Pokémon.');this.updateHud();if(this.data.raid&&!g.net.guest)this.resolve();if(this.data.kind==='duel'&&this.isHost&&this.raw?.teams.every(t=>this.raw.actions[t.pid]))this.resolveDuel()});
}
export async function playBattle(before,events,final,serial){
 const token=final.id+':'+serial;if(this.seen.has(token))return;this.seen.add(token);this.busy=true;this.intro=null;this.g.modeRoot.classList.remove('intro-active');this.g.modeRoot.querySelector('.trainer-intro')?.remove();this.data=structuredClone(final);this.visual=structuredClone(before);this.updateHud();const session=this.session,reduced=this.g.state.settings.reducedMotion;
 for(const event of events){if(!this.active||session!==this.session)return;
  if(event.kind==='enemy-swap'||event.kind==='swap'){
   let pid,key;if(event.kind==='enemy-swap'){this.visual.boss=structuredClone(event.mon);this.visual.enemyIndex=this.visual.enemyParty?.findIndex(m=>m.key===event.mon.key)??0;pid='boss';key=event.mon.key;this.caption(`${this.data.trainerName||'Le dresseur'} envoie ${event.mon.name} !`)}else{const team=this.visual.teams.find(t=>t.pid===event.pid);if(!team)continue;team.active=team.mons.findIndex(m=>m.key===event.key);pid=event.pid;key=event.key;this.caption(`${team.name||'Le dresseur'} envoie ${this.g.poke(key).name} !`)}
   this.fx={kind:'release',pid,key,start:performance.now()/1000,duration:reduced?.2:.95};await this.sleep(reduced?200:950);this.fx=null;this.updateHud();continue;
  }
  if(event.kind==='ko'){this.caption(`${this.g.poke(event.key).name} est K.O. !`);await this.sleep(reduced?50:180);continue}
  if(event.kind!=='attack'){this.caption(event.text||'Le terrain change.');const t=event.pid==='boss'?this.visual.boss:this.visual.teams.find(t=>t.pid===event.pid)?.mons.find(m=>m.key===event.key);if(t){if(Number.isFinite(event.hp))t.hp=event.hp;if(event.status!==undefined)t.status=event.status;if(event.stages)t.stages=event.stages}if(event.weather){this.visual.field||={};this.visual.field.weather=event.weather}this.fx={kind:'support',pid:event.pid,type:event.kind==='heal'?'grass':event.kind==='boost'?'psychic':'poison',start:performance.now()/1000};this.updateHud();await this.sleep(reduced?65:330);this.fx=null;continue}
  this.fx={...event,timeScale:reduced?.22:1,start:performance.now()/1000};this.caption(`${this.g.poke(event.sourceKey).name} utilise ${event.move} !`);this.g.audio.attack(event.type);
  const duration=attackStyle(event).duration;await this.sleep(duration*(reduced?.22:1)*.67*1000);if(!this.active||session!==this.session)return;
  const target=event.target==='boss'?this.visual.boss:this.visual.teams.find(t=>t.pid===event.target)?.mons.find(m=>m.key===event.targetKey);if(target)target.hp=event.hp;if(event.text)this.caption(event.text);this.updateHud();await this.sleep(duration*(reduced?.22:1)*.33*1000+(reduced?35:100));
 }
 if(!this.active||session!==this.session)return;this.fx=null;final.teams=final.teams.filter(t=>!this.departed.has(t.pid));const queued=this.data.kind==='duel'?{}:this.data.actions;this.data=structuredClone(final);Object.assign(this.data.actions,queued);this.visual=structuredClone(final);persistCombatLearning(this.g,this.data,this.me().pid);this.busy=false;this.updateHud();if(final.over)this.finishResult();else this.caption(this.data.pendingReplacements?.length?'Choisis ton prochain Pokémon.':this.data.raid?'À toi de jouer. Choisis une capacité.':'À toi de jouer. Choisis une capacité ou un Pokémon.');if(!final.over){if(this.afterPlayback)this.afterPlayback();else if(this.data.kind==='den'&&Object.keys(this.data.actions).length)this.resolve()}
}
export function drawBattle(time){
 const c=this.ctx,w=this.canvas.width,h=this.canvas.height,p=this.positions(),reduced=this.g.state.settings.reducedMotion;
 drawBattleScene(c,w,h,this.data.kind==='den'?'cavern':this.data.kind==='tower'&&this.data.floor%3===0?'moon':'garden',time,{weather:this.visual.field?.weather,reducedMotion:reduced,positions:p,playerAvatar:this.g.state.player.avatar,enemyAvatar:this.data.trainerAvatar});
 for(const pid of['boss',...this.visual.teams.map(t=>t.pid)]){const a=p[pid];c.fillStyle='#10232f66';c.beginPath();c.ellipse(a.x,a.y+(pid==='boss'&&this.data.kind==='den'?28:12),pid==='boss'?(this.data.kind==='den'?50:21):18,pid==='boss'&&this.data.kind==='den'?14:6,0,0,7);c.fill();c.strokeStyle=pid==='boss'?'#886047':'#8f876d';c.lineWidth=1;c.stroke()}
 const fx=this.fx,elapsed=fx?(time-fx.start)/(fx.timeScale||1):0,intro=this.intro,elapsedIntro=intro?time-intro.start:0;
 const fromFor=pid=>({x:p[pid].x+(pid==='boss'?w*.2:-w*.18),y:p[pid].y+(pid==='boss'?-40:55)});
 const actor=(pid,mon,size,dir)=>{const point={...p[pid]};let kind='Idle',factor=1,release=null;
  if(intro&&!(pid==='boss'&&this.data.kind==='den')){const start=intro.reduced?(pid==='boss'?.05:.15):(pid==='boss'?1.05:2.1),duration=intro.reduced?.25:1;release=(elapsedIntro-start)/duration;factor=clamp((release-.48)/.32)}
  if(fx?.kind==='release'&&fx.pid===pid){release=elapsed/fx.duration;factor=clamp((release-.48)/.32)}
  if(release!==null&&release>=0&&release<=1)drawRelease(c,fromFor(pid),point,release,{reducedMotion:reduced});
  if(fx?.kind==='attack'){const duration=attackStyle(fx).duration;if(fx.source===pid&&elapsed<duration*.65){kind='Attack';if(!reduced){const target=p[fx.target];if(target){point.x+=(target.x-point.x)*Math.sin(clamp(elapsed/(duration*.65))*Math.PI)*.04;point.y+=(target.y-point.y)*Math.sin(clamp(elapsed/(duration*.65))*Math.PI)*.04}}}if(fx.target===pid&&elapsed>duration*.67&&elapsed<duration){kind='Hurt';c.globalAlpha=reduced?1:Math.floor(elapsed*18)%2?.55:1}}
  if(factor>0&&mon.hp>0){const bob=reduced?0:Math.sin(time*2+pid.length)*1.1;Art.drawMon(c,mon.appearanceKey||mon.key,point.x,point.y+bob,size*factor,kind,dir,time,{progress:kind==='Attack'?clamp(elapsed/(attackStyle(fx).duration*.65)):kind==='Hurt'?clamp((elapsed/attackStyle(fx).duration-.67)/.33):undefined});drawCondition(c,mon,point.x,point.y,size,time,reduced)}c.globalAlpha=1;
 };
 actor('boss',this.visual.boss,p.bossSize,0);for(const t of this.visual.teams)actor(t.pid,t.mons[t.active],p.allySize,4);
 if(fx?.kind==='attack'&&p[fx.source]&&p[fx.target]){drawAttack(c,fx,p[fx.source],p[fx.target],elapsed,{reducedMotion:reduced});const duration=attackStyle(fx).duration;if(elapsed>duration*.67&&elapsed<duration+.1)Art.hitEffect(c,{x:p[fx.target].x,y:p[fx.target].y,life:Math.max(.01,duration+.1-elapsed),max:duration*.43,type:fx.type,n:fx.amount,text:fx.amount?'−'+fx.amount:fx.text},0,0)}
 if(fx?.kind==='support'&&p[fx.pid])drawAttack(c,{slug:'support-aura',type:fx.type,special:true},p[fx.pid],p[fx.pid],elapsed,{reducedMotion:reduced,scale:.55});
 const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#0b101a66');shade.addColorStop(.5,'#0b101a00');shade.addColorStop(1,'#0b101a99');c.fillStyle=shade;c.fillRect(0,0,w,h);
}
