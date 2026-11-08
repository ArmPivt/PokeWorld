function floorShadow(t,n){if(n<.05)return;const reach=(.5+Math.sin(t*.85)**2*.5)*n;polygon([[345,121],[320,143],[284,177],[254-reach*29,209],[237-reach*35,222],[228-reach*32,217],[250-reach*25,193],[220-reach*20,214],[212-reach*20,207],[242-reach*16,181],[210-reach*10,196],[205-reach*9,189],[271,153],[318,123]],'#070813',n*.35)}
function bedroom(t,n){
 c.save();const close=!IS_DARK?ease((t-1.5)/.6)*(1-ease((t-2.2)/.5)):0;camera(1+ease(t/4)*.08+close*.25,280,90);background('bedroom.png');imageOverlay('bedroom-nightmare.png',n);c.restore();floorShadow(t,n);tendrils(t,n*.7);
 if(n<.4){for(let i=0;i<12;i++){const x=230+hash(i,96)*115,y=140-hash(i,97)*90+Math.sin(t+i)*4;spark(x,y,1,'#ffedc8',(1-n)*.45)}}
 if(t>3.5)fade(ease((t-3.5)/.5),IS_DARK?'#ede6fa':'#160c27');
}
function floatingDream(t,n){const a=1-n;if(a<.02)return;for(let i=0;i<3;i++){const x=[75,392,445][i]+Math.sin(t*.35+i)*4,y=48+Math.sin(t*.65+i)*5+i%2*15;polygon([[x-16,y],[x+14,y-2],[x+19,y+5],[x,y+19],[x-15,y+6]],'#937da6',a*.8);ellipse(x,y,18,4,'#b7daa7',a*.8);for(let j=0;j<4;j++)spark(x-11+j*7,y-2-j%2*2,1,j%2?'#ffe8f5':'#fff7c7',a*.8)}for(let i=0;i<16;i++){const phase=t*.7+i,x=40+hash(i,101)*400+Math.sin(phase*.7)*12,y=30+hash(i,102)*130+Math.cos(phase)*8;if(t>=21&&Math.abs(x-240)<95&&y>65&&y<223)continue;px(x-2,y,2,1,'#fff0d7',a*.8);px(x+1,y-1,2,2,'#eac3f3',a*.8)}}
function fearInsert(t){
 const u=t-12.6;if(!IS_DARK||u<0||u>.85)return false;
 if(u<.12){fade(1,'#02030a');return true}
 c.save();c.translate(Math.round(Math.sin(u*53)*1.5),0);camera(1.66+(u-.12)*.15,270,76);background('bedroom-nightmare.png');c.restore();floorShadow(t,1);if(u>.66)fade(ease((u-.66)/.19),'#10091b');return true;
}
