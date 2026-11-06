from pathlib import Path
from fractions import Fraction
import av,hashlib,json
from PIL import Image,ImageChops
d=Path(__file__).parent
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--reference-frames',type=Path,help='Optional directory of original v1 PNG frames for exact ending comparison')
args=parser.parse_args()
source=d/'386-appearance-v1.mp4'
ending_hash=hashlib.sha256()
for i in range(396,864):
 a=Image.open(d/'frames'/f'{i:05}.png').convert('RGB')
 if args.reference_frames:
  b=Image.open(args.reference_frames/f'{i:05}.png').convert('RGB')
  assert ImageChops.difference(a,b).getbbox() is None,f'Accepted ending changed at frame {i}'
 ending_hash.update(a.tobytes())
temp=d/'video-temp.mp4';dest=d/'386-appearance-v2.mp4'
with av.open(str(temp),'w') as out:
 v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
 for i in range(864):
  with Image.open(d/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
  f.pts=i;f.time_base=Fraction(1,24)
  for packet in v.encode(f):out.mux(packet)
 for packet in v.encode():out.mux(packet)
sh=hashlib.sha256();dh=hashlib.sha256()
with av.open(str(temp)) as vin,av.open(str(source)) as ain,av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
 vo=out.add_stream_from_template(vin.streams.video[0]);ao=out.add_stream_from_template(ain.streams.audio[0]);packets=[]
 for p in vin.demux(video=0):
  if p.dts is not None:packets.append((float(p.dts*p.time_base),p,vo))
 for p in ain.demux(audio=0):
  if p.dts is not None:sh.update(bytes(p));packets.append((float(p.dts*p.time_base),p,ao))
 for _,p,s in sorted(packets,key=lambda x:x[0]):p.stream=s;out.mux(p)
with av.open(str(dest)) as inp:
 frames=list(inp.decode(video=0));assert len(frames)==864
 assert all(b.time>a.time for a,b in zip(frames,frames[1:]))
 assert (frames[0].width,frames[0].height)==(960,540)
 frames[round(32.6*24)].to_image().save(d/'386-appearance-v2-poster.png')
 for t in [1,3.8,7.6,9,9.8,10.25,11.8,13.2,14.79,15.05,15.5,17.4,24,32.6]:
  frames[round(t*24)].to_image().save(d/f'encoded-{t:.2f}.jpg',quality=94)
with av.open(str(dest)) as inp:
 for p in inp.demux(audio=0):
  if p.dts is not None:dh.update(bytes(p))
assert sh.digest()==dh.digest(),'Approved soundtrack changed'
with av.open(str(dest)) as inp:
 assert sum(f.samples for f in inp.decode(audio=0))>=36*48000
report={'species':386,'version':2,'duration':36,'frames':864,'fps':24,'width':960,'height':540,
 'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,
 'audioStreamUnchanged':True,'audioStreamSHA256':dh.hexdigest(),'cryAt':32,'impactAt':14.8,
 'acceptedEndingUnchanged':bool(args.reference_frames),'acceptedEndingStartFrame':396,'acceptedEndingComparedFrames':468 if args.reference_frames else 0,'acceptedEndingRawRGBSHA256':ending_hash.hexdigest(),
 'checks':'All 864 frames decoded, monotonic timestamps; full audio decode; AAC packets unchanged; optional --reference-frames checks all 468 ending frames against v1.',
 'changes':['Laboratory control room: no incubator, main screen meteorite analysis, animated DNA on side monitor',
 'Meteorite accelerates toward Earth; green light originates on Earth and reveals elongated Rayquaza',
 'Planet-free wide collision shot; elongated Rayquaza strikes and shatters meteorite']}
(d/'revision-v2-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report),flush=True)

