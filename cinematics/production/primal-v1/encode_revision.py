"""Encode corrected frames and retain the approved soundtrack bit for bit."""
from pathlib import Path
from fractions import Fraction
import hashlib,json
import av
from PIL import Image

ROOT=Path(__file__).resolve().parent
ORIGINAL=ROOT if (ROOT/'382/382-appearance-v1.mp4').exists() else Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale\cinematics\production\primal-v1')
for species,version in [(382,2),(383,3)]:
    folder=ROOT/str(species);temporary=folder/'video-temp.mp4';destination=folder/f'{species}-appearance-v{version}.mp4'
    source=ORIGINAL/str(species)/f'{species}-appearance-v1.mp4'
    with av.open(str(temporary),'w') as output:
        video=output.add_stream('libx264',rate=24);video.width=960;video.height=540;video.pix_fmt='yuv420p';video.options={'crf':'17','preset':'medium'}
        for i in range(624):
            with Image.open(folder/'frames'/f'{i:05}.png') as image:frame=av.VideoFrame.from_image(image.convert('RGB'))
            frame.pts=i;frame.time_base=Fraction(1,24)
            for packet in video.encode(frame):output.mux(packet)
        for packet in video.encode():output.mux(packet)
    source_hash=hashlib.sha256();final_hash=hashlib.sha256()
    with av.open(str(temporary)) as vin,av.open(str(source)) as ain,av.open(str(destination),'w',options={'movflags':'+faststart'}) as output:
        vout=output.add_stream_from_template(vin.streams.video[0]);aout=output.add_stream_from_template(ain.streams.audio[0]);packets=[]
        for packet in vin.demux(video=0):
            if packet.dts is not None:packets.append((float(packet.dts*packet.time_base),packet,vout))
        for packet in ain.demux(audio=0):
            if packet.dts is not None:source_hash.update(bytes(packet));packets.append((float(packet.dts*packet.time_base),packet,aout))
        for _,packet,stream in sorted(packets,key=lambda p:p[0]):packet.stream=stream;output.mux(packet)
    with av.open(str(destination)) as check:
        frames=list(check.decode(video=0));assert len(frames)==624
        assert all(b.time>a.time for a,b in zip(frames,frames[1:]));assert (frames[0].width,frames[0].height)==(960,540)
        frames[round(23*24)].to_image().save(folder/'poster.png')
        for time in [4.8,12.8,14.5,17.9,20.3,21.1,24.8]:frames[round(time*24)].to_image().save(folder/f'encoded-{time:.1f}.jpg',quality=94)
    with av.open(str(destination)) as check:
        for packet in check.demux(audio=0):
            if packet.dts is not None:final_hash.update(bytes(packet))
    assert source_hash.digest()==final_hash.digest(),'Soundtrack changed'
    with av.open(str(destination)) as check:assert sum(f.samples for f in check.decode(audio=0))>=26*48000
    report={'species':species,'version':version,'duration':26,'frames':624,'fps':24,'width':960,'height':540,
            'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'bytes':destination.stat().st_size,
            'audioStreamUnchanged':True,'audioStreamSHA256':final_hash.hexdigest(),'cryAt':20.2,
            'changes':['Statue eye shapes calibrated in original image coordinates and transformed with camera zoom','Kyogre shown fully in three-quarter view above the foreground wave','First Slugma supported by the left rock shelf'],
            'checks':'624 frames decoded; monotonic video timestamps; full audio decode; exact approved AAC packet hash preserved.'}
    (folder/'revision-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
