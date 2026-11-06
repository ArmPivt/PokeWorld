from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image,ImageDraw
from sample_renderer import SoundFont
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=27;N=SR*DURATION
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2',ROOT.parent/'orchestra/GeneralUser-GS.sf2'] if p.exists())
font=SoundFont(font_path)
tracks={0:(46,.005,.55),1:(8,.006,.5),2:(48,.15,.65),3:(52,.18,.7),4:(73,.06,.35),5:(9,.004,.5),6:(89,.18,.65)}
events=[]
def note(ch,key,time,length,velocity=60):events.append((ch,key,time,length,velocity))
def chord(ch,keys,time,length,velocity=50):
 for key in keys:note(ch,key,time,length,velocity)
# Original material for this film. No audio samples, melody transcription or
# MIDI extracted from the user-supplied Jirachi theme.
chord(6,[50,57,64,73],0,3.6,33)
for i,k in enumerate([86,81,83,78,81,85]):note(1,k,.15+i*.62,.36,39+i*2)
for i,k in enumerate([74,78,81,86,90]):note(0,k,3.72+i*.11,.42,56+i*3)
chord(2,[50,57,62,69,76],3.72,1.7,38)
# A gentle, new wishing melody, over harp and sustained warm harmonies.
melody=[(74,.0,.7),(81,.8,.4),(78,1.35,.6),(85,2.1,.7),(83,2.85,.35),(78,3.35,.55),(76,4.05,.7),(81,4.85,.7)]
for key,start,length in melody:note(4,key,5.5+start,length,47)
for start,root,third in [(5.5,50,4),(8.5,47,3)]:
 chord(2,[root,root+7,root+12,root+third+12],start,2.85,36)
 chord(3,[root+12,root+19,root+26],start,.9,23)
 for i in range(12):note(0,root+[12,19,24,third+24,19,24][i%6],start+i*.25,.42,41+i%3*4)
# The enormous shooting star: increasingly broad strings, a celesta answer.
for j,(start,root,third) in enumerate([(11.5,55,4),(14,57,4)]):
 chord(2,[root,root+7,root+12,root+third+12,root+26],start,2.35,47+j*5)
 chord(3,[root+12,root+19,root+26],start,2.3,30)
 for i in range(10):note(0,root+[7,12,19,24,third+24][i%5],start+i*.25,.35,47+j*3+i%2*5)
for i,k in enumerate([86,90,88,85,83,81]):note(1,k,11.65+i*.65,.6,53)
# Tracking close-up: growing density and rising tessitura, resolved at the flash.
for j,(start,root) in enumerate([(16.5,47),(17.7,55),(18.9,57)]):
 chord(2,[root,root+7,root+12,root+19,root+26],start,1.15,52+j*8)
 for i in range(8):note(0,root+[12,19,24,26,31,28,26,31][i],start+i*.145,.25,50+j*5+i)
for i,k in enumerate([81,83,85,86,88,90,93]):note(5,k,19.28+i*.12,.3,50+i*4)
chord(2,[50,57,62,66,73,78],20.2,2.65,69)
chord(3,[62,69,78,85],20.2,2.3,46)
for i,k in enumerate([74,81,86,90,93,98]):note(1,k,20.2+i*.085,.75,66-i*3)
# Leave a quiet space for the real cry; finish with a floating, luminous answer.
for i,k in enumerate([78,81,85,83,78,76,74]):note(1,k,22.5+i*.51,.4,43)
for start,root in [(22.4,55),(24.5,50)]:
 chord(2,[root,root+7,root+14,root+19],start,2.0,42)
 for i in range(8):note(0,root+[12,19,24,28][i%4],start+i*.25,.4,40)
score=np.zeros((2,N+SR),np.float32)
for ch,key,time,length,velocity in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release)
 start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for seconds,gain in [(.051,.16),(.093,.12),(.163,.08),(.277,.045)]:
 off=round(seconds*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];t=np.arange(N)/SR;score*=np.minimum(1,t/.25)*np.minimum(1,(DURATION-t)/.65);score*=.65/float(np.abs(score).max())
def write_wav(path,data):
 with wave.open(str(path),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(data,-1,1).T*32767).astype('<i2').tobytes())
