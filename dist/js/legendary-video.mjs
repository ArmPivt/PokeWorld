// Real encoded media playback. Story completion depends on ended/explicit skip,
// never on an artificial animation timer or the storyboard's estimated duration.
export class LegendaryVideo {
 constructor(g){this.g=g;this.active=false;this.userPaused=false}
 play(media,{key,title,replay=false,onTime=()=>{}}){
  if(this.active)this.finish('replaced');this.active=true;this.media=media;this.key=key;this.userPaused=!!media.manualStart;this.state='loading';this.onTime=onTime;this.abort=new AbortController();const signal=this.abort.signal,g=this.g;
  g.audio.music.hold('legendary-video',true);
  g.openModal(`<section class="legendary-video" aria-label="${g.escape(title)}"><video playsinline preload="auto" ${media.poster?`poster="${g.escape(media.poster)}"`:''} aria-label="${g.escape(title)}"></video><header><span>${replay?'SOUVENIR LÉGENDAIRE':'PREMIÈRE RENCONTRE'}</span><div><button data-act="toggle-music" data-music-icon aria-label="Son de la cinématique">♫</button><button data-act="legendary-pause" aria-label="Mettre la cinématique en pause">Ⅱ</button><button data-act="legendary-skip">${replay?'Fermer':'Passer'} →</button></div></header><div class="video-message" role="status"><p>Préparation de la rencontre…</p><button data-act="legendary-video-play" hidden>Lire la cinématique</button><button data-act="legendary-video-retry" hidden>Réessayer</button><button data-act="legendary-video-continue" hidden>Continuer vers mon Pokémon</button></div><div class="legendary-progress"><i></i></div></section>`,{locked:true,className:'legendary-dialog'});
  this.root=g.modal.querySelector('.legendary-video');this.video=this.root.querySelector('video');const v=this.video;v.muted=!g.state.settings.music;v.volume=g.state.settings.musicVolume??.22;
  const listen=(event,fn)=>v.addEventListener(event,fn,{signal});
  listen('playing',()=>{this.state='playing';this.message('',false);this.updatePause()});
  listen('waiting',()=>{if(!this.userPaused){this.state='buffering';this.message('Chargement de la vidéo…',true)}});
  listen('pause',()=>this.updatePause());
  listen('timeupdate',()=>{this.onTime(v.currentTime,v.duration);this.root.querySelector('.legendary-progress i').style.width=Number.isFinite(v.duration)?Math.min(100,v.currentTime/v.duration*100)+'%':'0%'});
  listen('ended',()=>this.finish('ended'));
  listen('error',()=>this.fail());
  listen('loadedmetadata',()=>{this.g.cinema&&(this.g.cinema.duration=v.duration)});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.hiddenPaused=!v.paused;v.pause()}else if(this.hiddenPaused&&!this.userPaused){this.hiddenPaused=false;this.start()}},{signal});
  document.addEventListener('keydown',e=>{if(e.code==='Escape'){e.preventDefault();this.finish('skipped');return}if(e.code==='Space'&&!/INPUT|BUTTON/.test(e.target.tagName)){e.preventDefault();this.pause()}},{signal});
  const syncVolume=()=>{if(!this.active)return;v.muted=!g.state.settings.music;v.volume=g.state.settings.musicVolume??.22;this.volumeFrame=requestAnimationFrame(syncVolume)};this.volumeFrame=requestAnimationFrame(syncVolume);
  this.completion=new Promise(resolve=>this.resolve=resolve);v.src=media.src;v.load();this.loadTimer=setTimeout(()=>{if(this.active&&v.readyState<2)this.fail()},20000);
  if(media.manualStart){this.state='paused';this.message('Animations réduites : lance la vidéo si tu souhaites la regarder.',true);this.root.querySelector('[data-act="legendary-video-play"]').hidden=false}else this.start();
  return this.completion;
 }
 message(text,visible){const el=this.root.querySelector('.video-message');el.hidden=!visible;el.querySelector('p').textContent=text}
 updatePause(){const b=this.root.querySelector('[data-act="legendary-pause"]');b.textContent=this.video.paused?'▶':'Ⅱ';b.setAttribute('aria-label',this.video.paused?'Reprendre la cinématique':'Mettre la cinématique en pause')}
 async start(){if(!this.active)return;this.userPaused=false;try{await this.video.play();if(this.active){clearTimeout(this.loadTimer);this.root.querySelector('[data-act="legendary-video-play"]').hidden=true}}catch{if(!this.active||this.video.error)return;if(this.userPaused||document.hidden){this.updatePause();return}this.state='blocked';this.message('Appuie sur Lire pour démarrer la cinématique.',true);this.root.querySelector('[data-act="legendary-video-play"]').hidden=false}}
 pause(){if(!this.active)return;if(this.video.paused){this.start()}else{this.userPaused=true;this.state='paused';this.video.pause();this.message('Cinématique en pause',true)}}
 fail(){if(!this.active)return;clearTimeout(this.loadTimer);this.state='error';this.video.pause();this.message('La vidéo n’a pas pu être chargée. Ton Pokémon est déjà sauvegardé ; sa rencontre restera disponible.',true);for(const act of['legendary-video-retry','legendary-video-continue'])this.root.querySelector(`[data-act="${act}"]`).hidden=false}
 retry(){if(!this.active)return;for(const act of['legendary-video-retry','legendary-video-continue'])this.root.querySelector(`[data-act="${act}"]`).hidden=true;this.message('Chargement de la vidéo…',true);this.state='loading';this.video.load();this.start()}
 finish(reason='skipped'){if(!this.active)return;this.active=false;clearTimeout(this.loadTimer);cancelAnimationFrame(this.volumeFrame);this.abort?.abort();this.video.pause();this.video.removeAttribute('src');this.video.load();this.g.audio.music.hold('legendary-video',false);const resolve=this.resolve;this.resolve=null;resolve?.({reason,completed:reason==='ended'||reason==='skipped'})}
}
