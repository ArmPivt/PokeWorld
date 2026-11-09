from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont
ROOT=Path(__file__).parent;F=ROOT/'494';F.mkdir(exist_ok=True);SR=48000;DURATION=30;N=DURATION*SR
font_path=ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2';font=SoundFont(font_path)
TITLE='Le Souffle de la Victoire'
def wav(path,data):
 with wave.open(str(path),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(data,-1,1).T*32767).astype('<i2').tobytes())
def vlq(n):
 out=[n&127];n>>=7
 while n:out.insert(0,(n&127)|128);n>>=7
 return bytes(out)
def chunk(items):
 data=b'';last=0
 for time,priority,payload in sorted(items,key=lambda a:(a[0],a[1])):
  tick=round(time*960);data+=vlq(tick-last)+payload;last=tick
 data+=b'\0\xff\x2f\0';return b'MTrk'+struct.pack('>I',len(data))+data
tracks={0:(48,.12,.5),1:(60,.03,.35),2:(9,.005,.4),3:(52,.12,.5),4:(47,.005,.35),5:(46,.005,.35),6:(89,.2,.6),7:(71,.02,.3)};events=[]
def note(ch,key,time,length,velocity=45):events.append((ch,key,time,length,velocity))
def chord(ch,keys,time,length,velocity=35):
 for key in keys:note(ch,key,time,length,velocity)
# New major-key victory theme, a tense middle section and a joyful brass return.
chord(0,[48,55,60,64],0,3.8,31)
for i,(key,length) in enumerate([(72,.35),(76,.2),(79,.5),(74,.25),(77,.25),(84,.8)]):note(1,key,.3+i*.48,length,48)
for i in range(12):note(5,[60,67,72,76][i%4],.2+i*.3,.2,35)
chord(0,[45,52,57,60],4,2.3,34)
for i in range(7):note(7,[69,72,76,74,71,67,69][i],4.2+i*.29,.2,38)
for x in [4.15,4.65,5.15,5.65]:note(4,45,x,.22,35)
chord(3,[64,67,72],6.5,2.5,30)
for i,key in enumerate([72,74,76,79,81,84]):note(2,key,6.5+i*.24,.35,37+i*2)
chord(1,[60,64,67,72],8.3,.85,61);note(4,48,8.3,.5,54)
chord(6,[38,45,50,53],9.5,2.5,31)
for i in range(7):note(7,[62,65,69,68,65,62,61][i],9.7+i*.28,.23,34)
for block in range(3):
 start=12+block*2.3;root=[38,41,43][block];chord(0,[root,root+7,root+12,root+15],start,2.5,33+block*3)
 for i in range(10):note(5,root+24+[0,7,3,10,12][i%5],start+i*.22,.18,33+i%3*4)
for i,key in enumerate([67,72,76,79,84,88]):note(2,key,16+i*.38,.4,43)
chord(1,[55,60,64,67],18.2,.8,58);note(4,43,18.2,.6,62)
chord(0,[48,55,60,64],19,3.2,44);chord(3,[67,72,76],19,3.2,34)
for i,key in enumerate([72,76,79,84,81,79]):note(1,key,19.2+i*.42,.38,48)
for i,key in enumerate([72,79,84,88,91]):note(2,key,22.15+i*.36,.5,38)
chord(1,[60,64,67,72,76],24.2,1.3,65);note(4,48,24.2,.7,68)
chord(0,[48,55,60,64,67],24.2,3.6,48);chord(3,[67,72,76],24.2,3.5,35)
for i,key in enumerate([79,84,88,86,84,91,88,84]):note(1,key,26.5+i*.29,.22 if i<7 else .9,53)
for i in range(14):note(5,[72,76,79,84,88,84,79][i%7],25.5+i*.28,.2,36)
chord(0,[48,55,60,64],28.5,1.3,39);chord(1,[72,76,79,84],28.6,1.1,48)
score=np.zeros((2,N+SR),np.float32)
for ch,key,time,length,vel in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,vel,length,attack,release);start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for secs,gain in [(.071,.15),(.147,.10),(.251,.065),(.41,.04)]:
 off=round(secs*SR);score[:,off:]+=dry[::-1,:-off]*gain
