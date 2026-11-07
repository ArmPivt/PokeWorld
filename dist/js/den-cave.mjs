const noise=(x,y)=>{const n=Math.sin(x*71.19+y*19.71)*43758.5;return n-Math.floor(n)};
export function drawDenCave(c,w,h,t=0){
 c.save();c.setTransform(w/640,0,0,h/320,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#171522';c.fillRect(0,0,640,320);
 const poly=(points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
 const mouth=[[186,272],[178,194],[186,126],[208,85],[249,62],[298,54],[358,56],[407,79],[441,128],[450,198],[444,274]];
 // Large faceted blocks form a continuous rocky wall around the entrance.
 for(let row=0;row<5;row++)for(let col=-1;col<10;col++){const x=col*78+(row%2?35:0),y=row*57-13,n=noise(col,row),shade=34+Math.floor(n*18);poly([[x+7,y],[x+65,y-4],[x+82,y+29],[x+70,y+57],[x+13,y+61],[x-3,y+27]],`rgb(${shade+5},${shade+1},${shade+14})`);poly([[x+7,y],[x+65,y-4],[x+55,y+10],[x+16,y+15],[x-3,y+27]],`rgb(${shade+21},${shade+12},${shade+32})`);poly([[x+70,y+57],[x+82,y+29],[x+64,y+31],[x+54,y+55]],'#1c1a2a');c.fillStyle='#161421';c.fillRect(x+20,y+44,18,2)}
 poly(mouth,'#080912');poly([[218,271],[205,190],[213,132],[241,98],[285,82],[354,86],[396,117],[420,174],[423,271]],'#10101d');poly([[252,272],[244,180],[261,135],[301,116],[346,124],[376,167],[387,273]],'#090b14');
 // Purple reflections trace the arch and illuminate the stone, without a beam.
 poly([[177,195],[187,124],[209,84],[251,61],[243,73],[219,95],[201,135],[194,194],[198,255],[185,272]],'#5b477b');poly([[362,59],[408,82],[440,128],[449,199],[443,267],[429,259],[436,195],[426,134],[398,94]],'#44335f');
 for(let i=0;i<9;i++){const x=80+i*64,y=5+noise(i,2)*25;poly([[x-12,y],[x+15,y],[x+7,y+35+noise(i,3)*20]],i%2?'#2c273b':'#41374f')}
 poly([[0,268],[152,254],[220,268],[320,259],[462,267],[640,254],[640,320],[0,320]],'#373042');
 for(let i=0;i<28;i++){const x=noise(i,7)*640,y=277+noise(i,8)*42;c.fillStyle=i%3?'#4b4057':'#655170';c.fillRect(Math.floor(x),Math.floor(y),18+Math.floor(noise(i,9)*25),2);c.fillStyle='#211e2e';c.fillRect(Math.floor(x)+3,Math.floor(y)+3,14,1)}
 for(const [x,y] of [[145,251],[484,249]]){poly([[x-12,y],[x-8,y-25],[x+1,y-35],[x+8,y-16],[x+15,y]],'#665287');poly([[x-6,y-23],[x+1,y-35],[x+2,y-4]],'#b399da');c.fillStyle='#d1b3ed';c.fillRect(x-1,y-24,2,11)}
 const glow=c.createRadialGradient(320,245,5,320,245,210);glow.addColorStop(0,'#9765be20');glow.addColorStop(.6,'#8e6bb00d');glow.addColorStop(1,'#00000000');c.fillStyle=glow;c.fillRect(0,0,640,320);c.restore();
}
