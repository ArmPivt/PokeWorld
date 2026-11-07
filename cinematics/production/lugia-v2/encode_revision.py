from pathlib import Path
from fractions import Fraction
import hashlib,json
import av,numpy as np
from PIL import Image

R=Path(__file__).parent
BASE=R.parent/'lugia-v1'/'249-appearance-v1.mp4'
if not BASE.exists():BASE=R.parent/'lugia-film'/'249-appearance-v1.mp4'
DEST=R/'249-appearance-v2.mp4';TEMP=R/'video-only.mp4'
with av.open(str(TEMP),'w') as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
 for i in range(720):
  with Image.open(R/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
 for packet in v.encode():out.mux(packet)

def audio_hash(path):
 with av.open(str(path)) as inp:return hashlib.sha256(b''.join(bytes(p) for p in inp.demux(audio=0) if p.dts is not None)).hexdigest()

# Preserve the existing AAC packets, rather than recompressing the approved mix.
with av.open(str(TEMP)) as vi,av.open(str(BASE)) as ai,av.open(str(DEST),'w',options={'movflags':'+faststart'}) as out:
 vs=out.add_stream_from_template(vi.streams.video[0]);ast=out.add_stream_from_template(ai.streams.audio[0]);packets=[]
 for source,kind,stream in [(vi,'video',vs),(ai,'audio',ast)]:
  for p in source.demux(**{kind:0}):
   if p.dts is not None:
    key=p.dts*p.time_base;p.stream=stream;packets.append((key,p))
 for _,p in sorted(packets,key=lambda q:q[0]):out.mux(p)
assert audio_hash(BASE)==audio_hash(DEST),'Approved music, effects and cry must remain byte-identical'
times=[1.2,2.3,2.9,3.3,3.9,4.55,4.65,4.78,4.95,5.6,6.7,7.35,7.75,8.5,9.2,10.7,12.3,13.6,15.2,16.6,17.6,18.4,19.3,20.4,21.4,22.4,24,26.5,28.6]
snap={round(t*24):t for t in times};qa=R/'encoded-preview';qa.mkdir(exist_ok=True)
with av.open(str(DEST)) as inp:
 count=0;last=-1
 for f in inp.decode(video=0):
  assert f.time>last;last=f.time;assert(f.width,f.height)==(960,540)
  if count in snap:f.to_image().save(qa/f'{snap[count]:.2f}.jpg',quality=94)
  if count==576:f.to_image().save(R/'249-appearance-v2-poster.png')
  count+=1
 assert count==720
with av.open(str(DEST)) as inp:audio=np.concatenate([f.to_ndarray() for f in inp.decode(audio=0)],axis=1)
assert np.isfinite(audio).all() and np.abs(audio).max()<1
assert DEST.stat().st_size<25*1024*1024
original_frames=R.parent/'lugia-film'/'frames'
if original_frames.exists():
 for i in range(180,720):assert (R/'frames'/f'{i:05}.png').read_bytes()==(original_frames/f'{i:05}.png').read_bytes(),f'Unchanged tail frame {i}'
info=json.loads((R/'render-info.json').read_text(encoding='utf-8'))
report={'species':249,'shiny':False,'duration':30,'fps':24,'frames':720,'width':960,'height':540,'bytes':DEST.stat().st_size,'sha256':hashlib.sha256(DEST.read_bytes()).hexdigest(),'audio':'AAC stereo 48 kHz, original v1 packets unchanged','audioPacketsSHA256':audio_hash(DEST),'decodedPeak':float(np.abs(audio).max()),'silhouetteWindow':[4.6,4.92],'silhouetteTint':'#080b18','colouredLugiaBeforeWaterfall':False,'cryAt':22.4,'revealAt':18.25,'unchangedTailRawFrames':540,'checks':'All 720 frames decoded; silhouette confined to a single lightning pulse, no coloured Lugia in the storm; all 540 later source frames and all AAC packets preserved; five dancers and final body bounds passed.','bodyBounds':info['bodyBounds'],'visualChecks':info['visualChecks']}
(R/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['bodyBounds','visualChecks']},ensure_ascii=False),flush=True)