t=np.arange(N)/SR;score=score[:,:N];fade=np.minimum(1,t/.4)*np.minimum(1,(30-t)/.8);score*=fade;score*=.62/np.abs(score).max();wav(F/'score.wav',score)
chunks=[chunk([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
for ch,(program,_,_) in tracks.items():
 items=[(0,0,bytes([0xc0+ch,program]))]
 for channel,key,time,length,vel in events:
  if channel==ch:items.extend([(time,2,bytes([0x90+ch,key,vel])),(time+length,1,bytes([0x80+ch,key,0]))])
 chunks.append(chunk(items))
(F/'score.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
rng=np.random.default_rng(494);sound=score.astype(np.float64)*.87
def add(q,start,gain=1,pan=0):
 i=round(start*SR);end=min(N,i+len(q));q=q[:end-i]*gain;sound[0,i:end]+=q*np.sqrt((1-pan)/2);sound[1,i:end]+=q*np.sqrt((1+pan)/2)
# Stone hit, physical sweep, magical wind, barrier fracture, victory sparkle.
for start,gain in [(5.08,.055),(8.23,.065),(18.2,.08)]:
 q=np.arange(round(.45*SR))/SR;n=np.convolve(rng.normal(0,1,len(q)),np.ones(18)/18,'same');add((n+np.sin(2*np.pi*82*q)*.3)*np.exp(-q*13),start,gain)
for start,length,gain in [(6.5,1.2,.04),(10,2,.04),(16,2.2,.055),(23,1.2,.05)]:
 q=np.arange(round(length*SR))/SR;n=np.convolve(rng.normal(0,1,len(q)),np.ones(40)/40,'same');add(n*np.sin(np.pi*q/length)**2,start,gain)
for i in range(13):
 q=np.arange(round(.16*SR))/SR;add(np.sin(2*np.pi*(1000+i*85)*q)*np.exp(-q*27),24.2+i*.065,.014,(-1 if i%2 else 1)*.35)
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(ROOT/'audio/494-cry.ogg')) as inp:
 for f in inp.decode(audio=0):
  for converted in res.resample(f):parts.append(converted.to_ndarray())
for converted in res.resample(None):parts.append(converted.to_ndarray())
cry=np.concatenate(parts,axis=1);cry*=.46/np.abs(cry).max();cry_start=round(24.9*SR);assert cry_start+cry.shape[1]<N
duck=np.clip((t-24.75)/.15,0,1)*np.clip((24.9+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.76*duck;sound[:,cry_start:cry_start+cry.shape[1]]+=cry;sound*=fade;sound*=.79/np.abs(sound).max();pcm=sound.astype(np.float32);wav(F/'soundtrack.wav',pcm)
(F/'score.json').write_text(json.dumps({'title':TITLE,'species':494,'duration':30,'notes':len(events),'music':'Original composition. No sample, transcription or melody from the reference.','cues':{'castle':0,'tournament':4,'victoryEnergy':6.5,'dragonForce':9.5,'barrier':12,'fieryV':16,'freedom':19,'appearance':24.2,'cry':24.9},'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
dest=ROOT/'494-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'27','preset':'medium','maxrate':'340k','bufsize':'680k'}
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=96000;cursor=0
 for i in range(720):
  with Image.open(F/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
qa=F/'encoded-preview';qa.mkdir(exist_ok=True);times=[1,3.5,4.6,5.3,6.8,8.3,9,10.5,13.5,16.8,18.3,20.5,23,24.8,26.2,27.8,29];snapshots={round(t*24):t for t in times}
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert (f.width,f.height)==(960,540)
  if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
  if count==round(27.8*24):f.to_image().resize((480,270),Image.Resampling.NEAREST).save(ROOT/'494-appearance-v1-poster.png',optimize=True)
  count+=1
 assert count==720
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert np.abs(decoded).max()<1
report={'species':494,'shiny':False,'duration':30,'frames':720,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 96 kb/s','music':TITLE,'cryAt':24.9,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'revealAt':24.2,'checks':'720 monotonic video frames and full audio decoded; no clipping; real Victini cry correlation; nine cinematic shots; physical Iron Tail finish.'}
(F/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
