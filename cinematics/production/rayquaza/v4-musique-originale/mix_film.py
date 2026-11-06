"""Mix the new score with cinematic effects; copy the validated video unchanged."""
from pathlib import Path
from fractions import Fraction
import argparse
import wave
import hashlib
import json
import av
import numpy as np

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--cinematic-dir',type=Path,default=ROOT.parent/'v3-retour-baie' if (ROOT.parent/'v3-retour-baie').exists() else ROOT.parent/'ray-film-v2')
args=parser.parse_args(); cinema=args.cinematic_dir
info=json.loads((cinema/'render-info.json').read_text())
SR=48000;FPS=info['fps'];FRAMES=info['frames'];N=round(FRAMES/FPS*SR)
t=np.arange(N)/SR;rng=np.random.default_rng(384)
sound=np.zeros((2,N),dtype=np.float64)
with wave.open(str(ROOT/'le-sillage-emeraude-score.wav'),'rb') as f:
    assert (f.getnchannels(),f.getsampwidth(),f.getframerate())==(2,2,SR)
    score=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(np.float64).reshape(-1,2).T/32768
assert score.shape[1]==N
sound+=score*.88

def add(samples,start=0,gain=1,pan=0):
    first=round(start*SR);last=min(N,first+len(samples));sample=samples[:last-first]*gain
    sound[0,first:last]+=sample*np.sqrt((1-pan)/2)
    sound[1,first:last]+=sample*np.sqrt((1+pan)/2)

wind=np.convolve(rng.normal(0,1,N),np.ones(96)/96,'same');add(wind,gain=.10)
def impact(start,gain,pan=0):
    q=np.arange(round(1.25*SR))/SR
    water=np.convolve(rng.normal(0,1,len(q)),np.ones(12)/12,'same')
    hit=(.56*np.sin(2*np.pi*(55*q-12*q*q))+.5*water)*np.exp(-q*4.3)*np.minimum(1,q/.008)
    add(hit,start,gain,pan)
impact(1.72,.28,.1);impact(2.73,.23,-.5);impact(4.42,.37)
q=np.arange(round(3.4*SR))/SR;phase=2*np.pi*(100*q+140*q*q)
rise=np.sin(phase)*.2+np.sin(phase*1.501)*.06
rise+=np.convolve(rng.normal(0,1,len(q)),np.ones(24)/24,'same')*.3
rise*=np.sin(np.minimum(1,q/3.4)*np.pi)**.7;add(rise,9.05,.28)
q=np.arange(round(3.8*SR))/SR
travel=(.13*np.sin(2*np.pi*(310*q-24*q*q))+.30*np.convolve(rng.normal(0,1,len(q)),np.ones(18)/18,'same'))
travel*=np.sin(q/3.8*np.pi)**.7;add(travel,12.4,.26,.2)
impact(16.52,.30)
for note,offset in [(523.25,0),(659.25,.11),(783.99,.22),(1046.5,.33)]:
    q=np.arange(round(2.5*SR))/SR
    bell=(np.sin(2*np.pi*note*q)+.25*np.sin(2*np.pi*note*2*q))*np.exp(-q*2)*np.minimum(1,q/.012)
    add(bell,16.77+offset,.03,(offset-.16)*2)

duck=np.clip((t-16.65)/.15,0,1)*np.clip((18.75-t)/.3,0,1)
sound*=1-.68*duck
resampler=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(cinema/'audio'/'rayquaza-cry.ogg')) as src:
    for frame in src.decode(audio=0):
        for converted in resampler.resample(frame):parts.append(converted.to_ndarray())
for converted in resampler.resample(None):parts.append(converted.to_ndarray())
cry=np.concatenate(parts,axis=1);cry*=.42/float(np.abs(cry).max());start=round(16.85*SR)
sound[:,start:start+cry.shape[1]]+=cry
sound*=np.minimum(1,t/.18)*np.minimum(1,(N/SR-t)/.48)
sound*=.78/float(np.abs(sound).max())
pcm=sound.astype(np.float32)
with wave.open(str(ROOT/'rayquaza-mix-orchestral.wav'),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((pcm.T*32767).astype('<i2').tobytes())

with av.open(str(ROOT/'mix-aac.m4a'),'w') as output:
    audio=output.add_stream('aac',rate=SR);audio.layout='stereo';audio.bit_rate=192000
    for cursor in range(0,N,2048):
        frame=av.AudioFrame.from_ndarray(pcm[:,cursor:cursor+2048].copy(),format='fltp',layout='stereo')
        frame.sample_rate=SR;frame.pts=cursor;frame.time_base=Fraction(1,SR)
        for packet in audio.encode(frame):output.mux(packet)
    for packet in audio.encode():output.mux(packet)

original=cinema/'rayquaza-retour-baie-v2.mp4'
destination=ROOT/'rayquaza-musique-originale.mp4'
video_hash=hashlib.sha256();copied_hash=hashlib.sha256()
with av.open(str(original)) as vin,av.open(str(ROOT/'mix-aac.m4a')) as ain,av.open(str(destination),'w',options={'movflags':'+faststart'}) as output:
    vout=output.add_stream_from_template(vin.streams.video[0]);aout=output.add_stream_from_template(ain.streams.audio[0])
    packets=[]
    for packet in vin.demux(video=0):
        if packet.dts is None:continue
        video_hash.update(bytes(packet));packets.append((float(packet.dts*packet.time_base),packet,vout))
    for packet in ain.demux(audio=0):
        if packet.dts is None:continue
        packets.append((float(packet.dts*packet.time_base),packet,aout))
    for _,packet,stream in sorted(packets,key=lambda p:p[0]):packet.stream=stream;output.mux(packet)

with av.open(str(destination)) as check:
    for packet in check.demux(video=0):
        if packet.dts is not None:copied_hash.update(bytes(packet))
assert video_hash.digest()==copied_hash.digest(),'Video stream changed'
with av.open(str(destination)) as check:
    frames=list(check.decode(video=0));assert len(frames)==FRAMES
    assert all(float(b.time)>float(a.time) for a,b in zip(frames,frames[1:]))
    assert (frames[0].width,frames[0].height)==(960,540)
with av.open(str(destination)) as check:
    audio_frames=list(check.decode(audio=0));assert sum(f.samples for f in audio_frames)>=N
    mixed=np.concatenate([f.to_ndarray() for f in audio_frames],axis=1)[:,:N]
    assert np.isfinite(mixed).all()
    segment=mixed[:,start:start+cry.shape[1]]
    correlation=float(np.corrcoef(segment.mean(axis=0),cry.mean(axis=0))[0,1])
    assert correlation>.80,('Cry missing or shifted',correlation)
report={'file':destination.name,'bytes':destination.stat().st_size,'title':'Le Sillage Émeraude',
        'duration':FRAMES/FPS,'videoFrames':len(frames),'fps':FPS,'videoStreamUnchanged':True,
        'originalVideoStreamSHA256':video_hash.hexdigest(),'audio':'AAC stereo 48 kHz 192 kb/s',
        'decodedPeak':float(np.abs(mixed).max()),'cryAt':16.85,'cryCorrelation':correlation,
        'checks':'Full video/audio decode; exact H.264 packet hash; cry correlation at original timestamp'}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
