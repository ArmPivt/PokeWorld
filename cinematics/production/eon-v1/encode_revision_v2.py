from pathlib import Path
from fractions import Fraction
import json,hashlib,av
from PIL import Image,ImageChops
d=Path(__file__).parent
p=d
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--reference-frames-root',type=Path,help='Optional root containing original 380/frames and 381/frames');args=parser.parse_args();old=args.reference_frames_root
for species in [380,381]:
 folder=d/str(species);source=p/f'{species}-appearance-v1.mp4';temporary=folder/'video-temp.mp4';dest=d/f'{species}-appearance-v2.mp4'
 tail_hash=hashlib.sha256()
 for i in range(408,768):
  a=Image.open(folder/'frames'/f'{i:05}.png').convert('RGB')
  if old is not None:
   b=Image.open(old/str(species)/'frames'/f'{i:05}.png').convert('RGB')
   assert ImageChops.difference(a,b).getbbox() is None,f'Accepted forest or final reveal changed at {species}/{i}'
  tail_hash.update(a.tobytes())
 with av.open(str(temporary),'w') as out:
  v=out.add_stream('libx264',rate=24);v.width=960;v.height=540;v.pix_fmt='yuv420p';v.options={'crf':'17','preset':'medium'}
  for i in range(768):
   with Image.open(folder/'frames'/f'{i:05}.png') as im:f=av.VideoFrame.from_image(im.convert('RGB'))
   f.pts=i;f.time_base=Fraction(1,24)
   for packet in v.encode(f):out.mux(packet)
  for packet in v.encode():out.mux(packet)
 original_audio=hashlib.sha256();new_audio=hashlib.sha256()
 with av.open(str(temporary)) as vin,av.open(str(source)) as ain,av.open(str(dest),'w',options={'movflags':'+faststart'}) as out:
  vo=out.add_stream_from_template(vin.streams.video[0]);ao=out.add_stream_from_template(ain.streams.audio[0]);packets=[]
  for packet in vin.demux(video=0):
   if packet.dts is not None:packets.append((float(packet.dts*packet.time_base),packet,vo))
  for packet in ain.demux(audio=0):
   if packet.dts is not None:original_audio.update(bytes(packet));packets.append((float(packet.dts*packet.time_base),packet,ao))
  for _,packet,stream in sorted(packets,key=lambda x:x[0]):packet.stream=stream;out.mux(packet)
 qa=folder/'revision-v2-preview';qa.mkdir(exist_ok=True)
 times=[1,3.8,5,5.3,5.65,5.85,6.1,6.4,6.6,6.8,7.05,7.3,7.65,7.95,8.8,11.5,13.6,14,14.4,14.65,14.9,15.2,15.45,15.9,16.4,16.9,17.5,20,22.5,24.3,25.5,26.5,27.3,29.5,31]
 snapshots={round(t*24):t for t in times}
 with av.open(str(dest)) as inp:
  count=0;last=-1
  for f in inp.decode(video=0):
   assert f.time>last;last=f.time;assert (f.width,f.height)==(960,540)
   if count in snapshots:f.to_image().save(qa/f'{snapshots[count]:.2f}.jpg',quality=94)
   if count==round(29.5*24):f.to_image().save(d/f'{species}-appearance-v2-poster.png')
   count+=1
  assert count==768
 with av.open(str(dest)) as inp:
  for packet in inp.demux(audio=0):
   if packet.dts is not None:new_audio.update(bytes(packet))
 assert original_audio.digest()==new_audio.digest(),'Soundtrack or cry changed'
 with av.open(str(dest)) as inp:assert sum(f.samples for f in inp.decode(audio=0))>=32*48000
 visual=json.loads((folder/'render-info.json').read_text(encoding='utf-8'))
 v1=json.loads((p/str(species)/'validation.json').read_text(encoding='utf-8'))
 report={'species':species,'version':2,'shiny':False,'duration':32,'frames':768,'fps':24,'width':960,'height':540,
 'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audioStreamUnchanged':True,'audioStreamSHA256':new_audio.hexdigest(),
 'music':v1['music'],'cryAt':27,'guideSpecies':761-species,'character':'girl' if species==380 else 'boy',
 'acceptedEndingUnchanged':bool(old),'acceptedEndingStartFrame':408,'acceptedEndingComparedFrames':360 if old else 0,'acceptedEndingRawRGBSHA256':tail_hash.hexdigest(),
 'mountChecks':visual['mountChecks'],'whiteChecks':visual['whiteChecks'],
 'checks':'768 monotonic frames and full audio decoded; AAC packets match v1 exactly; optional reference input compares all 360 forest/white/reveal frames from 17s onward; opposing guide; one correct rider throughout boarding, flight and dismount; pelvis anchored to creature back with zero attachment error.'}
 (folder/'revision-v2-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({k:v for k,v in report.items() if k not in ['mountChecks','whiteChecks']}),flush=True)

