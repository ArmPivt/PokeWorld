const hash=(n,k=0)=>{const x=Math.sin(n*73.13+k*19.17)*45873.4;return x-Math.floor(x)},mix=(a,b,p)=>a+(b-a)*p;
export function drawSummonScene(c,t,{color='#80c6e7',rank=1,reduced=false,phase='opening'}={}){
 if(reduced)t=0;const w=c.canvas.width,h=c.canvas.height;c.save();c.setTransform(w/640,0,0,h/360,0,0);c.imageSmoothingEnabled=false;
 for(let y=0;y<220;y+=4){const p=y/220;c.fillStyle=`rgb(${mix(10,61,p)},${mix(24,100,p)},${mix(52,123,p)})`;c.fillRect(0,y,640,4)}
 for(let i=0;i<34;i++){const a=.18+Math.sin(t*.8+i)**2*.5;c.globalAlpha=a;c.fillStyle='#d1e9ff';c.fillRect(Math.floor(hash(i,2)*640),Math.floor(hash(i,3)*146),i%8===0?2:1,1)}c.globalAlpha=1;
 const polygon=(pts,fill)=>{c.fillStyle=fill;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill()};
 for(let layer=0;layer<3;layer++){const base=210+layer*15;for(let i=0;i<7;i++){const x=i*120-80;polygon([[x,base],[x+18,base-30],[x+40,base-38-layer*7],[x+64,base-83+hash(i,layer)*30],[x+82,base-45],[x+140,base]],['#284c66','#24475a','#183d45'][layer])}}
 c.fillStyle='#20463b';c.fillRect(0,224,640,136);c.fillStyle='#2b5540';c.fillRect(0,246,640,114);polygon([[287,240],[346,240],[490,360],[134,360]],'#6e6656');polygon([[304,240],[333,240],[425,360],[212,360]],'#938268');
 for(let i=0;i<60;i++){const x=hash(i,5)*640,y=246+hash(i,6)*114;c.fillStyle=i%4?'#43734b':'#789268';c.fillRect(x,y,3,1)}
 const tree=(x,y,s)=>{c.fillStyle='#172e31';c.fillRect(x-3*s,y,6*s,40*s);for(let j=0;j<4;j++){c.fillStyle=j%2?'#285449':'#1c423d';polygon([[x-24*s+j*3*s,y+18*s-j*13*s],[x,y-22*s-j*9*s],[x+24*s-j*3*s,y+18*s-j*13*s]],c.fillStyle)}};
 for(let i=0;i<12;i++){tree(i*57-8,237+hash(i,7)*10,.65+hash(i,8)*.4)}tree(30,314,1.9);tree(612,314,1.7);
 c.globalAlpha=.17;c.fillStyle=color;c.beginPath();c.ellipse(320,282,100,20,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
 for(let ring=0;ring<3;ring++){c.strokeStyle=color;c.lineWidth=1;c.globalAlpha=.2+ring*.07;c.beginPath();c.ellipse(320,280,64+ring*16+Math.sin(t+ring)*2,10+ring*4,0,0,Math.PI*2);c.stroke()}c.globalAlpha=1;
 for(const side of [-1,1])for(let i=0;i<7;i++){const x=320+side*(105+i*17),y=302+i%2*13;c.fillStyle=i%2?'#3a6544':'#274a39';c.fillRect(x-12,y-12,24,20);c.fillRect(x-7,y-18,15,24);c.fillStyle='#56845a';c.fillRect(x-6,y-16,10,3)}
 const power=phase==='opening'?.3:phase==='charge'?.75:1;
 for(let i=0;i<22+rank*6;i++){const age=(hash(i,9)+t*(.065+rank*.012))%1,a=i*2.399+t*.18,rr=30+age*190,x=320+Math.cos(a)*rr,y=255-age*175+Math.sin(a)*18;c.globalAlpha=Math.sin(age*Math.PI)*power*.75;c.fillStyle=color;c.fillRect(Math.floor(x),Math.floor(y),i%6===0?3:1,i%6===0?3:2)}
 c.globalAlpha=1;if(phase==='charge'||phase==='arrival'){const p=t%2.6/2.6,x=640-p*330,y=-30+p*150;c.strokeStyle=color;c.lineWidth=2;c.globalAlpha=Math.sin(p*Math.PI)*.65;c.beginPath();c.moveTo(x+68,y-27);c.lineTo(x,y);c.stroke()}
 c.restore();
}
