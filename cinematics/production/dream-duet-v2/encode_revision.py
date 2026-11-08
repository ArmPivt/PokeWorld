from pathlib import Path
from fractions import Fraction
import sys,json,hashlib,wave
import av,numpy as np
from PIL import Image
R=Path(__file__).parent;ID=int(sys.argv[1]);SR=48000;N=30*SR;dark=ID==491
title='Le Rêve dévoré — cauchemar' if dark else 'Le Rêve retrouvé — délivrance'
with wave.open(str(R.parent/'dream-duet-v1'/f'{ID}-soundtrack.wav')) as f:original=np.frombuffer(f.readframes(f.getnframes()),'<i2').reshape(-1,2).T.astype(np.float32)/32768
sound=original.copy();rng=np.random.default_rng(491)
def n_at(t):
 p=max(0,min(1,(t-5)/19));p=p*p*(3-2*p);return p if dark else 1-p
def add(q,t,g=.1,pan=0):
 start=round(t*SR);end=min(N,start+len(q));q=q[:end-start]*g;sound[0,start:end]+=q*np.sqrt((1-pan)/2);sound[1,start:end]+=q*np.sqrt((1+pan)/2)
for i in range(42):
 t=.2+i*.68;n=n_at(t+.2);q=np.arange(round(.48*SR))/SR
 add((np.sin(2*np.pi*47*q)+.3*np.sin(2*np.pi*53*q))*np.exp(-q*12)*np.minimum(1,q/.01),t,.035*n)
 # Filtered breathlike noise; no sampled speech or official music.
 noise=np.convolve(rng.normal(0,1,len(q)),np.ones(22)/22,'same');env=np.sin(np.pi*q/.48)**2
 add(noise*env*(.5+.5*np.sin(2*np.pi*13*q)),t,.045*n,(i%3-1)*.5)
def knock(t,g=.12):
 q=np.arange(round(.23*SR))/SR;noise=rng.normal(0,1,len(q));hit=(np.sin(2*np.pi*94*q)+.3*noise)*np.exp(-q*27)*np.minimum(1,q/.0015);add(hit,t,g)
if dark:
 # One sudden cut with a real pause before the window apparition, not repeated flashes.
 start=round(12.6*SR);stop=round(12.72*SR);sound[:,start:stop]=0
 knock(12.74,.18);knock(12.98,.1)
 q=np.arange(round(.65*SR))/SR;add((np.sin(2*np.pi*(118*q-50*q*q))+.35*np.sin(2*np.pi*183*q))*np.sin(np.pi*q/.65)**2,12.73,.1)
 for t in [15.8,17.4,19.2]:knock(t,.045)
else:
 knock(1.72,.14);knock(1.99,.09)
 # Relief is perceptible: the added nightmare layer vanishes with healing.
 for t in [14.7,17.1,20.2]:
  q=np.arange(round(1.0*SR))/SR;add((np.sin(2*np.pi*880*q)+.2*np.sin(2*np.pi*1320*q))*np.exp(-q*5)*np.minimum(1,q/.02),t,.022)
# Keep the original cry section unmodified and prominent.
sound[:,round(22.45*SR):round(25.5*SR)]=original[:,round(22.45*SR):round(25.5*SR)]
assert float(np.abs(sound).max())<.9;pcm=sound.astype(np.float32)
with wave.open(str(R/f'{ID}-soundtrack.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(pcm,-1,1).T*32767).astype('<i2').tobytes())
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(R/'audio'/f'{ID}-cry.ogg')) as inp:
 for f in inp.decode(audio=0):parts.extend(x.to_ndarray() for x in res.resample(f))
parts.extend(x.to_ndarray() for x in res.resample(None));cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());at=round(22.7*SR)
(R/f'{ID}-sound-design-v2.json').write_text(json.dumps({'title':title,'originalMusicFrom':'dream-duet-v1','revision':2,'horrorCut':[12.6,13.45] if dark else [1.5,2.7],'realAudioDrop':[12.6,12.72] if dark else None,'cryAt':22.7,'added':'breathlike filtered noise, detuned subbass, heartbeat pulses, window knocks, original synthesized stinger; healing bells for Cresselia'},ensure_ascii=False,indent=2),encoding='utf8')
dest=R/f'{ID}-appearance-v2.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'23','preset':'medium','maxrate':'650k','bufsize':'1300k'};v.codec_context.thread_count=4
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=128000;cursor=0
 for i in range(720):
  with Image.open(R/'frames'/str(ID)/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
times=[1.3,1.9,3.1,4.8,7,9.8,12.5,12.8,13,13.3,14.8,16.8,18.7,20.2,21.7,23.5,26.5,28.7];snap={round(t*24):t for t in times};qa=R/'encoded-preview'/str(ID);qa.mkdir(parents=True,exist_ok=True)
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time
  if count in snap:f.to_image().save(qa/f'{snap[count]:.2f}.jpg',quality=94)
  if count==31:f.to_image().save(R/f'{ID}-appearance-v2-poster.png')
  count+=1
 assert count==720
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,at:at+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all() and np.abs(decoded).max()<1
report={'species':ID,'duration':30,'frames':720,'fps':24,'width':960,'height':540,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'music':title,'cryAt':22.7,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'revealAt':21,'bodyBounds':json.loads((R/f'{ID}-render-info.json').read_text())['layout']['bounds'],'pairedCuts':[0,4,9,14,18,21],'revision':2}
(R/f'{ID}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False),flush=True)
