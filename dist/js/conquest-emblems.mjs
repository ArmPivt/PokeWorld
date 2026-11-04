// Small map emblems redrawn as paths, shared by the canvas and accessible UI.
import {FACTION,WIDTH as W,HEIGHT as H} from './conquest-data.mjs';
const forms={
 rocket:['M17 9H36Q51 9 51 25Q51 35 40 38L53 56H37L26 39H25V56H12V9ZM25 20V29H35Q39 29 39 25Q39 20 35 20Z'],
 aqua:['M32 5L55 50H42L37 40H27L22 50H9ZM32 23L29 31H35Z','M29 38H35V47H42V52H35V57H29V52H22V47H29Z','M8 49L13 45L18 49L23 45L28 49V55L23 51L18 55L13 51L8 55ZM36 49L41 45L46 49L51 45L56 49V55L51 51L46 55L41 51L36 55Z'],
 magma:['M5 54L18 12L27 28L32 8L38 28L47 12L59 54H45L40 36L33 48L24 36L19 54Z'],
 galactic:['M51 13L43 25Q36 16 25 21Q16 27 21 39Q27 49 38 43V37H30V27H53V49Q39 62 22 54Q3 46 9 26Q18 3 41 8Z'],
 plasma:['M32 4L54 13V35L46 47L32 59L18 47L10 35V13ZM18 19V32L26 44V19ZM32 19V34H39Q46 33 46 26Q46 19 39 19ZM38 24V29H40V24Z'],
 flare:['M32 4Q32 20 22 27Q23 17 18 13Q20 25 11 37Q3 55 26 59Q17 48 27 41Q25 51 34 55Q42 43 35 34Q51 42 44 57Q64 46 51 29Q52 39 45 38Q39 31 42 18Q35 22 32 4Z'],
 aether:['M32 3L58 32L32 61L6 32ZM32 15L18 31L32 48L46 31ZM25 26H39V35H25Z'],
 cosmos:['M32 5L54 18V46L32 59L10 46V18ZM32 15L19 23V41L32 49L45 41V23Z','M4 28H60V36H4Z'],
 skull:['M17 16Q32 4 47 16L54 29L48 43H41V54H35V45H29V54H23V43H16L10 29ZM20 25L22 34H29V28ZM35 28V34H42L44 25ZM30 36L27 41H37L34 36Z'],
 yell:['M5 26L41 10V54L5 38ZM13 29V35L32 43V21ZM15 39H25L31 56H19Z','M47 22L56 17L60 24L50 28ZM49 34L60 36L58 44L47 40Z'],
 star:['M32 3L40 23L62 24L45 38L51 59L32 47L13 59L19 38L2 24L24 23ZM32 20L28 31L16 32L26 39L22 49L32 42L42 49L38 39L48 32L36 31Z']
};
export const emblemPaths=id=>forms[FACTION(id).id];
export function emblemMarkup(id){const f=FACTION(id);return `<svg class="cq-emblem" viewBox="0 0 64 64" role="img" aria-label="Emblème ${f.name}"><g fill="currentColor" fill-rule="evenodd">${emblemPaths(id).map(d=>`<path d="${d}"/>`).join('')}</g></svg>`}
const paths=new Map();
export function drawEmblem(c,id,x,y,size){if(!paths.has(id))paths.set(id,emblemPaths(id).map(d=>new Path2D(d)));c.save();c.translate(x-size/2,y-size/2);c.scale(size/64,size/64);for(const path of paths.get(id)){c.stroke(path);c.fill(path,'evenodd')}c.restore()}
// Anchor every sizeable island inside its territory, at its widest interior.
export function territoryAnchors(owners){const length=W*H,depth=new Uint16Array(length),queue=new Int32Array(length),visited=new Uint8Array(length);let read=0,write=0;
 const each=(i,fn)=>{const x=i%W;if(i>=W)fn(i-W);if(x<W-1)fn(i+1);if(i<length-W)fn(i+W);if(x>0)fn(i-1)};
 for(let i=0;i<length;i++)if(owners[i]>0){let border=i<W||i>=length-W||i%W===0||i%W===W-1;each(i,n=>{if(owners[n]!==owners[i])border=true});if(border){depth[i]=1;queue[write++]=i}}
 while(read<write){const i=queue[read++];each(i,n=>{if(owners[n]===owners[i]&&!depth[n]){depth[n]=depth[i]+1;queue[write++]=n}})}
 const anchors=[];
 for(let start=0;start<length;start++)if(owners[start]>0&&!visited[start]){read=0;write=1;queue[0]=start;visited[start]=1;let sx=0,sy=0,max=0;
  while(read<write){const i=queue[read++];sx+=i%W;sy+=Math.floor(i/W);max=Math.max(max,depth[i]);each(i,n=>{if(!visited[n]&&owners[n]===owners[start]){visited[n]=1;queue[write++]=n}})}
  if(write<16)continue;const cx=sx/write,cy=sy/write;let cell=start,best=-Infinity;
  for(let k=0;k<write;k++){const i=queue[k],score=depth[i]*5-Math.hypot(i%W-cx,Math.floor(i/W)-cy)*.1;if(score>best){best=score;cell=i}}
  anchors.push({owner:owners[start],cell,depth:depth[cell],area:write});
 }return anchors;
}
