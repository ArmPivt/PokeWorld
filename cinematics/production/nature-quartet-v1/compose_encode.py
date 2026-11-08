from pathlib import Path
from fractions import Fraction
import sys,json,hashlib,wave
import av,numpy as np
from PIL import Image
from sample_renderer import SoundFont
R=Path(__file__).parent;ID=int(sys.argv[1]);SR=48000;N=28*SR;water=ID in [489,490]
font=SoundFont(Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale\cinematics\production\rayquaza\v4-musique-originale\GeneralUser-GS.sf2'))
titles={485:'Le Souffle du basalte',489:'La Bulle des marées',490:'Le Cœur de la mer',492:'L’Île de la gratitude'}
sound=np.zeros((2,N),np.float32);score=np.zeros((2,N+SR),np.float32);events=[]
tracks={0:(48,.035,.4),1:(46,.008,.4),2:(8,.005,.35),3:(73,.025,.25),4:(60,.02,.3),5:(52,.08,.5),6:(116,.003,.16),7:(45,.008,.15)}
def note(ch,key,t,d=.5,v=36):events.append((ch,key,t,d,v))
def chord(ch,keys,t,d,v=30):
 for key in keys:note(ch,key,t,d,v)
if ID==485:
 for i in range(36):
  t=.2+i*.55;key=[38,45,41,48,43,50][i%6];note(0,key,t,.38,30+i%3*3);note(6,36 if i%4==0 else 43,t,.14,37 if i%4==0 else 22)
 for start,keys in [(0,[38,45,50]),(4,[34,41,46]),(8,[36,43,48]),(13,[33,40,45]),(17,[38,45,53])]:chord(5,[k+12 for k in keys],start,3.2,26);chord(0,keys,start,3.3,30)
 for i,key in enumerate([62,69,65,72,70,67,74,69]):note(4,key,20+i*.75,.55,48)
elif water:
 # Shared first twelve seconds: same notes, samples, effects and gain.
 for start,keys in [(0,[48,55,62,67]),(4,[45,52,60,67]),(8,[41,48,57,64])]:chord(0,keys,start,3.5,27)
 for i,key in enumerate([79,86,83,88,81,86,79,83,88,86,81,79,84,88,86,91,88,84,81,86]):note(1,key,.3+i*.55,.5,30)
 if ID==489:
  for start,keys in [(12,[48,55,62,67]),(16,[43,50,59,65]),(20,[48,55,64,71]),(24,[45,52,60,67])]:chord(0,keys,start,3.4,30)
  for i,key in enumerate([79,86,83,81,88,86,83,90,88,86,81,79]):note(3,key,12.3+i*1.15,.7,35)
  for i in range(28):note(2,84+[0,7,4,11,7,12][i%6],12.1+i*.54,.3,25)
 else:
  for start,keys in [(12,[45,52,60,67]),(16,[41,48,57,64]),(20,[48,55,64,71]),(24,[43,50,59,67])]:chord(5,keys,start,3.5,30);chord(0,keys[:3],start,3.5,28)
  for i,key in enumerate([76,83,81,88,86,83,90,88,81,79,83,88]):note(3,key,12.3+i*1.15,.7,38)
  for i in range(28):note(1,76+[0,7,12,16,12,7][i%6],12.1+i*.54,.35,30)
else:
 for start,keys in [(0,[48,55,60,64]),(4,[53,60,65,69]),(8,[45,52,60,67]),(13,[50,57,62,69]),(17,[43,50,59,65]),(20,[48,55,60,67]),(24,[53,60,64,69])]:chord(0,keys,start,3.2,25)
 for i in range(48):note(7,60+[0,4,7,12,7,4][i%6],.1+i*.55,.19,27)
 for i,key in enumerate([76,79,83,86,83,79,88,86,83,79,76,81,84,88,86,83,88,91,88,86,83,79,76,79]):note(3,key,.4+i*1.1,.62,37)
 for i in range(24):note(1,84+[0,7,4,12,11,7][i%6],13+i*.55,.32,24)
for ch,key,t,d,v in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,v,d,attack,release);start=round(t*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for delay,gain in [(.081,.13),(.173,.08),(.313,.04)]:off=round(delay*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N]
if water:
 score[:,:12*SR]*=.32/max(.0001,float(np.abs(score[:,:12*SR]).max()));score[:,12*SR:]*=.36/max(.0001,float(np.abs(score[:,12*SR:]).max()))
else:score*=.36/max(.0001,float(np.abs(score).max()))
sound+=score;rng=np.random.default_rng(489 if water else ID)
def add(q,t,g=.1,pan=0):
 start=round(t*SR);end=min(N,start+len(q));q=q[:end-start]*g;sound[0,start:end]+=q*np.sqrt((1-pan)/2);sound[1,start:end]+=q*np.sqrt((1+pan)/2)
def noise(d,smooth=25):return np.convolve(rng.normal(0,1,round(d*SR)),np.ones(smooth)/smooth,'same')
def rush(t,d,g,smooth=35):
 q=np.arange(round(d*SR))/SR;add(noise(d,smooth)*np.sin(np.pi*q/d)**2,t,g)
if ID==485:
 rush(0,12,.1,110);rush(13,6.3,.12,90)
 for at in [8.6,10.4,13.2,16.8,19.6]:
  q=np.arange(round(.7*SR))/SR;add(noise(.7,5)*np.exp(-q*7)*np.minimum(1,q/.01),at,.08)
elif water:
 rush(0,11.9,.052,85)
 for i in range(18):
  q=np.arange(round(.15*SR))/SR;f=620+i%4*150;add(np.sin(2*np.pi*(f*q+550*q*q))*np.exp(-q*28)*np.minimum(1,q/.004),.7+i*.61,.024,(i%3-1)*.4)
 rng=np.random.default_rng(ID);rush(12,7.8,.038,75)
 if ID==490:
  for i in range(9):
   for off,g in [(0,.027),(.16,.016)]:
    q=np.arange(round(.2*SR))/SR;add(np.sin(2*np.pi*74*q)*np.exp(-q*22)*np.minimum(1,q/.008),12.5+i*.7+off,g)
else:
 rush(0,19.9,.035,100)
 for i in range(9):
  q=np.arange(round(.3*SR))/SR;add(np.sin(2*np.pi*(1900*q+550*q*q))*np.sin(np.pi*q/.3)**2,.8+i*2.1,.012,(i%3-1)*.5)
rush(19.4,.8,.12,40)
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(R/'audio'/f'{ID}-cry.ogg')) as inp:
 for f in inp.decode(audio=0):parts.extend(x.to_ndarray() for x in res.resample(f))
