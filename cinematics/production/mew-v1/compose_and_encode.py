from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=32;N=SR*DURATION
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2'] if p.exists())
font=SoundFont(font_path)
tracks={0:(48,.12,.55),1:(73,.04,.15),2:(12,.005,.23),3:(89,.2,.7),4:(8,.005,.4),5:(45,.015,.16),6:(46,.005,.35)}
events=[]
def note(ch,key,time,length,velocity=55):events.append((ch,key,time,length,velocity))
def chord(ch,keys,time,length,velocity=45):
 for key in keys:note(ch,key,time,length,velocity)
# The original six-second Mewtwo island introduction is preserved, then a new
# mischievous woodland score follows the moving shadow and opens into the clearing.
chord(3,[46,53,61,70],0,5.8,29)
for i,key in enumerate([77,84,79,86,82,75]):note(4,key,.5+i*.83,.4,39+i%2*4)
for i,key in enumerate([58,65,73,77]):note(6,key,2.2+i*.7,.45,34)
beat=60/114;eighth=beat/2
for start,root,third in [(6,49,4),(9,46,3),(12,54,4),(15,56,4)]:
 chord(0,[root,root+7,root+third+12,root+21],start,2.8,25)
 for i,offset in enumerate([0,7,12,third+12,7,14,12,7,third+12,19]):
  note(2,root+12+offset,start+i*eighth,.13,39+(i%3)*4)
  if i%2==0:note(5,root-12+(i%4==2)*7,start+i*eighth,.17,42)
 for i,offset in enumerate([19,16 if third==4 else 15,14,12,19]):note(1,root+offset,start+.35+i*.49,.29,41)
# The shadow moves away into the light: thin texture, a rising harp and soft flute.
for start,keys in [(18,[46,53,61,68]),(21,[56,63,68,72])]:chord(3,keys,start,2.9,28)
for i,key in enumerate([70,73,77,80,77,85,82,80]):note(6,key,18.25+i*.62,.43,36+i%3*3)
for i,key in enumerate([77,80,84,85]):note(1,key,20.6+i*.58,.58,33+i*3)
# Mew appears: a luminous original answer, followed by a gentle final cadence.
for start,root in [(24,49),(27,54),(29.5,49)]:
 length=min(2.8,31.7-start);chord(0,[root,root+7,root+16,root+23],start,length,36)
 chord(3,[root+12,root+19,root+28],start,length,25)
for i,key in enumerate([73,80,85,89,87,84,85,80,82,77,80,85]):note(4,key,24.15+i*.51,.4,47 if i<5 else 38)
for i,key in enumerate([61,68,73,77,80,85]):note(6,key,24+i*.09,.8,42)
for i,key in enumerate([77,80,85,84,80,77]):note(1,key,27.2+i*.55,.45,42)
score=np.zeros((2,N+SR),np.float32)
for ch,key,time,length,velocity in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release)
 start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for seconds,gain in [(.047,.12),(.091,.09),(.173,.055),(.287,.03)]:
 off=round(seconds*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];t=np.arange(N)/SR;score*=np.minimum(1,t/.25)*np.minimum(1,(DURATION-t)/.65);score*=.51/float(np.abs(score).max())
def write_wav(path,data):
 with wave.open(str(path),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(data,-1,1).T*32767).astype('<i2').tobytes())
def load_wav(path):
 with wave.open(str(path),'rb') as f:
  assert f.getframerate()==SR and f.getnchannels()==2 and f.getsampwidth()==2
  return np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).T.astype(np.float32)/32767
