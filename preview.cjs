const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const crypto=require('node:crypto'),db=require('./local-db.cjs')(process.env.SOCIAL_TEST_DB||'.preview-social.sqlite');const worker=import('./worker/index.mjs');
const root=path.resolve(__dirname,'dist/client');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.ttf':'font/ttf','.wav':'audio/wav','.webm':'video/webm','.mp4':'video/mp4','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 const cookie=(req.headers.cookie||'').match(/(?:^|; )pw_preview_user=([a-zA-Z0-9_-]{1,100})/),user=cookie?.[1]||crypto.randomUUID();if(!cookie)res.setHeader('Set-Cookie','pw_preview_user='+user+'; Path=/; HttpOnly; SameSite=Lax');
 if(req.url.startsWith('/api/social/')){try{const parts=[];for await(const part of req)parts.push(part);const headers=new Headers(req.headers);for(const k of [...headers.keys()])if(k.startsWith('oai-authenticated-user-'))headers.delete(k);headers.set('oai-authenticated-user-id','local-'+user);const request=new Request('http://127.0.0.1:4173'+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(parts)}),out=await (await worker).default.fetch(request,{DB:db});res.writeHead(out.status,Object.fromEntries(out.headers));res.end(Buffer.from(await out.arrayBuffer()));return}catch(error){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Erreur du carnet local.'}));return}}

 let name;try{name=decodeURIComponent(req.url.split('?')[0])}catch{res.writeHead(400);return res.end()}
 if(name==='/')name='/index.html';
 const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404);return res.end('Not found')}
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   const invalid=()=>{res.writeHead(416,{'Content-Range':'bytes */'+stat.size});res.end()};
   if(!match||(!match[1]&&!match[2])||!stat.size)return invalid();
   if(!match[1]){const length=Number(match[2]);if(!Number.isSafeInteger(length)||length<=0)return invalid();start=Math.max(0,stat.size-length)}
   else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end}
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=stat.size)return invalid();
   status=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+stat.size;
  }
  headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
  if(req.method==='HEAD'||!stat.size)return res.end();
  const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
 });
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

