from pathlib import Path
from fractions import Fraction
import sys,json,hashlib,wave
import av,numpy as np
from PIL import Image
from sample_renderer import SoundFont
R=Path(__file__).parent;ID=int(sys.argv[1]);SR=48000;N=30*SR;dark=ID==491
font=SoundFont(Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale\cinematics\production\rayquaza\v4-musique-originale\GeneralUser-GS.sf2'))
title='Le Rêve dévoré' if dark else 'Le Rêve retrouvé';sound=np.zeros((2,N),np.float32);score=np.zeros((2,N+SR),np.float32);events=[]
tracks={0:(48,.05,.4),1:(8,.008,.4),2:(46,.008,.4),3:(73,.03,.3),4:(52,.08,.5),5:(89,.08,.4),6:(43,.05,.4)}
def n_at(t):
 p=max(0,min(1,(t-5)/19));p=p*p*(3-2*p);return p if dark else 1-p
def note(ch,key,t,d=.5,v=33):events.append((ch,key,t,d,v))
def chord(ch,keys,t,d,v=28):
 for key in keys:note(ch,key,t,d,v)
major=[72,79,76,83,84,79,76,74];minor=[72,79,75,82,84,79,75,73]
for i in range(38):
 t=.35+i*.76;n=n_at(t);seq=minor if n>.5 else major;note(1,seq[i%8],t,.55,32);note(2,seq[i%8]-12,t+.18,.45,round(26-n*7))
for i,start in enumerate([0,4,9,14,18,21,25]):
 n=n_at(start+1.5);root=[48,45,41,43,45,48,48][i];third=3 if n>.5 else 4;keys=[root,root+7,root+12,root+12+third]
 chord(0,keys,start,3.2,round(26+n*6));chord(4,[k+12 for k in keys],start,3.3,round(18+(1-n)*8));chord(5,[root-12,root-5],start,3.5,round(12+n*15))
 if n>.45:chord(6,[root-12,root-6],start+.15,2.9,round(n*25))
for i in range(22):
 t=12+i*.76;n=n_at(t);seq=minor if n>.5 else major;note(3,seq[(i+2)%8]+(0 if n>.5 else 12),t,.65,round(28+(1-n)*12))
for ch,key,t,d,v in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,v,d,attack,release);start=round(t*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for delay,gain in [(.093,.14),(.211,.09),(.331,.05)]:off=round(delay*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];score*=.36/max(.0001,float(np.abs(score).max()));sound+=score;rng=np.random.default_rng(488)
def add(q,t,g=.1,pan=0):
 start=round(t*SR);end=min(N,start+len(q));q=q[:end-start]*g;sound[0,start:end]+=q*np.sqrt((1-pan)/2);sound[1,start:end]+=q*np.sqrt((1+pan)/2)
def noise(d,smooth=25):return np.convolve(rng.normal(0,1,round(d*SR)),np.ones(smooth)/smooth,'same')
for i in range(30):
 t=i*.9;n=n_at(t+.3);q=np.arange(round(.7*SR))/SR
 # The same rhythmic heartbeat strengthens in the nightmare and fades in healing.
 add(np.sin(2*np.pi*(63*q-13*q*q))*np.exp(-q*10)*np.minimum(1,q/.01),t,.035*n)
 add(noise(.7,110)*np.sin(np.pi*q/.7)**2,t,.025+n*.025)
 if i%3==0:add(np.sin(2*np.pi*(1100*q+200*q*q))*np.exp(-q*6)*np.minimum(1,q/.01),t+.2,.017*(1-n),(i%3-1)*.4)
for at in [3.5,8.5,13.5,17.6,20.5]:
 q=np.arange(round(.9*SR))/SR;add(noise(.9,80)*np.sin(np.pi*q/.9)**2,at,.05+.04*n_at(at))
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(R/'audio'/f'{ID}-cry.ogg')) as inp:
 for f in inp.decode(audio=0):parts.extend(x.to_ndarray() for x in res.resample(f))
parts.extend(x.to_ndarray() for x in res.resample(None));cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());at=round(22.7*SR);tt=np.arange(N)/SR;duck=np.clip((tt-22.5)/.2,0,1)*np.clip((22.7+cry.shape[1]/SR+.3-tt)/.3,0,1);sound*=1-duck*.88;sound[:,at:at+cry.shape[1]]+=cry
sound*=np.minimum(1,np.arange(N)/(.25*SR))*np.minimum(1,(N-np.arange(N))/(.6*SR));assert np.abs(sound).max()<.95;pcm=sound.astype(np.float32)
with wave.open(str(R/f'{ID}-soundtrack.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(pcm,-1,1).T*32767).astype('<i2').tobytes())
(R/f'{ID}-score.json').write_text(json.dumps({'title':title,'original':True,'duration':30,'notes':len(events),'sharedMotif':{'major':major,'minor':minor,'noteSpacing':.76},'direction':'major dream to minor nightmare' if dark else 'minor nightmare to major dream','cryAt':22.7,'events':events},ensure_ascii=False,indent=2),encoding='utf8')
dest=R/f'{ID}-appearance-v1.mp4'
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
times=[1.3,3.1,4.8,7,9.8,12.5,14.8,16.8,18.7,20.2,21.7,23.5,26.5,28.7];snap={round(t*24):t for t in times};qa=R/'encoded-preview'/str(ID);qa.mkdir(parents=True,exist_ok=True)
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time
  if count in snap:f.to_image().save(qa/f'{snap[count]:.2f}.jpg',quality=94)
  if count==31:f.to_image().save(R/f'{ID}-appearance-v1-poster.png')
  count+=1
 assert count==720
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,at:at+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all() and np.abs(decoded).max()<1
report={'species':ID,'duration':30,'frames':720,'fps':24,'width':960,'height':540,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'music':title,'cryAt':22.7,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'revealAt':21,'bodyBounds':json.loads((R/f'{ID}-render-info.json').read_text())['layout']['bounds'],'pairedCuts':[0,4,9,14,18,21]}
(R/f'{ID}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False),flush=True)
