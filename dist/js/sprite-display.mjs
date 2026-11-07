const cache=new WeakMap();
// Presentation only: discard detached registration pixels, then fit the actual
// character bounds. Gameplay coordinates and original sprite assets stay intact.
export function cleanSprite(image,rect={x:0,y:0,w:image.naturalWidth,h:image.naturalHeight}){
 const key=[rect.x,rect.y,rect.w,rect.h].join(':'),entries=cache.get(image)||new Map();cache.set(image,entries);if(entries.has(key))return entries.get(key);
 try{const c=document.createElement('canvas');c.width=rect.w;c.height=rect.h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(image,rect.x,rect.y,rect.w,rect.h,0,0,rect.w,rect.h);const data=x.getImageData(0,0,c.width,c.height),a=data.data,w=c.width,h=c.height,visited=new Uint8Array(w*h),parts=[];
 for(let n=0;n<w*h;n++){if(visited[n]||a[n*4+3]<32)continue;const queue=[n];visited[n]=1;let left=w,right=0,top=h,bottom=0;for(let i=0;i<queue.length;i++){const p=queue[i],px=p%w,py=Math.floor(p/w);left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=px+dx,yy=py+dy,q=yy*w+xx;if(xx>=0&&xx<w&&yy>=0&&yy<h&&!visited[q]&&a[q*4+3]>=32){visited[q]=1;queue.push(q)}}}parts.push({pixels:queue,left,right,top,bottom})}
 parts.sort((a,b)=>b.pixels.length-a.pixels.length);const main=parts[0];if(!main)return image;let left=w,right=0,top=h,bottom=0;
 for(const p of parts){const gap=Math.max(main.left-p.right-1,p.left-main.right-1,main.top-p.bottom-1,p.top-main.bottom-1,0),drop=p!==main&&p.pixels.length<=Math.max(16,main.pixels.length*.04)&&gap>2;if(drop){for(const n of p.pixels)a[n*4+3]=0}else{left=Math.min(left,p.left);right=Math.max(right,p.right);top=Math.min(top,p.top);bottom=Math.max(bottom,p.bottom)}}x.putImageData(data,0,0);const out=document.createElement('canvas');out.width=right-left+5;out.height=bottom-top+5;out.getContext('2d').drawImage(c,left,top,right-left+1,bottom-top+1,2,2,right-left+1,bottom-top+1);entries.set(key,out);return out;
 }catch{return image}
}
export function fitSprite(ctx,image,x,y,size){const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height,scale=size/Math.max(w,h);ctx.imageSmoothingEnabled=false;ctx.drawImage(image,Math.round(x-w*scale/2),Math.round(y-h*scale/2),w*scale,h*scale)}
let installed=false;
export function installSpriteDisplay(){if(installed)return;installed=true;document.addEventListener('load',event=>{const im=event.target;if(im.tagName!=='IMG'||!/(?:^|\/)assets\/pmd\/\d+\/icon(?:-shiny)?\.png(?:\?.*)?$/.test(im.getAttribute('src')||'')||!im.naturalWidth)return;const clean=cleanSprite(im);if(clean!==im)im.src=clean.toDataURL()},{capture:true})}
