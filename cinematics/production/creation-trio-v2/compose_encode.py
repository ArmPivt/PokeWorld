from pathlib import Path
from fractions import Fraction
import sys,json,hashlib,wave
import av,numpy as np
from PIL import Image
from sample_renderer import SoundFont
R=Path(__file__).parent;ID=int(sys.argv[1]);SR=48000;N=32*SR
font=SoundFont(Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale\cinematics\production\rayquaza\v4-musique-originale\GeneralUser-GS.sf2'))
title={483:'Le Premier Battement',484:'Au-delà des frontières',487:'De l’autre côté'}[ID]
sound=np.zeros((2,N),np.float32);score=np.zeros((2,N+SR),np.float32);events=[]
tracks={0:(48,.04,.35),1:(46,.01,.45),2:(8,.005,.35),3:(52,.08,.6),4:(60,.025,.3),5:(43,.08,.4),6:(116,.003,.16),7:(89,.08,.4)}
def note(ch,key,t,d=.5,v=38):events.append((ch,key,t,d,v))
def chord(ch,keys,t,d,v=30):
 for key in keys:note(ch,key,t,d,v)
# Distinct original developments. No official theme or melody is reused.
if ID==483:
 for i in range(24):
  t=5+i*.75;chord(0,[[38,45,50,57],[34,41,46,53],[36,43,48,55],[33,40,45,52]][i//6%4],t,.7,30)
  note(2,[74,81,77,86,79,84,81,77][i%8],t+.08,.3,34);note(6,36 if i%4==0 else 43,t,.12,24)
 for i,key in enumerate([62,69,65,74,72,69,77,74]):note(4,key,24+i*.7,.6,50)
elif ID==484:
 for i in range(30):
  t=5+i*.6;note(1,[60,67,72,76,79,83,76,72][i%8],t,.52,38);note(2,[84,91,88,95][i%4],t+.2,.35,24)
 for t,keys in [(5,[36,43,52,59]),(10,[33,40,48,55]),(15,[41,48,57,64]),(19,[38,45,53,60])]:chord(0,keys,t,4.2,31);chord(7,keys,t,4.5,25)
 for i,key in enumerate([76,79,83,88,86,83,90,88]):note(4,key,24+i*.72,.6,44)
else:
 for t,keys in [(7,[30,37,42,49]),(12,[29,36,42,48]),(17,[27,34,40,46]),(21,[26,33,39,45])]:chord(5,keys,t,3.5,32);chord(7,keys,t,3.6,29)
 for i in range(24):note(0,[66,60,65,59,63,57][i%6],7.4+i*.65,.5,26);note(6,36,7.4+i*.65,.17,28 if i%3==0 else 15)
 for i,key in enumerate([50,57,60,65,63,60,67,65]):note(4,key,24+i*.72,.65,47)
for t,keys in [(24,[38,45,50,57] if ID==483 else [36,43,52,59] if ID==484 else [26,33,38,45]),(28,[34,41,50,57] if ID==483 else [33,40,48,55] if ID==484 else [27,34,38,45])]:chord(0,keys,t,3.5,40);chord(3,[k+12 for k in keys],t,3.2,32)
for ch,key,t,d,v in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,v,d,attack,release);start=round(t*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for delay,gain in [(.081,.13),(.173,.09),(.313,.05)]:off=round(delay*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];score*=.37/max(.0001,float(np.abs(score).max()));sound+=score
# Reuse the approved five-second Red Chain musical passage from the lake film.
source=R.parent/'lake-guardians-v2/480-soundtrack.wav'
with wave.open(str(source)) as f:opening=np.frombuffer(f.readframes(f.getnframes()),'<i2').reshape(-1,2).T.astype(np.float32)/32768
opening=opening[:,6*SR:11*SR]
if ID!=487:sound[:,:opening.shape[1]]+=opening*.85
else:
 sound[:,:round(2.4*SR)]+=opening[:,:round(2.4*SR)]*.85
 # Falling pitch and slowing playback, then a real musical drop/silence.
 n=round(1.6*SR);q=np.linspace(1,.18,n);indices=np.minimum(opening.shape[1]-1,round(2.4*SR)+np.cumsum(q)).astype(int);fall=opening[:,indices]*np.linspace(.85,0,n);sound[:,round(2.4*SR):4*SR]+=fall
rng=np.random.default_rng(ID)
def add(q,t,g=.1,pan=0):
 start=round(t*SR);end=min(N,start+len(q));q=q[:end-start]*g;sound[0,start:end]+=q*np.sqrt((1-pan)/2);sound[1,start:end]+=q*np.sqrt((1+pan)/2)
def rush(t,d,g,smooth=25):
 q=np.arange(round(d*SR))/SR;noise=np.convolve(rng.normal(0,1,len(q)),np.ones(smooth)/smooth,'same');add(noise*np.sin(np.pi*q/d)**2,t,g)
if ID==483:
 for i in range(28):
  t=5+i*.64;q=np.arange(round(.1*SR))/SR;add(np.sin(2*np.pi*(1800*q+3000*q*q))*np.exp(-q*55),t,.025,(-1)**i*.45)
 rush(14,4.5,.12,40)
elif ID==484:
 for at in [5.3,9,12,14.2,18,21.2]:rush(at,1.7,.12,60)
else:
 rush(6.65,4.4,.09,110);rush(12,4.7,.1,70);rush(17.5,2.8,.13,90);rush(21,2.6,.16,35)
 for at in [7,12,21]:
  q=np.arange(round(1.4*SR))/SR;add(np.sin(2*np.pi*(42*q-8*q*q))*np.sin(np.pi*q/1.4)**2,at,.09)
 sound[:,4*SR:round(6.5*SR)]=0
rush(23.4,.9,.17,30)
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(R/'audio'/f'{ID}-cry.ogg')) as inp:
 for f in inp.decode(audio=0):parts.extend(x.to_ndarray() for x in res.resample(f))
parts.extend(x.to_ndarray() for x in res.resample(None));cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());at=round(25.4*SR);tt=np.arange(N)/SR;duck=np.clip((tt-25.2)/.2,0,1)*np.clip((25.4+cry.shape[1]/SR+.3-tt)/.3,0,1);sound*=1-duck*.88;sound[:,at:at+cry.shape[1]]+=cry
sound*=np.minimum(1,np.arange(N)/(.2*SR))*np.minimum(1,(N-np.arange(N))/(.6*SR));sound*=min(1,.85/max(.0001,float(np.abs(sound).max())));pcm=sound.astype(np.float32)
with wave.open(str(R/f'{ID}-soundtrack.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(pcm,-1,1).T*32767).astype('<i2').tobytes())
(R/f'{ID}-score.json').write_text(json.dumps({'title':title,'original':True,'notes':len(events),'duration':32,'sharedRedChainSource':'480-soundtrack.wav, 6..11 s','giratinaSilence':[4,6.5] if ID==487 else None,'cryAt':25.4},ensure_ascii=False,indent=2),encoding='utf8')
dest=R/f'{ID}-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'24','preset':'medium','maxrate':'650k','bufsize':'1300k'};v.codec_context.thread_count=4
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=128000;cursor=0
 for i in range(768):
  with Image.open(R/'frames'/str(ID)/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
times=[1.5,3.5,4.6,5.6,6.7,7.5,10.3,12.8,15.1,18.2,20.5,22.5,24.8,25.8,28.5,30.5];snap={round(t*24):t for t in times};qa=R/'encoded-preview'/str(ID);qa.mkdir(parents=True,exist_ok=True)
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time
  if count in snap:f.to_image().save(qa/f'{snap[count]:.2f}.jpg',quality=94)
  if count==24:f.to_image().save(R/f'{ID}-appearance-v1-poster.png')
  count+=1
 assert count==768
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,at:at+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all() and np.abs(decoded).max()<1
silence=float(np.abs(decoded[:,round(4.2*SR):round(6.2*SR)]).max()) if ID==487 else None
if ID==487:assert silence<.001
report={'species':ID,'duration':32,'frames':768,'fps':24,'width':960,'height':540,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'music':title,'cryAt':25.4,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'revealAt':24,'giratinaSilentPeak':silence,'bodyBounds':json.loads((R/f'{ID}-render-info.json').read_text())['layout']['bounds']}
(R/f'{ID}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False),flush=True)
