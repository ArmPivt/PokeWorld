from pathlib import Path
from fractions import Fraction
import sys,json,hashlib,struct,wave
import av,numpy as np
from PIL import Image
from sample_renderer import SoundFont
R=Path(__file__).parent;SR=48000;N=30*SR;ID=int(sys.argv[1]);P=R.parent
if not (P/'lugia-v1').exists():P=Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale')/'cinematics/production'
font=SoundFont(P/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2')
titles={243:'Le Rugissement du tonnerre',244:'Le Souffle du volcan',245:'Le Miroir de la nuit'}
def readwav(p):
 with wave.open(str(p),'rb') as f:assert f.getframerate()==SR and f.getnchannels()==2;return np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).T.astype(np.float32)/32768
lugia=readwav(P/'lugia-v1/lugia-soundtrack.wav');hooh=readwav(P/'hooh-v2/hooh-v2-soundtrack.wav')
sound=np.zeros((2,N),np.float64);sound[:,:round(7.5*SR)]=lugia[:,:round(7.5*SR)];sound[:,8*SR:round(13.5*SR)]=hooh[:,4*SR:round(9.5*SR)]
events=[];tracks={0:(48,.11,.45),1:(73,.03,.24),2:(46,.008,.45),3:(8,.007,.45),4:(60,.065,.3),5:(116,.004,.18),6:(107,.005,.2),7:(52,.12,.5)}
def note(ch,key,t,d=.4,v=45):
 if t<30:events.append((ch,key,t,d,v))
def chord(ch,keys,t,d,v=40):
 for key in keys:note(ch,key,t,d,v)
if ID==245:
 for start,keys in [(14,[45,52,60,64]),(18,[43,50,59,64]),(22,[48,55,62,67]),(26,[45,52,60,67])]:chord(0,keys,start,3.7,34);chord(7,[k+12 for k in keys[:2]],start,3.7,22)
 for i in range(44):note(2,69+[0,7,3,10,12,7,14,10][i%8],14.2+i*.35,.25,29+i%3*3)
 for i,key in enumerate([81,76,83,79,88,86,83,91,86,83,79]):note(1,key,21.9+i*.62,.45,43)
 for i in range(22):note(3,88+[0,7,3,10][i%4],15+i*.63,.3,24)
elif ID==243:
 for start,keys in [(14,[40,47,55,59]),(18,[42,49,57,61]),(22,[40,47,55,64]),(26,[45,52,60,67])]:chord(0,keys,start,3.8,41);chord(4,[k for k in keys[:3]],start,3.2,30)
 for i in range(38):note(0,[52,59,64,67,59,62][i%6],14+i*.4,.18,36+i%2*9);note(5,36 if i%4==0 else 43,14+i*.4,.13,37 if i%4==0 else 23)
 for i,key in enumerate([76,79,83,81,86,83,88,86,79,83,76]):note(4,key,21.9+i*.62,.36,50)
 for at in [16.2,18,19.5,21.25]:chord(4,[40,47,59],at,.35,48)
else:
 for start,keys in [(14,[36,43,51,58]),(18,[38,45,53,60]),(22,[36,43,51,63]),(26,[41,48,56,65])]:chord(0,keys,start,3.8,43);chord(4,keys[:3],start,3.6,37)
 for i in range(31):note(5,36 if i%3==0 else 43,14+i*.5,.24,47 if i%3==0 else 28);note(0,[48,55,58,63,55,51][i%6],14+i*.5,.24,39)
 for i,key in enumerate([63,70,75,73,77,75,82,77,75,70,75]):note(4,key,21.9+i*.62,.43,52)
 for i in range(22):note(6,60+[0,3,7,10][i%4],17+i*.48,.16,29)