parts.extend(x.to_ndarray() for x in res.resample(None));cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());at=round(21.7*SR);tt=np.arange(N)/SR;duck=np.clip((tt-21.5)/.2,0,1)*np.clip((21.7+cry.shape[1]/SR+.3-tt)/.3,0,1);sound*=1-duck*.88;sound[:,at:at+cry.shape[1]]+=cry
sound*=np.minimum(1,np.arange(N)/(.2*SR))*np.minimum(1,(N-np.arange(N))/(.6*SR));assert np.abs(sound).max()<.95;pcm=sound.astype(np.float32)
with wave.open(str(R/f'{ID}-soundtrack.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(pcm,-1,1).T*32767).astype('<i2').tobytes())
(R/f'{ID}-score.json').write_text(json.dumps({'title':titles[ID],'original':True,'duration':28,'notes':len(events),'sharedWaterIntroSeconds':12 if water else 0,'cryAt':21.7,'instruments':'GeneralUser GS: original strings, harp, celesta, flute, choir, brass, pizzicato and taiko. Synthesized wind, lava, water and bubbles; no official soundtrack used.'},ensure_ascii=False,indent=2),encoding='utf8')
dest=R/f'{ID}-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'23','preset':'medium','maxrate':'650k','bufsize':'1300k'};v.codec_context.thread_count=4
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=128000;cursor=0
 for i in range(672):
  with Image.open(R/'frames'/str(ID)/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
times=[1.5,3.2,4.8,6.5,8.7,10.5,12.8,14.5,17,19.1,20.7,22.5,25.5,27];snap={round(t*24):t for t in times};qa=R/'encoded-preview'/str(ID);qa.mkdir(parents=True,exist_ok=True)
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time
  if count in snap:f.to_image().save(qa/f'{snap[count]:.2f}.jpg',quality=94)
  if count==36:f.to_image().save(R/f'{ID}-appearance-v1-poster.png')
  count+=1
 assert count==672
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,at:at+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all() and np.abs(decoded).max()<1
report={'species':ID,'duration':28,'frames':672,'fps':24,'width':960,'height':540,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'music':titles[ID],'cryAt':21.7,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'revealAt':20,'bodyBounds':json.loads((R/f'{ID}-render-info.json').read_text())['layout']['bounds'],'sharedWaterIntroSeconds':12 if water else 0}
(R/f'{ID}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False),flush=True)
