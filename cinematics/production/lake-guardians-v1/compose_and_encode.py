from pathlib import Path
from fractions import Fraction
import sys,json,hashlib,struct,wave
import av,numpy as np
from PIL import Image
from sample_renderer import SoundFont
R=Path(__file__).parent;SR=48000;N=30*SR;ID=int(sys.argv[1]);P=R.parent
if not (P/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2').exists():P=Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale')/'cinematics/production'
font=SoundFont(P/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2')
titles={480:'Les Liens du savoir',481:'Le Reflet de l’émotion',482:'La Force de la volonté'};sound=np.zeros((2,N),np.float64);events=[]
tracks={0:(48,.12,.55),1:(73,.035,.25),2:(8,.007,.45),3:(46,.008,.45),4:(89,.15,.65),5:(52,.13,.55),6:(116,.004,.25),7:(107,.005,.22),8:(60,.05,.35)}
def note(ch,key,t,d=.4,v=40):
 if t<30:events.append((ch,key,t,d,v))
def chord(ch,keys,t,d,v=35):
 for key in keys:note(ch,key,t,d,v)
# Shared original lake motif and the assembly of the Red Chain.
for start,keys,d in [(0,[48,55,62,67],1.9),(2,[45,52,60,67],1.9),(4,[43,50,58,65],1.9),(6,[51,58,65,70],4.7)]:
 chord(0,keys,start,d,31);chord(4,keys[:3],start,d,20)
for i,key in enumerate([79,86,83,88,81,86]):note(2,key,.35+i*.84,.45,31)
for i,key in enumerate([75,82,87,89,94,89,87,96,94,89]):note(3,key,6.15+i*.4,.32,32+i//3*3)
for start in [6.4,7.6,8.8,10]:chord(5,[63,70,77],start,.8,24)
if ID==480:
 for start,keys,d in [(11,[48,55,62,67],4.7),(16,[45,52,59,64],4.7),(21,[48,55,62,67],3.7),(25,[43,50,59,65],4.3)]:chord(0,keys,start,d,34);chord(4,keys[:3],start,d,23)
 for i in range(45):note(2,76+[0,7,4,11,12,7][i%6],11.1+i*.4,.3,29+i%3*3)
 for i,key in enumerate([79,86,83,88,90,86,83,81,86,79]):note(1,key,21.3+i*.72,.48,41)
elif ID==481:
 for start,keys,d in [(11,[45,52,60,67],4.7),(16,[41,48,57,64],4.7),(21,[48,55,64,71],3.7),(25,[45,52,60,67],4.3)]:chord(0,keys,start,d,35);chord(5,keys[:3],start,d,21)
 for i in range(35):note(3,72+[0,7,4,12,11,7][i%6],11.15+i*.52,.3,33)
 for i,key in enumerate([76,83,81,88,86,83,90,88,81,79]):note(1,key,21.3+i*.72,.5,43)
else:
 for start,keys,d in [(11,[40,47,55,62],4.7),(16,[42,49,57,64],4.7),(21,[40,47,55,64],3.7),(25,[45,52,60,67],4.3)]:chord(0,keys,start,d,40);chord(8,keys[:3],start,d,27)
 for i in range(45):note(0,52+[0,7,3,10,7,12][i%6],11+i*.4,.18,32+i%2*8);note(6,36 if i%4==0 else 43,11+i*.4,.16,36 if i%4==0 else 22)
 for i,key in enumerate([76,79,83,86,81,88,86,83,79,76]):note(8,key,21.3+i*.72,.42,44)
score=np.zeros((2,N+SR),np.float32)
for ch,key,t,d,v in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,v,d,attack,release);start=round(t*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for delay,gain in [(.061,.12),(.119,.08),(.233,.04)]:off=round(delay*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];score[:,:11*SR]*=.44/max(.0001,float(np.abs(score[:,:11*SR]).max()));score[:,11*SR:]*=.5/max(.0001,float(np.abs(score[:,11*SR:]).max()));sound+=score*.85
rng=np.random.default_rng(480)
def add(q,t,g=.1,pan=0):
 start=round(t*SR);end=min(N,start+len(q));q=q[:end-start]*g;sound[0,start:end]+=q*np.sqrt((1-pan)/2);sound[1,start:end]+=q*np.sqrt((1+pan)/2)
def noise(d,smooth=25):return np.convolve(rng.normal(0,1,round(d*SR)),np.ones(smooth)/smooth,'same')
def rush(t,d,g,smooth=25):
 q=np.arange(round(d*SR))/SR;add(noise(d,smooth)*np.sin(np.pi*q/d)**2,t,g)
rush(0,6,.018,90);rush(6,4.9,.035,52)
for at in [.8,2.8,4.8]:
 q=np.arange(round(.7*SR))/SR;add(np.sin(2*np.pi*(700*q+110*q*q))*np.exp(-q*4)*np.minimum(1,q/.01),at,.014)
for i in range(24):
 q=np.arange(round(.11*SR))/SR;add((np.sin(2*np.pi*2100*q)+.3*np.sin(2*np.pi*3810*q))*np.exp(-q*52)*np.minimum(1,q/.003),6.6+i*.1,.007,(i%3-1)*.4)
rush(10.55,.8,.065,35)
rng=np.random.default_rng(ID)
if ID==480:
 rush(11,18.9,.018,110)
 for at in [12.3,15.4,17.2,19.3,21.1,26.2]:
  q=np.arange(round(1.6*SR))/SR;add((np.sin(2*np.pi*784*q)+.3*np.sin(2*np.pi*1571*q))*np.exp(-q*3)*np.minimum(1,q/.008),at,.019)
elif ID==481:
 rush(11,18.9,.023,65)
 for i in range(11):
  for off,g in [(0,.021),(.15,.012)]:
   q=np.arange(round(.18*SR))/SR;add(np.sin(2*np.pi*(69*q-30*q*q))*np.exp(-q*20)*np.minimum(1,q/.01),16+i*.8+off,g)
else:
 rush(11,18.9,.042,45);rush(16.3,4.7,.1,24)
 for at in [17.2,19.1,20.7]:
  q=np.arange(round(.8*SR))/SR;add((noise(.8,30)+np.sin(2*np.pi*52*q)*.2)*np.sin(np.pi*q/.8)**2,at,.065)
rush(20.6,1.1,.085,30)
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(R/'audio'/f'{ID}-cry.ogg')) as inp:
 for f in inp.decode(audio=0):parts.extend(x.to_ndarray() for x in res.resample(f))
parts.extend(x.to_ndarray() for x in res.resample(None));cry=np.concatenate(parts,axis=1);cry*=.4/float(np.abs(cry).max());at=round(22.7*SR);tt=np.arange(N)/SR;duck=np.clip((tt-22.55)/.15,0,1)*np.clip((22.7+cry.shape[1]/SR+.3-tt)/.3,0,1);sound*=1-duck*.8;sound[:,at:at+cry.shape[1]]+=cry
sound*=np.minimum(1,np.arange(N)/(.3*SR))*np.minimum(1,(N-np.arange(N))/(.6*SR));peak=float(np.abs(sound[:,11*SR:]).max());sound[:,11*SR:]*=min(1,.78/peak);pcm=sound.astype(np.float32)
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
(R/f'{ID}-score.json').write_text(json.dumps({'title':titles[ID],'notes':len(events),'duration':30,'original':True,'cryAt':22.7,'sharedIntroSeconds':11,'instruments':'GeneralUser GS 2.0.3: original strings, flute, celesta, harp, pads, choir, horns and taiko. Synthesized water, wind, metallic chain links and magical pulses. No official recording or melody copied.'},ensure_ascii=False,indent=2),encoding='utf-8')
dest=R/f'{ID}-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'};v.codec_context.thread_count=4
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
 for i in range(720):
  with Image.open(R/'frames'/str(ID)/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
times=[1.1,3.1,5.1,6.6,7.8,9.5,10.5,11.5,13.7,15.4,16.6,18.1,19.7,20.8,21.5,22.8,24.5,26.7,28.5];snap={round(t*24):t for t in times};qa=R/'encoded-preview'/str(ID);qa.mkdir(parents=True,exist_ok=True)
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
info=json.loads((R/f'{ID}-render-info.json').read_text(encoding='utf-8'));report={'species':ID,'shiny':False,'duration':30,'frames':720,'fps':24,'width':960,'height':540,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'music':titles[ID],'cryAt':22.7,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'bodyBounds':info['layout']['bounds'],'checks':'720 monotonic decoded frames and complete unclipped stereo AAC; three lakes, 42-link Red Chain and trio silhouettes; correct personal lake, knowledge/emotion/willpower sequence; shadow before colour; native cry at 22.7 s; whole body and tails in frame.'};(R/f'{ID}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False),flush=True)