write_wav(ROOT/'mille-voeux-score.wav',score)
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
(ROOT/'mille-voeux.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
rng=np.random.default_rng(385);sound=score.astype(np.float64)*.86
def add(sample,start,gain=1,pan=0):
 i=round(start*SR);end=min(N,i+len(sample));q=sample[:end-i]*gain
 sound[0,i:end]+=q*np.sqrt((1-pan)/2);sound[1,i:end]+=q*np.sqrt((1+pan)/2)
def tick(start):
 q=np.arange(round(.1*SR))/SR
 add((rng.normal(0,1,len(q))*.25+np.sin(2*np.pi*1200*q))*np.exp(-q*75),start,.025)
for i in range(1,7):tick(i*.62)
for i,start in enumerate([6.0,6.9,7.8,9.1,9.8]):
 q=np.arange(round(.45*SR))/SR;freq=1450+150*i
 add(np.sin(2*np.pi*(freq*q-500*q*q))*np.sin(np.pi*q/.45)**2,start,.018,(i%3-1)*.65)
q=np.arange(round(9.6*SR))/SR
noise=np.convolve(rng.normal(0,1,len(q)),np.ones(35)/35,'same')
env=np.minimum(1,q/2)*np.minimum(1,(9.6-q)/.55)*(.1+.9*(q/9.6)**1.7)
add(noise*env,10.6,.14)
q=np.arange(round(1.7*SR))/SR
add((np.sin(2*np.pi*(780*q+800*q*q))*.2+rng.normal(0,1,len(q))*.025)*np.exp(-q*4)*np.minimum(1,q/.015),20.2,.09)
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(ROOT/'audio/385-cry.ogg')) as inp:
 for f in inp.decode(audio=0):
  for converted in res.resample(f):parts.append(converted.to_ndarray())
for converted in res.resample(None):parts.append(converted.to_ndarray())
cry=np.concatenate(parts,axis=1);cry*=.4/float(np.abs(cry).max());start=22*SR
duck=np.clip((t-21.85)/.15,0,1)*np.clip((22+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.68*duck
sound[:,start:start+cry.shape[1]]+=cry
sound*=np.minimum(1,t/.2)*np.minimum(1,(27-t)/.6);sound*=.78/float(np.abs(sound).max());pcm=sound.astype(np.float32)
write_wav(ROOT/'jirachi-soundtrack.wav',pcm)
(ROOT/'score.json').write_text(json.dumps({'title':'Mille vœux sous les étoiles','duration':27,'notes':len(events),'cues':{'counter1000':3.72,'wish':7.6,'greatStar':10.6,'pursuit':16.5,'flash':20.2,'cry':22},'music':'Original composition with harp, celesta, glockenspiel, flute, warm strings and choir. Not a remix or transcription of the official theme.','reference':'https://www.youtube.com/watch?v=i8mwels9lZ4','referenceTitle':"Jirachi's Theme — The Pokemon Themes",'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'scoreRendered':True,'notes':len(events),'cryDuration':cry.shape[1]/SR}),flush=True)
# Encode only after deterministic visual review has produced all frames.
if not (ROOT/'frames/00647.png').exists():raise SystemExit('Score ready. Run node render.cjs all, then run this script again to encode.')
dest=ROOT/'385-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
 for i in range(648):
  with Image.open(ROOT/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
with av.open(str(dest)) as inp:
 frames=list(inp.decode(video=0));assert len(frames)==648;assert all(b.time>a.time for a,b in zip(frames,frames[1:]))
 frames[round(24.7*24)].to_image().save(ROOT/'385-appearance-v1-poster.png')
 qa=ROOT/'encoded-preview';qa.mkdir(exist_ok=True)
 for when in [.8,3.5,3.95,4.8,6.4,8.8,10.9,11.8,14,16.2,17,18.6,19.9,20.2,20.7,21.5,22.3,24.7,26]:
  frames[round(when*24)].to_image().save(qa/f'{when:.2f}.jpg',quality=94)
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,start:start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1
report={'species':385,'shiny':False,'duration':27,'frames':648,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':'Mille vœux sous les étoiles','cryAt':22,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'counterFinishesAt':1000,'counter1000At':3.72,'flashAt':20.2,'checks':'648 monotonic frames, full H264/AAC decode, actual Jirachi cry correlation at reveal, no audio clipping.'}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)

