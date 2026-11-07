const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fold=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const publicCard=p=>({id:p.id,name:p.name,handle:p.handle,avatar:p.avatar,favorite:p.favorite,stats:JSON.parse(p.stats||'{}')});
const validId=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v);
export default {async fetch(request,env){
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/social/'))return env.ASSETS.fetch(request);
 if(url.pathname==='/api/social/health'&&request.method==='GET'){if(!env.DB)return json({ok:false},503);try{const r=await env.DB.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('pw_trainers','pw_requests','pw_friendships')").first();return json({ok:r.n===3},r.n===3?200:503)}catch{return json({ok:false},503)}}
 const user=request.headers.get('oai-authenticated-user-id');if(!user)return json({error:'Connecte-toi au site pour utiliser le carnet d’amis.'},401);
 if(request.method!=='GET'&&request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'Origine invalide.'},403);
 if(!env.DB)return json({error:'Le carnet en ligne est temporairement indisponible.'},503);
 const db=env.DB,one=(s,...v)=>db.prepare(s).bind(...v).first(),all=async(s,...v)=>(await db.prepare(s).bind(...v).all()).results;
 try{
  const me=await one('SELECT * FROM pw_trainers WHERE user_id=?',user),path=url.pathname.slice('/api/social/'.length);
  if(path==='profile'&&request.method==='POST'){
   if(+(request.headers.get('content-length')||0)>16000)return json({error:'Profil trop volumineux.'},413);const d=await request.json();
   if(me&&!d.update)return json({profile:publicCard(me)});
   const name=String(d.name||'Dresseur').trim().slice(0,20);if(!name||/[\x00-\x1f]/.test(name))return json({error:'Choisis un nom de dresseur valide.'},400);
   const id=me?.id||crypto.randomUUID(),handle=fold(name)+'#'+id.slice(0,5),avatar=/^[a-z0-9_-]{1,80}$/.test(d.avatar)?d.avatar:'red-gen3',favorite=/^\d{1,4}s?$/.test(String(d.favorite))?String(d.favorite):'25';
   const stats={};for(const [k,v]of Object.entries(d.stats||{}).slice(0,15))if(/^[a-zA-Z]{1,25}$/.test(k)&&Number.isFinite(v))stats[k]=Math.max(0,Math.min(1e15,Math.floor(v)));
   await db.prepare('INSERT INTO pw_trainers(user_id,id,name,handle,search_name,avatar,favorite,stats,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,handle=excluded.handle,search_name=excluded.search_name,avatar=excluded.avatar,favorite=excluded.favorite,stats=excluded.stats,updated_at=excluded.updated_at').bind(user,id,name,handle,fold(name),avatar,favorite,JSON.stringify(stats),Date.now()).run();
   return json({profile:publicCard(await one('SELECT * FROM pw_trainers WHERE user_id=?',user))});
  }
  if(!me)return json({error:'Enregistre ta carte de dresseur pour ouvrir ton carnet.',registration:true},404);
  if(path==='state'&&request.method==='GET'){
   const friends=await all('SELECT t.* FROM pw_friendships f JOIN pw_trainers t ON t.id=CASE WHEN f.a=? THEN f.b ELSE f.a END WHERE f.a=? OR f.b=? ORDER BY t.name',me.id,me.id,me.id);
   const requests=await all("SELECT r.*,t.name,t.avatar,t.favorite,t.handle FROM pw_requests r JOIN pw_trainers t ON t.id=CASE WHEN r.sender=? THEN r.recipient ELSE r.sender END WHERE (r.sender=? OR r.recipient=?) AND r.status='pending' ORDER BY r.created_at DESC LIMIT 100",me.id,me.id,me.id);
   return json({profile:publicCard(me),friends:friends.map(publicCard),requests:requests.map(r=>({id:r.id,kind:r.kind,incoming:r.recipient===me.id,name:r.name,avatar:r.avatar,favorite:r.favorite,handle:r.handle,createdAt:r.created_at}))});
  }
  if(path==='search'&&request.method==='GET'){
   const q=fold(url.searchParams.get('q')||'').slice(0,50);if(q.length<2)return json({players:[]});const players=await all('SELECT * FROM pw_trainers WHERE id<>? AND (search_name LIKE ? ESCAPE \'\\\' OR handle=?) ORDER BY name LIMIT 12',me.id,'%'+q.replace(/[\\%_]/g,m=>'\\'+m)+'%',q);return json({players:players.map(publicCard)});
  }
  if(path==='request'&&request.method==='POST'){
   const d=await request.json();if(!validId(d.target)||d.target===me.id)return json({error:'Choisis un autre dresseur.'},400);const target=await one('SELECT id FROM pw_trainers WHERE id=?',d.target);if(!target)return json({error:'Dresseur introuvable.'},404);
   const kind=d.kind==='raid'?'raid':'friend',a=[me.id,d.target].sort();const friend=await one('SELECT a FROM pw_friendships WHERE a=? AND b=?',...a);
   if(kind==='raid'&&!friend)return json({error:'Ce dresseur doit être dans tes amis.'},403);if(kind==='friend'&&friend)return json({error:'Vous êtes déjà amis.'},409);
   const pending=await one("SELECT id FROM pw_requests WHERE status='pending' AND kind=? AND ((sender=? AND recipient=?) OR (sender=? AND recipient=?))",kind,me.id,d.target,d.target,me.id);if(pending)return json({error:'Une demande est déjà en attente.'},409);
   const recent=await one('SELECT COUNT(*) AS n FROM pw_requests WHERE sender=? AND created_at>?',me.id,Date.now()-60000);if(recent.n>=12)return json({error:'Attends un instant avant une autre demande.'},429);
   const room=kind==='raid'&&validId(d.room)?d.room:'';if(kind==='raid'&&!room)return json({error:'Crée un salon avant d’inviter ton ami.'},400);
   await db.prepare("INSERT INTO pw_requests(id,sender,recipient,kind,room,status,created_at) VALUES(?,?,?,?,?,'pending',?)").bind(crypto.randomUUID(),me.id,d.target,kind,room,Date.now()).run();return json({ok:true});
  }
  if(path==='respond'&&request.method==='POST'){
   const d=await request.json();if(!validId(d.id))return json({error:'Demande invalide.'},400);const r=await one("SELECT * FROM pw_requests WHERE id=? AND recipient=? AND status='pending'",d.id,me.id);if(!r)return json({error:'Cette demande n’est plus disponible.'},404);
   const commands=[db.prepare("UPDATE pw_requests SET status=? WHERE id=? AND recipient=? AND status='pending'").bind(d.accept?'accepted':'declined',r.id,me.id)];if(d.accept&&r.kind==='friend'){const pair=[r.sender,me.id].sort();commands.push(db.prepare("INSERT OR IGNORE INTO pw_friendships(a,b) SELECT ?,? WHERE EXISTS(SELECT 1 FROM pw_requests WHERE id=? AND recipient=? AND status='accepted')").bind(...pair,r.id,me.id))}await db.batch(commands);return json({ok:true,room:d.accept&&r.kind==='raid'?r.room:null});
  }
  if(path==='remove'&&request.method==='POST'){const d=await request.json();if(!validId(d.target))return json({error:'Ami invalide.'},400);const pair=[me.id,d.target].sort();await db.batch([db.prepare('DELETE FROM pw_friendships WHERE a=? AND b=?').bind(...pair),db.prepare("UPDATE pw_requests SET status='declined' WHERE status='pending' AND ((sender=? AND recipient=?) OR (sender=? AND recipient=?))").bind(me.id,d.target,d.target,me.id)]);return json({ok:true})}
  return json({error:'Action inconnue.'},404);
 }catch(error){console.error('Social API',error?.message);return json({error:'Le carnet n’a pas pu être actualisé. Réessaie dans un instant.'},500)}
}};
