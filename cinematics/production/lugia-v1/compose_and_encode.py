from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=30;N=SR*DURATION
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2'] if p.exists());font=SoundFont(font_path)
tracks={0:(48,.12,.55),1:(77,.045,.22),2:(107,.006,.35),3:(106,.008,.18),4:(89,.2,.7),5:(52,.16,.55),6:(8,.006,.4),7:(116,.004,.25),8:(115,.003,.14),10:(46,.006,.45)}
events=[]
def note(ch,key,time,length,velocity=45):events.append((ch,key,time,length,velocity))
def chord(ch,keys,time,length,velocity=35):
 for key in keys:note(ch,key,time,length,velocity)
# New composition. The SoulSilver reference supplies a ceremonial, aquatic
# atmosphere; none of its recording, melody, MIDI or samples is reused.
chord(0,[38,45,53,60],0,3.4,34);chord(4,[38,45,62],0,3.4,24)
for i,key in enumerate([69,65,72,67]):note(1,key,.45+i*.68,.48,29)
chord(0,[38,45,51,60],3.6,3.6,40)
for i in range(8):note(7,36 if i%3==0 else 43,3.6+i*.43,.18,39+i*2)
for i,key in enumerate([62,65,69,71,74]):note(10,key,3.55+i*.48,.38,32+i*3)
# Silver ritual: original koto/shamisen patterns answer the breathy flute.
for start,root in [(8,40),(10.6,45)]:
 chord(4,[root,root+7,root+15,root+22],start,2.45,26)
 for i,offset in enumerate([24,19,27,22,31,26,27,24]):note(2,root+offset,start+i*.32,.28,43 if i%2==0 else 34)
 for i,offset in enumerate([0,7,12,7]):note(3,root+offset,start+i*.65,.18,33)
for i,key in enumerate([76,71,79,78,83,81,79]):note(1,key,8.4+i*.62,.44,39)
for i in range(8):
 note(7,36 if i%4==0 else 43,8+i*.65,.18,37 if i%4==0 else 27)
 if i%2:note(8,72,8.3+i*.65,.09,28)
# The pool turns and the water curtain rises: circling harp and celesta.
for start,keys in [(13,[45,52,60,67]),(17,[47,54,64,69])]:chord(0,keys,start,3.8,34)
for i in range(24):
 time=13+i*.32
 if time>=20.7:break
 note(10,69+[0,7,3,10,12,5,14,7][i%8],time,.33,36+i%3*3)
 if i%3==0:note(6,88+[0,3,7,5][i//3%4],time,.38,33)
for i,key in enumerate([71,74,76,78,79,83]):note(1,key,17.1+i*.55,.45,35+i*3)
# Lugia's arrival resolves into a spacious minor choral theme.
for start,keys in [(21,[40,47,55,62,67]),(24,[45,52,60,67,74]),(27,[40,47,55,64,71])]:
 chord(0,keys,start,2.8,48);chord(5,[k+12 for k in keys[:3]],start,2.8,34)
for i,key in enumerate([83,79,86,81,88,83,79,81,76,79,83]):note(1,key,21.2+i*.72,.5,48 if i<5 else 39)
for i,key in enumerate([64,71,76,79,83,88]):note(10,key,21+i*.075,.8,50)
for i,key in enumerate([88,83,79,76,83]):note(6,key,27.5+i*.34,.35,38)
score=np.zeros((2,N+SR),np.float32)
for ch,key,time,length,velocity in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release);start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for seconds,gain in [(.047,.12),(.089,.09),(.167,.06),(.281,.035)]:
 off=round(seconds*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];t=np.arange(N)/SR;gate=np.minimum(1,t/.3)*np.minimum(1,(DURATION-t)/.6)
gate*=1-np.clip((t-7.25)/.25,0,1)*np.clip((8.2-t)/.2,0,1)
score*=gate;score*=.54/float(np.abs(score).max())
def write_wav(path,data):
 with wave.open(str(path),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(data,-1,1).T*32767).astype('<i2').tobytes())
