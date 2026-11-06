from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib,sys
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont
ROOT=Path(__file__).resolve().parent;SR=48000
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2'] if p.exists())
font=SoundFont(font_path)
TIMES={144:[1.2,3.8,5.6,8.3,10.3,11.6,14,16.5,17.5,19,20.6,21.3,22.3,24,26,28.5],145:[1.2,3.6,5.3,6.8,9,11.4,12.5,14.5,17.5,18.5,20,21.8,22.3,23.1,25,28.5],146:[1.2,4.4,6.6,9,11.3,12.5,15,17.7,18.8,21,23.7,24.3,25.1,27,29,30.8]}
def vlq(n):
 out=[n&127];n>>=7
 while n:out.insert(0,(n&127)|128);n>>=7
 return bytes(out)
def midi_chunk(items):
 data=b'';last=0
 for time,priority,payload in sorted(items,key=lambda a:(a[0],a[1])):
  tick=round(time*960);data+=vlq(tick-last)+payload;last=tick
 data+=b'\0\xff\x2f\0';return b'MTrk'+struct.pack('>I',len(data))+data
def write_wav(path,data):
 with wave.open(str(path),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(data,-1,1).T*32767).astype('<i2').tobytes())
def produce(id):
 info=json.loads((ROOT/f'{id}-render-info.json').read_text(encoding='utf-8'));duration=info['duration'];N=SR*duration
 tracks={0:(48,.1,.55),1:(73,.03,.18),2:(8,.005,.4),3:(89,.2,.65),4:(46,.005,.4),5:(60,.02,.3),6:(81,.008,.14),7:(38,.008,.14),8:(45,.012,.14),10:(52,.1,.5),11:(47,.006,.3)}
 events=[]
 def note(ch,key,time,length,velocity=45):events.append((ch,key,time,length,velocity))
 def chord(ch,keys,time,length,velocity=38):
  for key in keys:note(ch,key,time,length,velocity)
 if id==144:
  # Slow ice chamber harmony, crystalline celesta and harp; no existing theme.
  for start,keys in [(0,[50,57,65,76]),(5,[46,53,62,69]),(8,[48,55,64,74]),(11,[50,57,65,72]),(14,[46,53,62,77]),(17,[45,52,61,67])]:
   length=4.8 if start==0 else 2.8;chord(3,keys,start,length,28);chord(0,keys[:3],start,length,25)
  for i,key in enumerate([86,81,89,84,88,81]):note(2,key,.7+i*.66,.42,36)
  for start,root in [(5,62),(8,60),(11,62),(14,65)]:
   for i,offset in enumerate([0,7,12,4,9,16]):note(4,root+offset,start+i*.42,.5,31+i%3*3)
  for i,key in enumerate([77,81,84,86,81,89]):note(1,key,11.4+i*.66,.52,35)
  for i,key in enumerate([69,74,77,81,84,86,89,93]):note(2,key,17.15+i*.45,.3,32+i*2)
  for start,keys in [(21,[50,57,65,72,77]),(24,[46,53,62,69,77]),(27,[50,57,65,74])]:
   chord(0,keys,start,2.7,48);chord(10,[k+12 for k in keys[:3]],start,2.7,34)
  for i,key in enumerate([86,89,93,91,88,89,84,86,81,86,89]):note(1,key,21.2+i*.68,.47,48 if i<5 else 39)
  for i,key in enumerate([74,81,86,89,93]):note(4,key,21+i*.09,.8,49)
  for i,key in enumerate([93,89,86,81,86]):note(2,key,27.4+i*.37,.44,38)
 elif id==145:
  # Mechanical pulse and angular electronic writing with an original melody.
  chord(3,[40,47,55,66],0,5.9,27)
  for i,key in enumerate([76,77,83,78,86,81]):note(2,key,.55+i*.86,.24,31)
  for start,root in [(6,40),(9,43),(12,41),(15,40)]:
   chord(0,[root,root+7,root+15,root+22],start,2.8,31)
   for i,offset in enumerate([0,7,3,10,12,6,8,1,7,13,10,5]):
    note(6,root+24+offset,start+i*.23,.12,37+i%3*3)
    if i%2==0:note(7,root-12+[0,7,1][i//2%3],start+i*.23,.17,54)
  for i,key in enumerate([64,65,68,70,71,74,76,77,80,83,88]):
   note(6,key,18+i*.34,.16,40+i*2)
   if i%2==0:note(7,28,18+i*.34,.2,53)
  for start,keys in [(22,[40,47,55,62,71]),(25,[43,50,58,65,74]),(27.5,[40,47,56,64,71])]:chord(0,keys,start,min(2.7,29.7-start),51)
  for i,key in enumerate([76,83,79,88,86,81,89,84,80,87,83,76,81,88]):note(6,key,22+i*.5,.21,54 if i%4==0 else 45)
  for i in range(30):
   at=22+i*.25
   if at<29.6:note(7,28+[0,7,1,6][i%4],at,.13,61)
  for i,key in enumerate([76,83,88,92]):note(2,key,22+i*.08,.6,56)
 else:
  # Volcanic low strings become a warm brass/choir ascent at sunrise.
  for start,keys in [(0,[45,52,60,67]),(6,[41,48,57,64]),(9,[43,50,58,65]),(12,[45,52,60,67]),(15,[46,53,62,69])]:
   length=5.8 if start==0 else 2.8;chord(0,keys,start,length,31);chord(3,keys[:3],start,length,26)
  for i,key in enumerate([76,81,79,84,83,88]):note(4,key,.7+i*.8,.5,33)
  for start,root in [(6,41),(9,43),(12,45),(15,46)]:
   for i,offset in enumerate([0,7,3,12,7,10,15,12]):note(8,root+offset,start+i*.34,.2,43+i%2*4)
   for i,offset in enumerate([12,19,15,22]):note(5,root+offset,start+.25+i*.61,.42,29+i*3)
  for i,key in enumerate([45,48,52,55,57,60,64,67,69,72,76]):
   note(0,key,18+i*.48,.36,35+i*3);note(11,38,18+i*.48,.21,43+i*2)
  for start,keys in [(24,[48,55,64,71,76]),(27,[53,60,69,76]),(29.5,[48,55,64,72,79])]:
   length=min(2.8,31.8-start);chord(0,keys,start,length,49);chord(10,[k+12 for k in keys[:3]],start,length,33)
  for i,key in enumerate([72,79,84,88,86,83,84,79,81,76,79,84]):note(5,key,24.15+i*.58,.38,56 if i<5 else 46)
  for i,key in enumerate([60,67,72,76,79,84]):note(4,key,24+i*.075,.75,50)
  for i in range(15):note(11,36 if i%3==0 else 43,24+i*.48,.2,51 if i%3==0 else 39)
 score=np.zeros((2,N+SR),np.float32)
 for ch,key,time,length,velocity in events:
  program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release);start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
 dry=score.copy()
 for seconds,gain in [(.043,.12),(.089,.09),(.157,.06),(.263,.035)]:
  off=round(seconds*SR);score[:,off:]+=dry[::-1,:-off]*gain
 score=score[:,:N];t=np.arange(N)/SR;score*=np.minimum(1,t/.25)*np.minimum(1,(duration-t)/.65);score*=.53/float(np.abs(score).max())
 write_wav(ROOT/f'{id}-score.wav',score)
 chunks=[midi_chunk([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
 for ch,(program,_,_) in tracks.items():
  items=[(0,0,bytes([0xc0+ch,program]))]
  for channel,key,time,length,velocity in events:
   if channel==ch:items.extend([(time,2,bytes([0x90+ch,key,velocity])),(time+length,1,bytes([0x80+ch,key,0]))])
  chunks.append(midi_chunk(items))
 (ROOT/f'{id}-score.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
 rng=np.random.default_rng(id);sound=score.astype(np.float64)*.85
 def add(sample,start,gain=1,pan=0):
  at=round(start*SR);end=min(N,at+len(sample));q=sample[:end-at]*gain;sound[0,at:end]+=q*np.sqrt((1-pan)/2);sound[1,at:end]+=q*np.sqrt((1+pan)/2)
 def noise(length,smooth=20):return np.convolve(rng.normal(0,1,round(length*SR)),np.ones(smooth)/smooth,'same')
 def rush(start,length,gain,pan=0):
  q=np.arange(round(length*SR))/SR;add(noise(length,25)*np.sin(np.pi*q/length)**2,start,gain,pan)
 def thunder(start,length,gain):
  q=np.arange(round(length*SR))/SR;add((noise(length,27)*.7+np.sin(2*np.pi*(46*q-3*q*q))*.3)*np.exp(-q*2.4)*np.minimum(1,q/.01),start,gain)
 if id==144:
  q=np.arange(N)/SR;add(noise(duration,110)*np.minimum(1,q/.5)*np.minimum(1,(duration-q)/.7),0,.028)
  rush(2,2.5,.04,-.3);rush(8,2,.045,.3);rush(17.5,4.3,.14)
  for i,start in enumerate([5.6,8.1,11.8,14.4,17.7,18.5,19.2,20.1]):
   q=np.arange(round(.21*SR))/SR;add(np.sin(2*np.pi*(1300+i*131)*q)*np.exp(-q*25)*np.minimum(1,q/.005),start,.015,(i%3-1)*.5)
 elif id==145:
  q=np.arange(N)/SR;add(noise(duration,6)*np.minimum(1,q/.5)*np.minimum(1,(duration-q)/.7),0,.013)
  thunder(3.6,1.9,.15)
  q=np.arange(12*SR)/SR;add((np.sin(2*np.pi*(55*q+.18*q*q))+.3*np.sin(2*np.pi*110*q))*np.minimum(1,q/3)*np.minimum(1,(12-q)/.4),6,.018)
  for i,start in enumerate([6.2,7,8.1,9.7,11.1,12.5,14.3,16.2,17.4,19,19.48,19.96,21.1]):
   q=np.arange(round(.09*SR))/SR;add((rng.normal(0,1,len(q))*.3+np.sin(2*np.pi*(1700+i*30)*q)*.1)*np.exp(-q*30),start,.028,(i%3-1)*.4)
  thunder(22,2,.32)
  for start in np.arange(6,29.5,.46):
   q=np.arange(round(.2*SR))/SR;gain=.027 if start<22 else .045;add(np.sin(2*np.pi*(45*q+2*(1-np.exp(-q*27))))*np.exp(-q*20),float(start),gain)
  rush(21.4,.8,.12)
 else:
  q=np.arange(N)/SR;add(noise(duration,110)*np.minimum(1,q/.5)*np.minimum(1,(duration-q)/.7),0,.026)
  for i,start in enumerate([7.2,9.6,12.4,14.6,16.3,18.5,20.1,22]):thunder(start,.8,.022+i*.003)
  rush(17,1,.07);rush(18.7,5.9,.13);thunder(23.85,2.3,.22)
  for i,start in enumerate(np.arange(6.3,30,.7)):
   q=np.arange(round(.05*SR))/SR;add(rng.normal(0,1,len(q))*np.exp(-q*85),float(start),.012,(i%3-1)*.6)
 # Each film uses its own actual species cry, mixed with music ducking.
 res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
 with av.open(str(ROOT/'audio'/f'{id}-cry.ogg')) as inp:
  for f in inp.decode(audio=0):
   for converted in res.resample(f):parts.append(converted.to_ndarray())
 for converted in res.resample(None):parts.append(converted.to_ndarray())
 cry=np.concatenate(parts,axis=1);cry*=.39/float(np.abs(cry).max());cry_time=info['cryAt'];cry_start=round(cry_time*SR)
 duck=np.clip((t-cry_time+.15)/.15,0,1)*np.clip((cry_time+cry.shape[1]/SR+.3-t)/.3,0,1);sound*=1-.77*duck;sound[:,cry_start:cry_start+cry.shape[1]]+=cry
 sound*=np.minimum(1,t/.2)*np.minimum(1,(duration-t)/.6);sound*=.77/float(np.abs(sound).max());pcm=sound.astype(np.float32)
 write_wav(ROOT/f'{id}-soundtrack.wav',pcm)
 (ROOT/f'{id}-score.json').write_text(json.dumps({'species':id,'title':info['title'],'duration':duration,'notes':len(events),'music':'Original composition and original synthesized ambience; no official theme, recording, MIDI or melody reused.','cueTimes':info['cuts'],'cryAt':cry_time,'revealAt':info['revealAt'],'soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
 dest=ROOT/f'{id}-appearance-v1.mp4'
 with av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
  v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
  a=out.add_stream('aac',rate=SR);a.layout='stereo';a.bit_rate=192000;cursor=0
  for i in range(info['frames']):
   with Image.open(ROOT/'frames'/str(id)/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
   f.pts=i;f.time_base=Fraction(1,24)
   for packet in v.encode(f):out.mux(packet)
   end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
   for packet in a.encode(af):out.mux(packet)
   cursor=end
  for packet in v.encode():out.mux(packet)
  for packet in a.encode():out.mux(packet)
 qa=ROOT/'encoded-preview'/str(id);qa.mkdir(parents=True,exist_ok=True);snapshots={round(when*24):when for when in TIMES[id]}
 with av.open(str(dest)) as inp:
  count=0;last=-1
  for f in inp.decode(video=0):
   assert f.time>last;last=f.time;assert (f.width,f.height)==(960,540)
   if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
   if count==round((duration-4)*24):f.to_image().save(ROOT/f'{id}-appearance-v1-poster.png')
   count+=1
  assert count==info['frames']
 with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
 corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1
 assert dest.stat().st_size<25*1024*1024,'Keep movie within the static asset size limit'
 report={'species':id,'shiny':False,'duration':duration,'frames':info['frames'],'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':info['title'],'cryAt':cry_time,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'revealAt':info['revealAt'],'checks':'Complete video and stereo audio decode; increasing timestamps; no clipping; actual species cry correlated at the reveal; five narrative shots; complete bird framing across all final wing poses.','bodyBounds':info['bodyBounds'],'visualChecks':info['visualChecks']}
 (ROOT/f'{id}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({k:v for k,v in report.items() if k not in ['visualChecks','bodyBounds']}),flush=True)
for id in ([int(sys.argv[1])] if len(sys.argv)>1 else [144,145,146]):produce(id)
