from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=40;N=SR*DURATION
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2',ROOT.parent/'orchestra/GeneralUser-GS.sf2'] if p.exists())
font=SoundFont(font_path)
tracks={0:(48,.12,.55),1:(38,.006,.12),2:(81,.012,.12),3:(89,.2,.7),4:(8,.005,.4),5:(52,.15,.55),6:(46,.005,.35),7:(12,.005,.22)}
events=[]
def note(ch,key,time,length,velocity=55):events.append((ch,key,time,length,velocity))
def chord(ch,keys,time,length,velocity=45):
 for key in keys:note(ch,key,time,length,velocity)
# New music, authored for this story. The linked XY theme supplies a broad
# electronic battle atmosphere, never a melody, recording, MIDI or sample.
chord(3,[46,53,61,70],0,5.8,29)
for i,key in enumerate([77,84,79,86,82,75]):note(4,key,.5+i*.83,.4,39+i%2*4)
for i,key in enumerate([58,65,73,77]):note(6,key,2.2+i*.7,.45,34)
# Mew is gentle and elusive: a short, original celesta/harp answer.
for start,root in [(6,48),(9,53)]:
 chord(0,[root,root+7,root+16,root+26],start,2.8,31)
 for i,key in enumerate([12,19,24,28,19,26]):note(6,root+key,start+i*.43,.4,35)
