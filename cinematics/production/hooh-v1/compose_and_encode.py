from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=44;N=SR*DURATION
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2'] if p.exists());font=SoundFont(font_path)
tracks={0:(48,.12,.55),1:(77,.045,.22),2:(107,.006,.35),3:(106,.008,.18),4:(89,.2,.7),5:(52,.16,.55),6:(60,.04,.4),7:(116,.004,.25),8:(115,.003,.14),10:(46,.006,.45)}
events=[]
def note(ch,key,time,length,velocity=45):events.append((ch,key,time,length,velocity))
def chord(ch,keys,time,length,velocity=35):
 for key in keys:note(ch,key,time,length,velocity)
# Original score. Broad inspiration: the ceremonial mood of the HeartGold
# summoning scene, not its melody, harmony transcription, MIDI or recording.
for start,root in [(0,38),(3.5,41)]:
 chord(0,[root,root+7,root+15,root+22],start,3.3,38);chord(4,[root,root+7],start,3.4,26)
 for i in range(5):note(7,36 if i%2==0 else 43,start+i*.64,.22,45+i*2)
for i,key in enumerate([62,65,69,68,72]):note(1,key,1+i*1.08,.58,28+i%3*3)
# Rain extinguishes the blaze: thinner instrumentation, quiet plucked fragments.
chord(4,[38,45,53,60],7,5.8,24)
for i,key in enumerate([69,65,62,57,60,64]):note(2,key,7.4+i*.83,.48,29)
for i,key in enumerate([65,62,69]):note(1,key,8+i*1.35,.75,28)
# Rainbow: the music turns toward a clear major pentatonic palette.
for start,root in [(13,50),(16.5,55)]:
 chord(0,[root,root+7,root+16,root+23],start,3.2,31)
 for i,key in enumerate([0,7,12,16,19,24,21,16]):note(10,root+key,start+i*.4,.48,36+i%2*3)
for i,key in enumerate([74,69,76,71,78,74,81,76]):note(1,key,13.3+i*.75,.5,37)
# The five Kimono Girls: original koto/shamisen phrases on the dance's .64s beat.
for start,root in [(20,50),(23.2,55),(26.4,57)]:
 chord(4,[root,root+7,root+14,root+21],start,3.1,24)
 for i,offset in enumerate([12,19,14,21,16,24,19,14,21,16]):
  note(2,root+offset,start+i*.32,.28,46 if i%2==0 else 37)
 for i,offset in enumerate([0,7,0,12,7]):note(3,root+offset,start+i*.64,.18,36)
for i in range(14):
 time=20+i*.64
 note(7,36 if i%4==0 else 43,time,.19,42 if i%4==0 else 31)
 if i%2:note(8,72,time+.32,.09,32)
for i,key in enumerate([74,78,76,81,78,74,76,83,81,78]):note(1,key,20.4+i*.76,.42,42 if i<5 else 37)
# Golden arrival: ascend in the sky, then open into the final choral reveal.
chord(0,[50,57,66,73],29,5.9,32)
for i,key in enumerate([62,69,74,78,81,86,90,93]):note(2,key,29.25+i*.64,.43,35+i*2)
for i,key in enumerate([74,76,78,81,83,86]):note(1,key,30+i*.65,.49,35+i*3)
for i in range(8):note(7,36,31+i*.46,.16,34+i*3)
for start,keys in [(35,[50,57,66,73,78]),(39,[55,62,71,78,83]),(41.5,[50,57,66,74,81])]:
 length=min(3.7,43.7-start);chord(0,keys,start,length,48);chord(5,[k+12 for k in keys[:3]],start,length,34)
for i,key in enumerate([74,81,86,90,88,83,86,81,78,83,81,86]):note(1,key,35.2+i*.65,.45,48 if i<5 else 40)
for i,key in enumerate([62,69,74,78,81,86]):note(10,key,35+i*.075,.8,51)
for i,key in enumerate([62,69,74,78,74,81]):note(6,key,39.1+i*.5,.44,35)
score=np.zeros((2,N+SR),np.float32)
for ch,key,time,length,velocity in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release);start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for seconds,gain in [(.047,.12),(.089,.09),(.167,.06),(.281,.035)]:
 off=round(seconds*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];t=np.arange(N)/SR;score*=np.minimum(1,t/.3)*np.minimum(1,(DURATION-t)/.65);score*=.54/float(np.abs(score).max())
def write_wav(path,data):
 with wave.open(str(path),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(data,-1,1).T*32767).astype('<i2').tobytes())
write_wav(ROOT/'la-promesse-des-deux-tours-score.wav',score)
def vlq(n):
 out=[n&127];n>>=7
 while n:out.insert(0,(n&127)|128);n>>=7
 return bytes(out)
def midi_chunk(items):
 data=b'';last=0
 for time,priority,payload in sorted(items,key=lambda a:(a[0],a[1])):
  tick=round(time*960);data+=vlq(tick-last)+payload;last=tick
 data+=b'\0\xff\x2f\0';return b'MTrk'+struct.pack('>I',len(data))+data
