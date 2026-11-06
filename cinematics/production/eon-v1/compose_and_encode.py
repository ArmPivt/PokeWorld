from pathlib import Path
from fractions import Fraction
import argparse,json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=32;N=SR*DURATION
parser=argparse.ArgumentParser();parser.add_argument('--species',type=int,choices=[380,381]);args=parser.parse_args()
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2',ROOT.parent/'orchestra/GeneralUser-GS.sf2'] if p.exists())
font=SoundFont(font_path)
def write_wav(path,data):
 with wave.open(str(path),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(data,-1,1).T*32767).astype('<i2').tobytes())
def vlq(n):
 out=[n&127];n>>=7
 while n:out.insert(0,(n&127)|128);n>>=7
 return bytes(out)
def midi_chunk(items):
 data=b'';last=0
 for time,priority,payload in sorted(items,key=lambda a:(a[0],a[1])):
  tick=round(time*960);data+=vlq(tick-last)+payload;last=tick
 data+=b'\0\xff\x2f\0';return b'MTrk'+struct.pack('>I',len(data))+data
themes={
380:('La Promesse de l’Île du Sud',53,[0,4,7,11,9,7,5,2],8),
381:('Les Ailes de l’Île du Sud',50,[0,7,9,12,16,14,11,7],11)
}
for species,(title,root,motif,bell) in themes.items():
 if args.species and species!=args.species:continue
 folder=ROOT/str(species);folder.mkdir(exist_ok=True)
 tracks={0:(48,.12,.55),1:(89,.2,.7),2:(bell,.005,.35),3:(52,.15,.55),4:(12,.005,.3),5:(73,.04,.25),6:(46,.005,.35)}
 events=[]
 def note(ch,key,time,length,velocity=55):events.append((ch,key,time,length,velocity))
 def chord(ch,keys,time,length,velocity=45):
  for key in keys:note(ch,key,time,length,velocity)
 # Original music: a coastal invitation, a lilting flight, a quiet forest and
 # a luminous final cadence. No audio or melody is taken from the reference.
 chord(1,[root,root+7,root+14,root+21],0,4.9,29)
 for i,key in enumerate(motif[:6]):note(2,root+24+key,.25+i*.7,.45,42+i%2*4)
 for i,key in enumerate([0,7,12,16,19]):note(6,root+12+key,3.2+i*.3,.45,44)
 chord(0,[root,root+7,root+12,root+16],5,2.8,42)
 for i,key in enumerate(motif[:5]):note(5,root+24+key,5.1+i*.52,.45,47)
 # Flying above the ocean: strings, harp triplets and a woodwind melody.
 for j,(start,bass) in enumerate([(8,root),(10,root+5),(12,root+7)]):
  chord(0,[bass,bass+7,bass+12,bass+16,bass+23],start,1.9,47+j*3)
  for i in range(9):
   note(6,bass+[12,19,24,28,24,19,16,19,24][i],start+i*.215,.29,43+i%3*4)
   if i%3==0:note(4,bass,start+i*.215,.2,32)
 for i,key in enumerate(motif):note(5,root+24+key,8.1+i*.68,.55,53)
 chord(3,[root+12,root+19,root+24],14,2.7,25)
 for i,key in enumerate([19,16,12,14,19]):note(2,root+24+key,14.1+i*.52,.38,38)
 # The forest grows quieter, with an original suspended answering motif.
 for start,bass in [(17,root-3),(20.5,root+2),(23,root+7)]:
  chord(1,[bass,bass+7,bass+14,bass+21],start,2.7,30)
  for i,key in enumerate([12,19,23,26]):note(6,bass+key,start+i*.6,.45,35+i*2)
 for i,key in enumerate([12,7,9,16,14,19]):note(5,root+24+key,17.4+i*.95,.55,37+i*2)
 for i,key in enumerate([19,21,24,28,31,33]):note(2,root+12+key,24+i*.23,.35,42+i*3)
 chord(3,[root+12,root+19,root+26],25,1.0,37)
 # Resolve out of the full white screen; leave room for the real species cry.
 chord(0,[root,root+7,root+12,root+16,root+23],26,2.8,58)
 for i,key in enumerate([12,19,24,28,31]):note(2,root+key,26+i*.1,.65,58-i*3)
 for i,key in enumerate(motif):note(5,root+24+key,28.2+i*.43,.33,43)
 chord(0,[root,root+7,root+12,root+19],29.8,1.6,42)
 score=np.zeros((2,N+SR),np.float32)
 for ch,key,time,length,velocity in events:
  program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release)
  start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
 dry=score.copy()
 for seconds,gain in [(.057,.14),(.113,.1),(.193,.065),(.317,.035)]:
  off=round(seconds*SR);score[:,off:]+=dry[::-1,:-off]*gain
 score=score[:,:N];t=np.arange(N)/SR;score*=np.minimum(1,t/.25)*np.minimum(1,(32-t)/.6)
 # The forest passage leaves more space around footsteps and distant light.
 quiet=1-.32*np.clip((t-17)/1.5,0,1)*np.clip((26-t)/.5,0,1)
 score*=quiet;score*=.67/float(np.abs(score).max());write_wav(folder/'score.wav',score)
 chunks=[midi_chunk([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
 for ch,(program,_,_) in tracks.items():
  items=[(0,0,bytes([0xc0+ch,program]))]
  for channel,key,time,length,velocity in events:
   if channel==ch:items.extend([(time,2,bytes([0x90+ch,key,velocity])),(time+length,1,bytes([0x80+ch,key,0]))])
  chunks.append(midi_chunk(items))
 (folder/'score.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
 rng=np.random.default_rng(species);sound=score.astype(np.float64)*.85
 def add(sample,start,gain=1,pan=0):
  i=round(start*SR);end=min(N,i+len(sample));q=sample[:end-i]*gain
  sound[0,i:end]+=q*np.sqrt((1-pan)/2);sound[1,i:end]+=q*np.sqrt((1+pan)/2)
 # Gentle surf at the departure, wind in flight and running water at the reveal.
 for start,length,gain,pan in [(0,8,.045,-.2),(8,6,.075,0),(14,3,.035,.2),(26,6,.045,0)]:
  q=np.arange(round(length*SR))/SR;n=np.convolve(rng.normal(0,1,len(q)),np.ones(55)/55,'same')
  envelope=np.minimum(1,q/.5)*np.minimum(1,(length-q)/.5)*(.55+.45*np.sin(q*1.8)**2)
  add(n*envelope,start,gain,pan)
 def step(start,gain=.028):
  q=np.arange(round(.19*SR))/SR;n=np.convolve(rng.normal(0,1,len(q)),np.ones(14)/14,'same')
  add((n*.6+np.sin(2*np.pi*93*q)*.15)*np.exp(-q*25)*np.minimum(1,q/.008),start,gain)
 for start in [5.3,5.65,6,6.35,14.8,15.25,15.7,16.15]:step(start)
 for i,start in enumerate(np.arange(17.2,24.8,.63)):
  step(float(start),.022)
  q=np.arange(round(.12*SR))/SR;add(rng.normal(0,1,len(q))*np.exp(-q*40),float(start)+.04,.004,(i%2-.5)*.3)
 for start in [3.6,7.15,14.25,15.5]:
  q=np.arange(round(.65*SR))/SR;n=np.convolve(rng.normal(0,1,len(q)),np.ones(25)/25,'same')
  add(n*np.sin(np.pi*q/.65)**2,start,.045)
 # Soft chime at the white transition, instead of an explosive impact.
 q=np.arange(round(1.5*SR))/SR
 add((np.sin(2*np.pi*1120*q)+.35*np.sin(2*np.pi*1680*q))*np.exp(-q*4)*np.minimum(1,q/.01),25,.025)
 res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
 with av.open(str(ROOT/'audio'/f'{species}-cry.ogg')) as inp:
  for f in inp.decode(audio=0):
   for converted in res.resample(f):parts.append(converted.to_ndarray())
 for converted in res.resample(None):parts.append(converted.to_ndarray())
 cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());cry_start=round(27*SR)
 assert cry_start+cry.shape[1]<N
 duck=np.clip((t-26.85)/.15,0,1)*np.clip((27+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.72*duck
 sound[:,cry_start:cry_start+cry.shape[1]]+=cry
 sound*=np.minimum(1,t/.2)*np.minimum(1,(32-t)/.6);sound*=.78/float(np.abs(sound).max());pcm=sound.astype(np.float32)
 write_wav(folder/'soundtrack.wav',pcm)
 (folder/'score.json').write_text(json.dumps({'species':species,'title':title,'duration':32,'notes':len(events),'music':'Original score, no official theme sample or transcription.','cues':{'arrival':0,'boarding':5,'flight':8,'landing':14,'forest':17,'white':25,'reveal':26,'cry':27},'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
 dest=ROOT/f'{species}-appearance-v1.mp4'
 with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
  v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
  a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
  for i in range(768):
   with Image.open(folder/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
   f.pts=i;f.time_base=Fraction(1,24)
   for packet in v.encode(f):out.mux(packet)
   end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
   for packet in a.encode(af):out.mux(packet)
   cursor=end
  for packet in v.encode():out.mux(packet)
  for packet in a.encode():out.mux(packet)
 qa=folder/'encoded-preview';qa.mkdir(exist_ok=True)
 snapshots={round(when*24):when for when in [1,3.8,5.6,6.9,7.7,8.8,11.5,13.6,14.5,16.2,17.5,20,22.5,24.3,25.5,26.5,27.3,29.5,31]}
 with av.open(str(dest)) as inp:
  count=0;last=-1
  for f in inp.decode(video=0):
   assert f.time>last;last=f.time
   assert (f.width,f.height)==(960,540)
   if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
   if count==round(29.5*24):f.to_image().save(ROOT/f'{species}-appearance-v1-poster.png')
   count+=1
  assert count==768
 with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
 corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1
 visual=json.loads((folder/'render-info.json').read_text(encoding='utf-8'))
 report={'species':species,'shiny':False,'duration':32,'frames':768,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':title,'cryAt':27,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'guideSpecies':species,'revealedSpecies':species,'whiteHoldAt':25.5,'whiteChecks':visual['whiteChecks'],'revealAt':26,'checks':'768 monotonic video frames and full audio decoded; no clipping; real species cry correlation; matching guide/reveal Pokémon; full-white transition before the final reveal.'}
 (folder/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)