old=next(p for p in [ROOT.parent/'mewtwo-film',ROOT.parent/'mewtwo-v1'] if (p/'mewtwo-soundtrack.wav').exists())
intro=load_wav(old/'le-projet-origine-score.wav')[:,:6*SR]
score[:,:6*SR]=intro
write_wav(ROOT/'l-ombre-de-la-jungle-score.wav',score)
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
(ROOT/'l-ombre-de-la-jungle.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
rng=np.random.default_rng(151);sound=score.astype(np.float64)*.81
def add(sample,start,gain=1,pan=0):
 i=round(start*SR);end=min(N,i+len(sample));q=sample[:end-i]*gain
 sound[0,i:end]+=q*np.sqrt((1-pan)/2);sound[1,i:end]+=q*np.sqrt((1+pan)/2)
def noise(length,smooth=20):return np.convolve(rng.normal(0,1,round(length*SR)),np.ones(smooth)/smooth,'same')
# Jungle wind, a few distant bird calls and moving leaf rustles, all synthesized.
q=np.arange(26*SR)/SR;env=np.minimum(1,q/.6)*np.minimum(1,(26-q)/.7)
add(noise(26,120)*env,6,.018)
for i,start in enumerate([6.8,8.5,10,12.8,14.6,16.7,18.8,20.7,22.5]):
 q=np.arange(round(.38*SR))/SR;pan=[-.6,-.1,.65,.1][i%4]
 add(noise(.38,4)*np.sin(np.pi*q/.38)**2,start,.014,pan)
for i,start in enumerate([7.1,10.8,14.3,19.5,22.1,28.3]):
 q=np.arange(round(.24*SR))/SR
 add(np.sin(2*np.pi*((2200+i%3*210)*q+180*q*q+7*np.sin(q*44)))*np.sin(np.pi*q/.24)**2,start,.006,(i%2*2-1)*.65)
q=np.arange(round(.9*SR))/SR
add((noise(.9,38)*.45+np.sin(2*np.pi*(520*q+430*q*q))*.11)*np.sin(np.pi*q/.9)**2,24,.07)
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(ROOT/'audio/151-cry.ogg')) as inp:
 for f in inp.decode(audio=0):
  for converted in res.resample(f):parts.append(converted.to_ndarray())
for converted in res.resample(None):parts.append(converted.to_ndarray())
cry=np.concatenate(parts,axis=1);cry*=.36/float(np.abs(cry).max());cry_start=round(25.3*SR)
duck=np.clip((t-25.15)/.15,0,1)*np.clip((25.3+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.7*duck
sound[:,cry_start:cry_start+cry.shape[1]]+=cry
sound*=np.minimum(1,t/.2)*np.minimum(1,(DURATION-t)/.6)
sound*=.74/float(np.abs(sound).max())
# Preserve the exact original opening audio, after all normalization and effects.
sound[:,:6*SR]=load_wav(old/'mewtwo-soundtrack.wav')[:,:6*SR]
pcm=sound.astype(np.float32);write_wav(ROOT/'mew-soundtrack.wav',pcm)
(ROOT/'score.json').write_text(json.dumps({'title':'L’Ombre de la jungle','duration':32,'notes':len(events),'music':'Original woodland cinematic score; same six-second introduction as Le Projet Origine, then new marimba/flute/pizzicato/harp/celesta music.','cues':{'islandMural':0,'forestFloor':6,'canopy':12,'clearingApproach':18,'mewReveal':24.35,'mewCry':25.3},'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
dest=ROOT/'151-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
 for i in range(768):
  with Image.open(ROOT/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
qa=ROOT/'encoded-preview';qa.mkdir(exist_ok=True)
times=[1.2,4.5,6.5,7.4,8.2,9,9.8,10.5,11.2,12.5,13.5,14.3,15.3,16.3,17.2,18.3,19.3,20.3,21.3,22.3,23.7,24.2,25.3,26.8,28.5,30.5]
snapshots={round(when*24):when for when in times}
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert (f.width,f.height)==(960,540)
  if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
  if count==round(28.5*24):f.to_image().save(ROOT/'151-appearance-v1-poster.png')
  count+=1
 assert count==768
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1
# Every opening frame matches the approved Mewtwo render, with no DNA scene.
prior_frames=old/'frames';identical_frames=None
if prior_frames.exists():
 identical_frames=sum((ROOT/'frames'/f'{i:05}.png').read_bytes()==(prior_frames/f'{i:05}.png').read_bytes() for i in range(144))
 assert identical_frames==144,'Preserve the whole approved six-second opening'
with wave.open(str(ROOT/'mew-soundtrack.wav'),'rb') as f:mew_intro=f.readframes(6*SR)
with wave.open(str(old/'mewtwo-soundtrack.wav'),'rb') as f:old_intro=f.readframes(6*SR)
assert mew_intro==old_intro,'Preserve opening audio exactly'
visual=json.loads((ROOT/'render-info.json').read_text(encoding='utf-8'))
report={'species':151,'shiny':False,'duration':32,'frames':768,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':'L’Ombre de la jungle','cryAt':25.3,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'identicalOpeningFrames':identical_frames,'openingAudioIdentical':True,'revealAt':24.35,'checks':'768 monotonic frames and complete stereo audio; no clipping; real Mew cry at 25.3s; original opening preserved; three moving shadow shots before clearing reveal.','visualChecks':visual['visualChecks'],'motionChecks':visual['motionChecks']}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['visualChecks','motionChecks']}),flush=True)