chunks=[midi_chunk([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
for ch,(program,_,_) in tracks.items():
 items=[(0,0,bytes([0xc0+ch,program]))]
 for channel,key,time,length,velocity in events:
  if channel==ch:items.extend([(time,2,bytes([0x90+ch,key,velocity])),(time+length,1,bytes([0x80+ch,key,0]))])
 chunks.append(midi_chunk(items))
(ROOT/'la-promesse-des-deux-tours.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
rng=np.random.default_rng(250);sound=score.astype(np.float64)*.84
def add(sample,start,gain=1,pan=0):
 at=round(start*SR);end=min(N,at+len(sample));q=sample[:end-at]*gain;sound[0,at:end]+=q*np.sqrt((1-pan)/2);sound[1,at:end]+=q*np.sqrt((1+pan)/2)
def noise(length,smooth=20):return np.convolve(rng.normal(0,1,round(length*SR)),np.ones(smooth)/smooth,'same')
def rush(start,length,gain,pan=0):
 q=np.arange(round(length*SR))/SR;add(noise(length,25)*np.sin(np.pi*q/length)**2,start,gain,pan)
# Fire crackle, water, collapsing timbers and quiet high-altitude wind.
q=np.arange(round(11.8*SR))/SR;power=np.where(q<7,.65+q*.06,1-np.clip((q-7)/4.8,0,1));add(noise(11.8,18)*power*np.minimum(1,q/.4),0,.045)
for i,start in enumerate(np.arange(.5,10.8,.37)):
 q=np.arange(round(.045*SR))/SR;add(rng.normal(0,1,len(q))*np.exp(-q*100),float(start),.011*(1-min(.9,max(0,(start-7)/4.8))),(i%3-1)*.5)
q=np.arange(7*SR)/SR;add(noise(7,4)*np.sin(np.pi*q/7)**.6,6.4,.034)
for start in [9.7,10.25]:
 q=np.arange(round(.6*SR))/SR;add((noise(.6,44)*.65+np.sin(2*np.pi*(82*q-12*q*q))*.2)*np.exp(-q*5)*np.minimum(1,q/.01),start,.07)
q=np.arange(24*SR)/SR;add(noise(24,110)*np.minimum(1,q/.8)*np.minimum(1,(24-q)/.7),20,.02)
def bell(start,gain,pan,key):
 length=4.1;q=np.arange(round(length*SR))/SR;sample=np.zeros_like(q)
 for i,(ratio,amplitude,decay) in enumerate([(1,1,.75),(2.01,.55,1.1),(2.73,.38,1.55),(4.11,.22,2.3),(5.43,.12,3.2)]):sample+=np.sin(2*np.pi*key*ratio*q)*amplitude*np.exp(-q*decay)
 sample*=np.minimum(1,q/.006)*np.minimum(1,(length-q)/.12);add(sample,start,gain,pan)
bell_times=[21.6,24.1,26.6,28.2,35.1,39.2]
for i,start in enumerate(bell_times):
 bell(start,.045,-.48,246.94);bell(start+.14,.033,.48,293.66)
for start in [29.1,31.2,33.4]:rush(start,1.2,.045,(start-31)*.2)
rush(34.45,1.1,.15)
# Actual Ho-Oh cry exactly as the revealed bird settles over the dancers.
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(ROOT/'audio/250-cry.ogg')) as inp:
 for f in inp.decode(audio=0):
  for converted in res.resample(f):parts.append(converted.to_ndarray())
for converted in res.resample(None):parts.append(converted.to_ndarray())
cry=np.concatenate(parts,axis=1);cry*=.4/float(np.abs(cry).max());cry_time=37.15;cry_start=round(cry_time*SR)
duck=np.clip((t-cry_time+.15)/.15,0,1)*np.clip((cry_time+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.77*duck;sound[:,cry_start:cry_start+cry.shape[1]]+=cry
sound*=np.minimum(1,t/.2)*np.minimum(1,(DURATION-t)/.6);sound*=.77/float(np.abs(sound).max());pcm=sound.astype(np.float32);write_wav(ROOT/'hooh-soundtrack.wav',pcm)
(ROOT/'score.json').write_text(json.dumps({'title':'La Promesse des deux tours','duration':44,'notes':len(events),'music':'Original ceremonial score with koto, shamisen, shakuhachi, taiko, woodblock, strings and choir; synthesized bronze bells and original ambience. No official melody, recording, sample or MIDI reused.','reference':'https://www.youtube.com/watch?v=ZRrflvE1DIU','referenceTitle':'Pokemon Heart Gold - Summoning Ho-Oh','cues':{'towerFire':0,'rainExtinguishesFire':7,'rainbow':14.15,'kimonoDance':20,'bellTimes':bell_times,'goldenArrival':29,'reveal':35.2,'hoohCry':37.15},'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
dest=ROOT/'250-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
 for i in range(1056):
  with Image.open(ROOT/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
qa=ROOT/'encoded-preview';qa.mkdir(exist_ok=True)
times=[1.2,3.8,6.5,7.5,9,10.5,12.5,13.5,15,16.5,18.2,19.5,20.5,21.6,23.2,24.8,26.4,28.1,29.8,31.7,33.5,34.7,35.4,36.3,37.2,39,41,42.8];snapshots={round(when*24):when for when in times}
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert (f.width,f.height)==(960,540)
  if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
  if count==round(39*24):f.to_image().save(ROOT/'250-appearance-v1-poster.png')
  count+=1
 assert count==1056
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1;assert dest.stat().st_size<25*1024*1024
info=json.loads((ROOT/'render-info.json').read_text(encoding='utf-8'))
report={'species':250,'shiny':False,'duration':44,'frames':1056,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':'La Promesse des deux tours','cryAt':37.15,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'revealAt':35.2,'checks':'1056 monotonic frames and full stereo audio decode; no clipping; real Ho-Oh cry correlated at 37.15s; six narrative shots; fire extinguished before rainbow; five transparent dancers with four poses each; whole bird in frame after arrival.','bodyBounds':info['bodyBounds'],'danceChecks':info['danceChecks'],'visualChecks':info['visualChecks']}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['visualChecks','danceChecks','bodyBounds']}),flush=True)
