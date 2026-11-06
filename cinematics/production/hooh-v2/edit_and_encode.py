from pathlib import Path
from fractions import Fraction
import json,wave,hashlib
import numpy as np
import av
from PIL import Image
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=30;N=SR*DURATION
OLD=next(p for p in [ROOT.parent/'hooh-v1',Path('C:/Users/arman/OneDrive/Documents/La tour Infernale/cinematics/production/hooh-v1')] if (p/'hooh-soundtrack.wav').exists())
def read_wav(file):
 with wave.open(str(file),'rb') as f:
  assert f.getframerate()==SR and f.getnchannels()==2 and f.getsampwidth()==2
  return np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).T.astype(np.float32)/32768
def write_wav(file,data):
 with wave.open(str(file),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes(np.rint(np.clip(data,-1,32767/32768).T*32768).astype('<i2').tobytes())
segments=[{'destination':[0,3.5],'source':[0,3.5],'fadeIn':0,'fadeOut':.35},{'destination':[4,9.5],'source':[13,18.5],'fadeIn':.22,'fadeOut':.3},{'destination':[10,15],'source':[20,25],'fadeIn':.25,'fadeOut':0},{'destination':[15,30],'source':[29,44],'fadeIn':0,'fadeOut':0}]
def edit(master):
 result=np.zeros((2,N),np.float32)
 for segment in segments:
  start,end=segment['destination'];a,b=segment['source'];q=master[:,round(a*SR):round(b*SR)].copy();tt=np.arange(q.shape[1])/SR
  fi,fo=segment['fadeIn'],segment['fadeOut']
  if fi:q*=np.sin(np.pi/2*np.minimum(1,tt/fi))**2
  if fo:q*=np.sin(np.pi/2*np.minimum(1,(end-start-tt)/fo))**2
  result[:,round(start*SR):round(end*SR)]=q
 # Bridge the shortened dance to the untouched final fifteen seconds.
 length=round(.2*SR);alpha=np.linspace(0,1,length,dtype=np.float32)
 result[:,15*SR-length:15*SR]=result[:,15*SR-length:15*SR]*(1-alpha)+master[:,29*SR-length:29*SR]*alpha
 return result
old_mix=read_wav(OLD/'hooh-soundtrack.wav');old_score=read_wav(OLD/'la-promesse-des-deux-tours-score.wav');pcm=edit(old_mix);score=edit(old_score)
# A new restrained chime supports the dense light and the three silhouettes.
q=np.arange(round(2.4*SR))/SR;chime=np.zeros_like(q)
for frequency,gain,decay in [(220,1,1.8),(440.8,.4,2.4),(659.3,.24,3.2)]:chime+=np.sin(2*np.pi*frequency*q)*gain*np.exp(-q*decay)
chime*=np.minimum(1,q/.012)*np.minimum(1,(2.4-q)/.2);start=round(5.65*SR)
pcm[:,start:start+len(chime)]+=chime*.025
assert np.isfinite(pcm).all() and float(np.abs(pcm).max())<.99
assert np.array_equal(pcm[:,15*SR:],old_mix[:,29*SR:44*SR]),'Preserve approved final audio exactly'
write_wav(ROOT/'hooh-v2-soundtrack.wav',pcm);write_wav(ROOT/'la-promesse-des-deux-tours-v2-score.wav',score)
with wave.open(str(ROOT/'hooh-v2-soundtrack.wav'),'rb') as f:f.setpos(15*SR);tail=f.readframes(15*SR)
with wave.open(str(OLD/'hooh-soundtrack.wav'),'rb') as f:f.setpos(29*SR);old_tail=f.readframes(15*SR)
assert tail==old_tail
decision={'duration':30,'previousDuration':44,'music':'La Promesse des deux tours — montage court','segments':segments,'silentBlackIntervals':[[3.5,4],[9.5,10]],'danceDuration':5,'newLightChime':5.65,'finalAudioSource':[29,44],'finalAudioDestination':[15,30],'finalAudioPCMIdentical':True,'cryAt':23.15,'revealAt':21.2,'musicSource':'../hooh-v1/hooh-soundtrack.wav','scoreSource':'../hooh-v1/la-promesse-des-deux-tours-score.wav'}
(ROOT/'edit-decision.json').write_text(json.dumps(decision,ensure_ascii=False,indent=2),encoding='utf-8')
dest=ROOT/'250-appearance-v2.mp4'
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
times=[1.2,2.8,3.35,3.75,4.4,5.3,6.2,7.3,8.7,9.35,9.75,10.4,11.6,12.8,14.4,15.8,17.7,19.5,20.7,21.4,22.3,23.2,25,27,28.8];snapshots={round(when*24):when for when in times};qa=ROOT/'encoded-preview';qa.mkdir(exist_ok=True)
with av.open(str(dest)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert (f.width,f.height)==(960,540)
  if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
  if count==25*24:f.to_image().save(ROOT/'250-appearance-v2-poster.png')
  count+=1
 assert count==720
with av.open(str(dest)) as inp:decoded=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)[:,:N]
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(ROOT/'audio/250-cry.ogg')) as inp:
 for f in inp.decode(audio=0):
  for converted in res.resample(f):parts.append(converted.to_ndarray())
for converted in res.resample(None):parts.append(converted.to_ndarray())
cry=np.concatenate(parts,axis=1);at=round(23.15*SR);corr=float(np.corrcoef(decoded[:,at:at+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1
black_rms=[float(np.sqrt(np.mean(decoded[:,round(a*SR):round(b*SR)]**2))) for a,b in [(3.6,3.9),(9.6,9.9)]];assert max(black_rms)<.002
prior_frames=Path('C:/Users/arman/.codex/visualizations/2026/11/04/01a1a5a9-d203-7bb2-b793-a90a30ac4b0b/video-tools/hooh-film/frames');equal_tail=None
if prior_frames.exists():equal_tail=sum((ROOT/'frames'/f'{360+i:05}.png').read_bytes()==(prior_frames/f'{696+i:05}.png').read_bytes() for i in range(360))
visual=json.loads((ROOT/'render-info.json').read_text(encoding='utf-8'))
report={'species':250,'shiny':False,'duration':30,'previousDuration':44,'frames':720,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':'La Promesse des deux tours — montage court','cryAt':23.15,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'blackTransitionRMS':black_rms,'danceDuration':5,'beastIds':[243,244,245],'finalAudioPCMIdentical':True,'identicalTailFrames':equal_tail,'revealAt':21.2,'checks':'720 monotonic frames and complete audio; two black transitions; real dark silhouettes of all three beasts; dense backlight; 5-second dance; preserved final fifteen seconds of audio and real Ho-Oh cry at 23.15s.','silhouetteChecks':visual['silhouetteChecks'],'visualChecks':visual['visualChecks']}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['silhouetteChecks','visualChecks']}),flush=True)