score=np.zeros((2,N+SR),np.float32)
for ch,key,t,d,v in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,v,d,attack,release);start=round(t*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for delay,gain in [(.061,.12),(.119,.08),(.233,.04)]:off=round(delay*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];score*=.48/max(.0001,float(np.abs(score).max()));sound[:,14*SR:]+=score[:,14*SR:]*.85
rng=np.random.default_rng(ID)
def add(q,t,g=.1,pan=0):
 start=round(t*SR);end=min(N,start+len(q));q=q[:end-start]*g;sound[0,start:end]+=q*np.sqrt((1-pan)/2);sound[1,start:end]+=q*np.sqrt((1+pan)/2)
def noise(d,smooth=25):return np.convolve(rng.normal(0,1,round(d*SR)),np.ones(smooth)/smooth,'same')
def rush(t,d,g,smooth=25):
 q=np.arange(round(d*SR))/SR;add(noise(d,smooth)*np.sin(np.pi*q/d)**2,t,g)
if ID==245:
 rush(14,15.8,.026,55);rush(19.5,2.7,.07,29)
 for i in range(12):
  q=np.arange(round(.28*SR))/SR;add(np.sin(2*np.pi*(900*q-600*q*q))*np.exp(-q*17),15+i*.52,.01,(i%2*2-1)*.4)
elif ID==243:
 rush(14,15.9,.036,6)
 for at in [16.2,18,19.5,21.25,26.2]:
  q=np.arange(round(1.5*SR))/SR;add((noise(1.5,28)*.7+np.sin(2*np.pi*(47*q-5*q*q))*.3)*np.exp(-q*3)*np.minimum(1,q/.008),at,.15)
else:
 rush(14,15.9,.06,80);rush(18,4.3,.09,42)
 for at in [15,17.2,20.5,21.25,26.2]:
  q=np.arange(round(1.6*SR))/SR;add((noise(1.6,65)+np.sin(2*np.pi*37*q)*.3)*np.exp(-q*2)*np.minimum(1,q/.015),at,.09)
 for i in range(35):
  q=np.arange(round(.025*SR))/SR;add(rng.normal(0,1,len(q))*np.exp(-q*150),14.3+i*.44,.006,(i%3-1)*.4)
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(R/'audio'/f'{ID}-cry.ogg')) as inp:
 for f in inp.decode(audio=0):parts.extend(x.to_ndarray() for x in res.resample(f))
parts.extend(x.to_ndarray() for x in res.resample(None));cry=np.concatenate(parts,axis=1);cry*=.4/float(np.abs(cry).max());at=round(23.1*SR);tt=np.arange(N)/SR;duck=np.clip((tt-22.95)/.15,0,1)*np.clip((23.1+cry.shape[1]/SR+.3-tt)/.3,0,1);sound*=1-duck*.8;sound[:,at:at+cry.shape[1]]+=cry
sound[:,14*SR:]*=np.minimum(1,np.arange(16*SR)/(.3*SR))*np.minimum(1,(16*SR-np.arange(16*SR))/(.6*SR));peak=float(np.abs(sound[:,14*SR:]).max());sound[:,14*SR:]*=min(1,.78/peak);pcm=sound.astype(np.float32)
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
(R/f'{ID}-score.json').write_text(json.dumps({'title':titles[ID],'notes':len(events),'duration':30,'original':True,'cryAt':23.1,'commonIntro':'Lugia v2 imagery and original Lugia/Ho-Oh music, matched fire/storm/resurrection cuts','instruments':'GeneralUser GS 2.0.3; original melodies and synthesized environmental effects; no official music recording or melody reused'},ensure_ascii=False,indent=2),encoding='utf-8')
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
times=[1.2,3.9,4.65,6.8,7.75,9,11.2,12.7,13.75,14.6,16.25,17.4,18.1,19.6,20.5,21.4,22.5,23.2,24.5,27.2,28.5];snap={round(t*24):t for t in times};qa=R/'encoded-preview'/str(ID);qa.mkdir(parents=True,exist_ok=True)
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
for x,y in [(7.6,7.9),(13.6,13.9)]:assert np.sqrt(np.mean(decoded[:,round(x*SR):round(y*SR)]**2))<.002
info=json.loads((R/f'{ID}-render-info.json').read_text(encoding='utf-8'));report={'species':ID,'shiny':False,'duration':30,'frames':720,'fps':24,'width':960,'height':540,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'music':titles[ID],'cryAt':23.1,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'bodyBounds':info['layout']['bounds'],'checks':'720 monotonic decoded frames and complete unclipped stereo AAC; two silent black cuts; native cry; full body framing; no coloured individual before its personal reveal; common fire/storm/rainbow with three silhouettes.'};(R/f'{ID}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False),flush=True)
