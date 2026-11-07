from pathlib import Path
from fractions import Fraction
import json,hashlib,struct,wave
import av,numpy as np
from PIL import Image
from sample_renderer import SoundFont
R=Path(__file__).parent;SR=48000;N=30*SR;ID=251;P=R.parent
if not (P/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2').exists():P=Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale')/'cinematics/production'
font=SoundFont(P/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2')
titles={251:'Le Souffle du temps'};sound=np.zeros((2,N),np.float64);events=[]
tracks={0:(48,.12,.55),1:(73,.03,.25),2:(46,.007,.45),3:(8,.006,.45),4:(89,.16,.6),5:(107,.005,.25),6:(52,.12,.55)}
def note(ch,key,t,d=.4,v=40):
 if t<30:events.append((ch,key,t,d,v))
def chord(ch,keys,t,d,v=35):
 for key in keys:note(ch,key,t,d,v)
# Original forest theme, a gradual awakening rather than a borrowed game melody.
for start,keys,d in [(0,[45,52,59,64],3.8),(4,[48,55,62,66],3.8),(8,[46,53,60,65],2.4),(10.5,[43,50,58,62],2.4),(13,[48,55,62,67],2.9),(16,[47,54,61,66],4.6),(21,[48,55,62,67],3.7),(25,[45,52,60,67],3.8)]:
 chord(0,keys,start,d,32 if start<16 else 41);chord(4,keys[:3],start,d,22)
for i,key in enumerate([76,83,79,86,81,88]):note(3,key,.45+i*.58,.42,29+i%2*4)
for i,key in enumerate([72,79,83,86,90,86,83,91]):note(3,key,4.15+i*.43,.31,32+i*2)
# The same forest turns back through winter, autumn and spring.
for start,root in [(8,70),(10.5,67),(13,72)]:
 for i,offset in enumerate([12,7,3,0,5,10]):note(2,root+offset,start+i*.36,.3,30)
for i,key in enumerate([81,79,86,83,88]):note(1,key,13.3+i*.46,.4,39)
# Quick circling arpeggios bring the viewer into the leafy time passage.
for i in range(28):note(2,71+[0,7,3,10,12,5,14,7][i%8],16+i*.165,.21,33+i//7*4)
for i,key in enumerate([78,83,85,90,92,95]):note(3,key,18.1+i*.42,.45,36+i*3)
chord(6,[60,67,74],20.6,3.4,33)
# Celebi's reveal resolves in an airy major melody over harp and flute.
for i,key in enumerate([79,83,86,88,90,88,83,81,86,83,79]):note(1,key,21.25+i*.68,.48,46 if i<6 else 39)
for i in range(22):note(2,72+[0,7,4,11,12,7,16,11][i%8],21.05+i*.36,.34,32)
for i,key in enumerate([91,86,83,79]):note(3,key,27.8+i*.4,.35,32)
score=np.zeros((2,N+SR),np.float32)
for ch,key,t,d,v in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,v,d,attack,release);start=round(t*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for delay,gain in [(.061,.12),(.119,.08),(.233,.04)]:off=round(delay*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];score*=.48/max(.0001,float(np.abs(score).max()));sound+=score*.85
rng=np.random.default_rng(251)
def add(q,t,g=.1,pan=0):
 start=round(t*SR);end=min(N,start+len(q));q=q[:end-start]*g;sound[0,start:end]+=q*np.sqrt((1-pan)/2);sound[1,start:end]+=q*np.sqrt((1+pan)/2)
def noise(d,smooth=25):return np.convolve(rng.normal(0,1,round(d*SR)),np.ones(smooth)/smooth,'same')
def rush(t,d,g,smooth=25):
 q=np.arange(round(d*SR))/SR;add(noise(d,smooth)*np.sin(np.pi*q/d)**2,t,g)
rush(0,29.9,.016,110)
# Synthesised birds in the grove, reversed wind across the season cuts.
for i,at in enumerate([.7,1.6,2.8,3.3,24.7,26.3,28.1]):
 q=np.arange(round(.24*SR))/SR;add(np.sin(2*np.pi*(1600*q+700*q*q))*np.sin(np.pi*q/.24)**2,at,.009,(i%3-1)*.6)
for at in [7.5,10.1,12.6]:rush(at,.9,.065,36)
rush(15.8,5.4,.11,24);rush(20.5,1.1,.1,35)
for at in [4.8,5.9,6.9,14.8,21.1]:
 q=np.arange(round(2.5*SR))/SR;tone=(np.sin(2*np.pi*659.25*q)+.35*np.sin(2*np.pi*1323*q))*.7;add(tone*np.exp(-q*2)*np.minimum(1,q/.007),at,.028)
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(R/'audio'/f'{ID}-cry.ogg')) as inp:
 for f in inp.decode(audio=0):parts.extend(x.to_ndarray() for x in res.resample(f))
parts.extend(x.to_ndarray() for x in res.resample(None));cry=np.concatenate(parts,axis=1);cry*=.4/float(np.abs(cry).max());at=round(22.6*SR);tt=np.arange(N)/SR;duck=np.clip((tt-22.45)/.15,0,1)*np.clip((22.6+cry.shape[1]/SR+.3-tt)/.3,0,1);sound*=1-duck*.8;sound[:,at:at+cry.shape[1]]+=cry
sound*=np.minimum(1,np.arange(N)/(.3*SR))*np.minimum(1,(N-np.arange(N))/(.6*SR));peak=float(np.abs(sound).max());sound*=min(1,.78/peak);pcm=sound.astype(np.float32)
with wave.open(str(R/f'{ID}-soundtrack.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(pcm,-1,1).T*32767).astype('<i2').tobytes())
def vlq(n):
 out=[n&127];n>>=7
 while n:out.insert(0,(n&127)|128);n>>=7
 return bytes(out)
def chunk(items):
 data=b'';last=0
 for t,priority,p in sorted(items,key=lambda a:(a[0],a[1])):tick=round(t*960);data+=vlq(tick-last)+p;last=tick
 data+=b'\0\xff\x2f\0';return b'MTrk'+struct.pack('>I',len(data))+data
chunks=[chunk([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
for ch,(program,_,_) in tracks.items():
 items=[(0,0,bytes([0xc0+ch,program]))]
 for channel,key,t,d,v in events:
  if channel==ch:items.extend([(t,2,bytes([0x90+ch,key,v])),(t+d,1,bytes([0x80+ch,key,0]))])
 chunks.append(chunk(items))
(R/f'{ID}-score.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
(R/f'{ID}-score.json').write_text(json.dumps({'title':titles[ID],'notes':len(events),'duration':30,'original':True,'cryAt':22.6,'instruments':'GeneralUser GS 2.0.3: strings, flute, celesta, harp, airy pad and choir. Original melodies, synthetic forest birds, chimes, reversed wind and portal rush. No official melody or recording reused.'},ensure_ascii=False,indent=2),encoding='utf-8')
dest=R/f'{ID}-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'};v.codec_context.thread_count=4
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
 for i in range(720):
  with Image.open(R/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
times=[1.2,3.2,4.3,5.5,6.7,7.5,8.5,9.7,11.3,12.4,13.7,15.2,16.6,17.8,19.2,20.2,20.8,21.4,22.6,24.5,26.8,28.5];snap={round(t*24):t for t in times};qa=R/'encoded-preview';qa.mkdir(parents=True,exist_ok=True)
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert(f.width,f.height)==(960,540)
  if count in snap:f.to_image().save(qa/f'{snap[count]:.2f}.jpg',quality=94)
  if count==588:f.to_image().save(R/f'{ID}-appearance-v1-poster.png')
  count+=1
 assert count==720
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,at:at+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all() and np.abs(decoded).max()<1;assert dest.stat().st_size<25*1024*1024
info=json.loads((R/'render-info.json').read_text(encoding='utf-8'));report={'species':ID,'shiny':False,'duration':30,'frames':720,'fps':24,'width':960,'height':540,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'music':titles[ID],'cryAt':22.6,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'bodyBounds':info['layout']['bounds'],'checks':'720 monotonic frames and complete unclipped stereo AAC; GS Ball and Ilex Forest shrine; winter/autumn/spring continuity; leafy time portal; silhouette before the coloured reveal; native Celebi cry at 22.6 s; full body framing.'};(R/f'{ID}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False),flush=True)