for i,key in enumerate([84,79,86,82,89,84]):note(4,key,6.35+i*.79,.38,46)
# The experiment: nervous electronic eighths and a moving synth bass.
motif=[0,7,3,10,6,12,5,1];beat=60/156;eighth=beat/2
for i in range(36):
 time=12+i*eighth
 if time>=18.9:break
 note(2,69+motif[i%8],time,.1,39+i%3*4)
 if i%2==0:note(1,33+[0,0,7,1][i//2%4],time,.15,51)
for start,root in [(12,45),(14.3,46),(16.6,43)]:chord(0,[root,root+7,root+15,root+22],start,2.1,42)
# Ditto: strange short gestures, separate from the eventual Mewtwo lead.
for i in range(29):
 time=19+i*.2
 note(7,72+[0,1,8,6,11,7][i%6],time,.105,43+i%3*4)
 if i%3==0:note(1,33+[0,6,7][i//3%3],time,.16,46)
for t,k in zip([19.15,19.7,20.25,20.8,21.35,21.9],[84,79,86,81,88,93]):note(4,k,t,.3,43)
# Silence around the blast, then damaged machinery and an ominous low pad.
chord(3,[33,40,46],26.1,5.7,25)
for t,k in [(27.2,65),(28.9,72),(30.5,66)]:note(4,k,t,.42,31)
for i in range(9):
 note(1,33+(i%3==0)*7,32+i*.2,.11,42+i*2)
 note(2,69+[0,1,5,7,8,10,12,13,19][i],32.05+i*.2,.1,32+i*3)
# Violet reveal: tense electronic battle energy, original lead and harmony.
chord(0,[45,52,60,67,72],34,2.9,61);chord(5,[57,64,72,79],34,2.6,44)
for i,key in enumerate([69,76,81,84,88]):note(4,key,34+i*.07,.55,58-i*3)
for i in range(30):
 time=34+i*eighth
 if time>=39.7:break
 note(2,69+[0,7,3,10,12,8,6,11][i%8],time,.13,54 if i%4==0 else 45)
 if i%2==0:note(1,33+[0,7,1,6][i//2%4],time,.16,64)
chord(0,[45,52,60,69],37,2.4,50)
score=np.zeros((2,N+SR),np.float32)
for ch,key,time,length,velocity in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release)
 start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for seconds,gain in [(.047,.12),(.091,.09),(.173,.055),(.287,.03)]:
 off=round(seconds*SR);score[:,off:]+=dry[::-1,:-off]*gain
score=score[:,:N];t=np.arange(N)/SR
score*=np.minimum(1,t/.25)*np.minimum(1,(40-t)/.6)
blast_gap=1-.97*np.clip((t-24.85)/.25,0,1)*np.clip((26.3-t)/.25,0,1);score*=blast_gap
score*=.61/float(np.abs(score).max())
def write_wav(path,data):
 with wave.open(str(path),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(data,-1,1).T*32767).astype('<i2').tobytes())
write_wav(ROOT/'le-projet-origine-score.wav',score)
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
(ROOT/'le-projet-origine.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
rng=np.random.default_rng(150);sound=score.astype(np.float64)*.85
def add(sample,start,gain=1,pan=0):
 i=round(start*SR);end=min(N,i+len(sample));q=sample[:end-i]*gain
 sound[0,i:end]+=q*np.sqrt((1-pan)/2);sound[1,i:end]+=q*np.sqrt((1+pan)/2)
def noise(length,smooth=20):
 return np.convolve(rng.normal(0,1,round(length*SR)),np.ones(smooth)/smooth,'same')
# Subtle coastal wind, scanner pulses and tank machinery.
q=np.arange(6*SR)/SR;add(noise(6,80)*np.minimum(1,q/.4)*np.minimum(1,(6-q)/.4),0,.025)
for start in [7.6,8.3,9.1,10.1]:
 q=np.arange(round(.17*SR))/SR;add(np.sin(2*np.pi*(950*q+140*q*q))*np.exp(-q*25)*np.minimum(1,q/.007),start,.023)
q=np.arange(7*SR)/SR;add((np.sin(2*np.pi*60*q)+.25*np.sin(2*np.pi*120*q))*np.sin(np.pi*q/7)**2,12,.012)
for start in [13.1,14.3,15.5,16.4,17.3,18.2]:
 q=np.arange(round(.23*SR))/SR;add(np.sin(2*np.pi*(340*q-370*q*q))*np.exp(-q*16)*np.minimum(1,q/.01),start,.018)
for i,start in enumerate([19.15,19.7,20.25,20.8,21.35,21.9]):
 q=np.arange(round(.21*SR))/SR;add(np.sin(2*np.pi*((800+i*80)*q-900*q*q))*np.exp(-q*19)*np.minimum(1,q/.01),start,.024,(i%3-1)*.4)
# Explosion is heard on the black frame. Long low tail continues into the ruin.
q=np.arange(round(2.4*SR))/SR
blast=(.72*np.sin(2*np.pi*(52*q-8*q*q))+.45*noise(2.4,19)+.14*rng.normal(0,1,len(q))*np.exp(-q*20))
blast*=np.exp(-q*2.8)*np.minimum(1,q/.004);add(blast,25.3,.62)
for i,start in enumerate([26.05,26.2,26.43,27.1,28.4,30.1]):
 q=np.arange(round(.12*SR))/SR;add((np.sin(2*np.pi*(1700+i*230)*q)+.25*rng.normal(0,1,len(q)))*np.exp(-q*45)*np.minimum(1,q/.003),start,.015)
for start in [32.08,32.68,33.26,33.77]:
 q=np.arange(round(.065*SR))/SR;add(rng.normal(0,1,len(q))*np.exp(-q*75),start,.018)
q=np.arange(round(.8*SR))/SR
add((noise(.8,20)*.6+np.sin(2*np.pi*(140*q+700*q*q))*.17)*np.sin(np.pi*q/.8)**2,34,.12)
# Original synthesized electronic percussion. Density grows at the reveal.
def kick(start,gain):
 q=np.arange(round(.24*SR))/SR;add(np.sin(2*np.pi*(47*q+2*(1-np.exp(-q*30))))*np.exp(-q*17),start,gain)
def snare(start,gain):
 q=np.arange(round(.16*SR))/SR;add((rng.normal(0,1,len(q))*.6+np.sin(2*np.pi*180*q)*.3)*np.exp(-q*26),start,gain)
def hat(start,gain):
 q=np.arange(round(.04*SR))/SR;n=rng.normal(0,1,len(q));n-=np.convolve(n,np.ones(8)/8,'same');add(n*np.exp(-q*130),start,gain)
for phase,end,gain in [(12,18.9,.045),(34,39.7,.072)]:
 for i in range(40):
  at=phase+i*eighth
  if at>=end:break
  hat(at,gain*.1)
  if i%4 in (0,3):kick(at,gain)
  if i%4==2:snare(at,gain*.55)
def load_cry(id):
 res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
 with av.open(str(ROOT/'audio'/f'{id}-cry.ogg')) as inp:
  for f in inp.decode(audio=0):
   for converted in res.resample(f):parts.append(converted.to_ndarray())
 for converted in res.resample(None):parts.append(converted.to_ndarray())
 return np.concatenate(parts,axis=1)
mew=load_cry(151);mew*=.17/float(np.abs(mew).max());ms=round(7.2*SR);sound[:,ms:ms+mew.shape[1]]+=mew
cry=load_cry(150);cry*=.43/float(np.abs(cry).max());cry_start=35*SR
duck=np.clip((t-34.85)/.15,0,1)*np.clip((35+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.76*duck
sound[:,cry_start:cry_start+cry.shape[1]]+=cry
sound*=np.minimum(1,t/.2)*np.minimum(1,(40-t)/.55);sound*=.78/float(np.abs(sound).max());pcm=sound.astype(np.float32)
write_wav(ROOT/'mewtwo-soundtrack.wav',pcm)
(ROOT/'score.json').write_text(json.dumps({'title':'Le Projet Origine','duration':40,'notes':len(events),'music':'Original electronic cinematic score, not a remix, transcription or sample of the reference.','reference':'https://www.youtube.com/watch?v=aD0YtmKrX20','referenceTitle':'Pokemon X and Y - Kanto Legendary Battle Theme (Mewtwo) from the Actual OST','cues':{'islandMural':0,'mewEncounter':6,'dnaCollected':10.4,'incubator':12,'ditto':19,'shinyDitto':21.9,'explosionOnBlack':25.3,'ruins':26,'blackFlickers':32,'violetFlash':34,'mewtwoCry':35},'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
dest=ROOT/'150-appearance-v1.mp4'
with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
 a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
 for i in range(960):
  with Image.open(ROOT/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
  end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
  for packet in a.encode(af):out.mux(packet)
  cursor=end
 for packet in v.encode():out.mux(packet)
 for packet in a.encode():out.mux(packet)
qa=ROOT/'encoded-preview';qa.mkdir(exist_ok=True)
times=[1.2,4.5,6.7,8.2,9.6,10.8,12.7,15.4,18.1,19.8,21.3,22.7,24.3,25.55,26.7,29.3,31.3,32.2,32.5,33.35,34.05,34.6,35.3,37.3,39]
snapshots={round(when*24):when for when in times}
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert (f.width,f.height)==(960,540)
  if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
  if count==round(37.3*24):f.to_image().save(ROOT/'150-appearance-v1-poster.png')
  count+=1
 assert count==960
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1
def rms(start,end):return float(np.sqrt(np.mean(decoded[:,round(start*SR):round(end*SR)]**2)))
before,impact=rms(25.1,25.25),rms(25.35,25.55);assert impact>max(.015,before*3),'Explosion must clearly emerge from the preceding silence'
visual=json.loads((ROOT/'render-info.json').read_text(encoding='utf-8'))
report={'species':150,'shiny':False,'duration':40,'frames':960,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':'Le Projet Origine','cryAt':35,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'explosionAt':25.3,'preExplosionRMS':before,'explosionRMS':impact,'normalDittos':5,'shinyDitto':True,'revealAt':34,'checks':'960 monotonic frames and full audio decode; no clipping; real Mewtwo cry correlation at 35s; explosion RMS above preceding silence; actual blue shiny sprite; black explosion interval and violet reveal verified.','visualChecks':visual['visualChecks']}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='visualChecks'}),flush=True)