write_wav(ROOT/'l-appel-des-marees-score.wav',score)
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
(ROOT/'l-appel-des-marees.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
rng=np.random.default_rng(249);sound=score.astype(np.float64)*.84
def add(sample,start,gain=1,pan=0):
 at=round(start*SR);end=min(N,at+len(sample));q=sample[:end-at]*gain;sound[0,at:end]+=q*np.sqrt((1-pan)/2);sound[1,at:end]+=q*np.sqrt((1+pan)/2)
def noise(length,smooth=20):return np.convolve(rng.normal(0,1,round(length*SR)),np.ones(smooth)/smooth,'same')
def rush(start,length,gain,pan=0):
 q=np.arange(round(length*SR))/SR;add(noise(length,25)*np.sin(np.pi*q/length)**2,start,gain,pan)
# No thunder or rain in the first scene. Lugia's wing pulse comes first.
q=np.arange(round(7.5*SR))/SR;fire=np.where(q<4.5,1,np.clip((7-q)/2.5,0,1));add(noise(7.5,18)*fire*np.minimum(1,q/.4),0,.03)
for i,start in enumerate([.5,1.1,1.8,2.6,3.1,3.9,4.5]):
 q=np.arange(round(.04*SR))/SR;add(rng.normal(0,1,len(q))*np.exp(-q*100),start,.008,(i%3-1)*.4)
rush(3.35,.9,.055,.4)
q=np.arange(round(3.9*SR))/SR;add(noise(3.9,5)*np.minimum(1,q/.6)*np.minimum(1,(3.9-q)/.3),3.6,.036)
for start,length,gain in [(4.6,1.8,.16),(6.1,1.3,.09)]:
 q=np.arange(round(length*SR))/SR;add((noise(length,31)*.6+np.sin(2*np.pi*(45*q-4*q*q))*.3)*np.exp(-q*3)*np.minimum(1,q/.01),start,gain)
# Flowing water and five silver-bell responses accompany the ritual.
q=np.arange(22*SR)/SR;add(noise(22,52)*np.minimum(1,q/.5)*np.minimum(1,(22-q)/.6),8,.034)
def bell(start,gain,pan,key):
 length=3.8;q=np.arange(round(length*SR))/SR;sample=np.zeros_like(q)
 for ratio,amplitude,decay in [(1,1,.9),(2.01,.45,1.3),(2.73,.32,1.8),(4.11,.18,2.6)]:sample+=np.sin(2*np.pi*key*ratio*q)*amplitude*np.exp(-q*decay)
 sample*=np.minimum(1,q/.006)*np.minimum(1,(length-q)/.12);add(sample,start,gain,pan)
for start in [9.15,11.75,14.2,21.2,25.6]:bell(start,.034,-.4,329.63);bell(start+.13,.026,.4,493.88)
rush(13.2,3.6,.08);rush(17.7,3.5,.14);rush(20.5,.9,.13)
for i,start in enumerate([18.3,18.85,19.5,20.25]):
 q=np.arange(round(.15*SR))/SR;add(noise(.15,4)*np.sin(np.pi*q/.15)**2,start,.019,(i%2*2-1)*.5)
# Actual Lugia cry at the main reveal, with all other audio ducked beneath it.
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(ROOT/'audio/249-cry.ogg')) as inp:
 for f in inp.decode(audio=0):
  for converted in res.resample(f):parts.append(converted.to_ndarray())
for converted in res.resample(None):parts.append(converted.to_ndarray())
cry=np.concatenate(parts,axis=1);cry*=.4/float(np.abs(cry).max());cry_time=22.4;cry_start=round(cry_time*SR)
duck=np.clip((t-cry_time+.15)/.15,0,1)*np.clip((cry_time+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.77*duck;sound[:,cry_start:cry_start+cry.shape[1]]+=cry
sound*=gate;sound*=.77/float(np.abs(sound).max());pcm=sound.astype(np.float32);write_wav(ROOT/'lugia-soundtrack.wav',pcm)
(ROOT/'score.json').write_text(json.dumps({'title':'L’Appel des marées','duration':30,'notes':len(events),'music':'Original aquatic ceremonial score: koto, shamisen, shakuhachi, taiko, celesta, harp, strings and choir. Synthesized silver bells, water, fire and thunder. No official theme, recording, sample or MIDI reused.','reference':'https://www.youtube.com/shorts/gQQogOvgizc','referenceTitle':'How to reach Lugia in Pokemon SoulSilver','cues':{'calmFire':0,'lugiaArrives':2.5,'stormCalled':3.6,'blackTransition':[7.5,8],'kimonoRitual':8,'whirlpool':13,'waterfallEmergence':17,'mainReveal':21,'lugiaCry':22.4},'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
dest=ROOT/'249-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
 for i in range(720):
  with Image.open(ROOT/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
qa=ROOT/'encoded-preview';qa.mkdir(exist_ok=True);times=[1.2,2.3,2.9,3.3,3.9,4.7,5.6,6.7,7.35,7.75,8.5,9.2,10.7,12.3,13.6,15.2,16.6,17.6,18.4,19.3,20.4,21.4,22.4,24,26.5,28.6];snapshots={round(when*24):when for when in times}
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert (f.width,f.height)==(960,540)
  if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
  if count==24*24:f.to_image().save(ROOT/'249-appearance-v1-poster.png')
  count+=1
 assert count==720
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1;assert dest.stat().st_size<25*1024*1024
black_rms=float(np.sqrt(np.mean(decoded[:,round(7.6*SR):round(7.9*SR)]**2)));assert black_rms<.002
info=json.loads((ROOT/'render-info.json').read_text(encoding='utf-8'))
report={'species':249,'shiny':False,'duration':30,'frames':720,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':'L’Appel des marées','stormCalledAt':3.6,'cryAt':22.4,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'blackTransitionRMS':black_rms,'revealAt':18.25,'checks':'720 monotonic frames and complete stereo audio decode; no clipping; calm opening until Lugia calls the storm; silent black transition; five Kimono Girls; whirlpool and waterfall emergence; actual Lugia cry at 22.4s; whole final wings in frame.','bodyBounds':info['bodyBounds'],'visualChecks':info['visualChecks']}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k not in ['visualChecks','bodyBounds']}),flush=True)
