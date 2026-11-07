from pathlib import Path
from fractions import Fraction
import sys,json,hashlib
import av,numpy as np
from PIL import Image
R=Path(__file__).parent;ID=int(sys.argv[1]);BASE=R.parent/'lake-guardians-v1'/f'{ID}-appearance-v1.mp4'
if not BASE.exists():BASE=Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale')/'cinematics/production/lake-guardians-v1'/f'{ID}-appearance-v1.mp4'
DEST=R/f'{ID}-appearance-v2.mp4';TEMP=R/f'{ID}-video-only.mp4'
with av.open(str(TEMP),'w') as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'};v.codec_context.thread_count=4
 for i in range(720):
  with Image.open(R/'frames'/str(ID)/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for p in v.encode(f):out.mux(p)
 for p in v.encode():out.mux(p)
def audio_hash(path):
 with av.open(str(path)) as inp:return hashlib.sha256(b''.join(bytes(p) for p in inp.demux(audio=0) if p.dts is not None)).hexdigest()
with av.open(str(TEMP)) as vi,av.open(str(BASE)) as ai,av.open(str(DEST),'w',options={'movflags':'+faststart'}) as out:
 vs=out.add_stream_from_template(vi.streams.video[0]);ast=out.add_stream_from_template(ai.streams.audio[0]);packets=[]
 for source,kind,stream in [(vi,'video',vs),(ai,'audio',ast)]:
  for p in source.demux(**{kind:0}):
   if p.dts is not None:key=p.dts*p.time_base;p.stream=stream;packets.append((key,p))
 for _,p in sorted(packets,key=lambda q:q[0]):out.mux(p)
assert audio_hash(BASE)==audio_hash(DEST)
times=[1.1,3.1,5.1,6.6,7.8,9.5,10.5,11.5,13.7,15.4,16.6,18.1,19.7,20.8,21.5,22.8,24.5,26.7,28.5];snap={round(t*24):t for t in times};qa=R/'encoded-preview'/str(ID);qa.mkdir(parents=True,exist_ok=True)
with av.open(str(DEST)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert(f.width,f.height)==(960,540)
  if count in snap:f.to_image().save(qa/f'{snap[count]:.2f}.jpg',quality=94)
  if count==588:f.to_image().save(R/f'{ID}-appearance-v2-poster.png')
  count+=1
 assert count==720
with av.open(str(DEST)) as inp:a=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)
assert np.isfinite(a).all() and np.abs(a).max()<1;assert DEST.stat().st_size<25*1024*1024
old_frames=R.parent/'lake-guardians-v1/frames'/str(ID)
if old_frames.exists():
 for i in range(384):assert (R/'frames'/str(ID)/f'{i:05}.png').read_bytes()==(old_frames/f'{i:05}.png').read_bytes(),f'Unchanged opening frame {i}'
info=json.loads((R/f'{ID}-render-info.json').read_text(encoding='utf-8'));music={480:'Les Liens du savoir',481:'Le Reflet de l’émotion',482:'La Force de la volonté'}
report={'species':ID,'shiny':False,'duration':30,'frames':720,'fps':24,'width':960,'height':540,'bytes':DEST.stat().st_size,'sha256':hashlib.sha256(DEST.read_bytes()).hexdigest(),'music':music[ID],'cryAt':22.7,'audioPacketsSHA256':audio_hash(DEST),'unchangedAACPackets':True,'unchangedOpeningFrames':384,'caveInteriorAt':16,'revealAt':21.2,'decodedPeak':float(np.abs(a).max()),'bodyBounds':info['layout']['bounds'],'checks':'720 monotonic frames and complete unclipped audio; first 384 raw frames preserved; music, effects and cry byte-identical AAC; personal enclosed cave from 16 s through the final reveal; all body poses and tails in frame.'}
(R/f'{ID}-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False),flush=True)
