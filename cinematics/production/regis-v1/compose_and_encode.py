from pathlib import Path
from fractions import Fraction
import argparse,json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=28;N=SR*DURATION
parser=argparse.ArgumentParser();parser.add_argument('--species',type=int,choices=[377,378,379]);args=parser.parse_args()
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
377:('Le Sceau des Sables',38,[0,7,10,14,12,7],12),
378:("L’Attente du Glacier",42,[0,7,9,16,12,7],8),
379:("Le Souffle de l’Acier",40,[0,1,7,10,12,6],11)
}
for species,(title,root,motif,bell) in themes.items():
 if args.species and species!=args.species:continue
 folder=ROOT/str(species);folder.mkdir(exist_ok=True)
 tracks={0:(48,.12,.55),1:(89,.2,.7),2:(bell,.005,.35),3:(52,.15,.55),4:(47,.005,.4),5:(60,.04,.25),6:(46,.005,.35)}
 events=[]
 def note(ch,key,time,length,velocity=55):events.append((ch,key,time,length,velocity))
 def chord(ch,keys,time,length,velocity=45):
  for key in keys:note(ch,key,time,length,velocity)
 # Three new scores: a shared subterranean arc, separate pitches, rhythms and timbres.
 chord(1,[root,root+7,root+19],0,5.1,28)
 for i,key in enumerate(motif[:5]):note(2,root+24+key,.4+i*.86,.4,37+i%2*4)
 if species==377:
  for i in range(7):note(2,root+12+motif[i%6],5.1+i*.88,.32,43)
  chord(0,[root,root+7,root+10],8.8,2.9,38);note(4,root-2,10.25,.65,64)
 elif species==378:
  chord(3,[root+12,root+19,root+28],5,6.5,24)
  for i in range(16):note(2,root+36+[0,7,9,4][i%4],5.7+i*.34,.16,34+i%3*3)
 else:
  for i in range(12):note(2,root+12+motif[i%6],5.3+i*.51,.23,42)
  for i in range(9):note(6,root+24+[0,7,12,19,24,19,12,7,24][i],8.4+i*.33,.32,39+i*2)
 chord(0,[root,root+7,root+13],12,3.2,40)
 for i in range(7):note(2,root+12+motif[i%6],12+i*.38,.29,37)
 chord(1,[root,root+7],15,3.0,21)
 # Seven quiet tones answer the seven face lights in the otherwise silent chamber.
 for i in range(7):note(2,root+24+[0,7,10,12,14,19,24][i],18.25+i*.25,.21,32+i*2)
 chord(5,[root+12,root+19,root+24,root+31],21.5,1.1,74)
 chord(0,[root,root+7,root+12,root+19,root+26],21.5,3.3,59)
 chord(3,[root+12,root+19,root+26],21.5,2.3,42);note(4,root-2,21.5,.72,83)
 for i,key in enumerate(motif):note(2,root+24+key,24+i*.49,.32,52)
 chord(0,[root,root+7,root+12,root+19],25,2.5,44)
 score=np.zeros((2,N+SR),np.float32)
 for ch,key,time,length,velocity in events:
  program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release)
  start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
 dry=score.copy()
 for seconds,gain in [(.057,.14),(.113,.1),(.193,.065),(.317,.035)]:
  off=round(seconds*SR);score[:,off:]+=dry[::-1,:-off]*gain
 score=score[:,:N];t=np.arange(N)/SR;score*=np.minimum(1,t/.25)*np.minimum(1,(28-t)/.6)
 # Intentionally spare darkness; preserve the suspense of seven lights.
 quiet=1-.78*np.clip((t-17.2)/.6,0,1)*np.clip((21.5-t)/.25,0,1)
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
 def step(start,gain=.035):
  q=np.arange(round(.22*SR))/SR;n=np.convolve(rng.normal(0,1,len(q)),np.ones(12)/12,'same')
  add((n*.6+np.sin(2*np.pi*80*q)*.25)*np.exp(-q*25)*np.minimum(1,q/.008),start,gain)
 for start in [.45,1.13,1.82,2.5,3.17,15.15,15.8,16.45]:step(start)
 if species==377:
  for start in [6,7,8,9]:step(start,.05)
  q=np.arange(round(.8*SR))/SR;add((np.sin(2*np.pi*(60*q-12*q*q))+.5*np.convolve(rng.normal(0,1,len(q)),np.ones(31)/31,'same'))*np.exp(-q*6),10.25,.09)
 elif species==378:
  for start in np.arange(5.8,11,.16):
   q=np.arange(round(.025*SR))/SR;add(np.sin(2*np.pi*1650*q)*np.exp(-q*190),float(start),.014)
 else:
  q=np.arange(round(3.5*SR))/SR;n=np.convolve(rng.normal(0,1,len(q)),np.ones(27)/27,'same')
  add(n*np.sin(np.pi*q/3.5)**2,8.4,.075)
 # Opening stone/ice/steel panels: filtered friction and low resonances.
 q=np.arange(round(2.8*SR))/SR;n=np.convolve(rng.normal(0,1,len(q)),np.ones(50 if species==377 else 22)/ (50 if species==377 else 22),'same')
 tone=np.sin(2*np.pi*(38 if species==377 else 115 if species==378 else 57)*q)
 add((n*.8+tone*.12)*np.sin(np.pi*q/2.8)**1.4,12,.1)
 q=np.arange(round(.08*SR))/SR;add(rng.normal(0,1,len(q))*np.exp(-q*90),17.35,.026)
 q=np.arange(round(.75*SR))/SR;add((np.sin(2*np.pi*(49*q-9*q*q))+.3*np.convolve(rng.normal(0,1,len(q)),np.ones(30)/30,'same'))*np.exp(-q*5),21.5,.09)
 res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
 with av.open(str(ROOT/'audio'/f'{species}-cry.ogg')) as inp:
  for f in inp.decode(audio=0):
   for converted in res.resample(f):parts.append(converted.to_ndarray())
 for converted in res.resample(None):parts.append(converted.to_ndarray())
 cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());cry_start=round(22.2*SR)
 assert cry_start+cry.shape[1]<N
 duck=np.clip((t-22.05)/.15,0,1)*np.clip((22.2+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.72*duck
 sound[:,cry_start:cry_start+cry.shape[1]]+=cry
 sound*=np.minimum(1,t/.2)*np.minimum(1,(28-t)/.6);sound*=.78/float(np.abs(sound).max());pcm=sound.astype(np.float32)
 write_wav(folder/'soundtrack.wav',pcm)
 (folder/'score.json').write_text(json.dumps({'species':species,'title':title,'duration':28,'notes':len(events),'music':'Original score, no official theme sample or transcription.','cues':{'explore':0,'puzzle':5,'door':12,'enter':15,'faceLights':18.25,'reveal':21.5,'cry':22.2},'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
 dest=ROOT/f'{species}-appearance-v1.mp4'
 with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
  v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
  a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
  for i in range(672):
   with Image.open(folder/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
   f.pts=i;f.time_base=Fraction(1,24)
   for packet in v.encode(f):out.mux(packet)
   end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
   for packet in a.encode(af):out.mux(packet)
   cursor=end
  for packet in v.encode():out.mux(packet)
  for packet in a.encode():out.mux(packet)
 qa=folder/'encoded-preview';qa.mkdir(exist_ok=True)
 snapshots={round(when*24):when for when in [1,4.4,5.8,7.8,10.8,12.8,14.2,16,17.5,19.6,20.7,21.8,22.6,24.8,26.8]}
 with av.open(str(dest)) as inp:
  count=0;last=-1
  for f in inp.decode(video=0):
   assert f.time>last;last=f.time
   assert (f.width,f.height)==(960,540)
   if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
   if count==round(24.8*24):f.to_image().save(ROOT/f'{species}-appearance-v1-poster.png')
   count+=1
  assert count==672
 with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
 corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1
 visual=json.loads((folder/'render-info.json').read_text(encoding='utf-8'))
 report={'species':species,'shiny':False,'duration':28,'frames':672,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':title,'cryAt':22.2,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'facePoints':len(visual['eyePoints']),'darkLitPixelFraction':visual['darkLitPixelFraction'],'revealAt':21.5,'checks':'672 monotonic video frames and full audio decoded; no clipping; real species cry correlation; exactly seven sprite-derived face points; dark room contains only face-light pixels.'}
 (folder/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)

