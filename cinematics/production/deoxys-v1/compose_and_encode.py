from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont

ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=36;N=SR*DURATION
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2',ROOT.parent/'orchestra/GeneralUser-GS.sf2'] if p.exists())
font=SoundFont(font_path)
tracks={0:(48,.06,.4),1:(38,.006,.10),2:(80,.004,.07),3:(52,.12,.5),4:(8,.005,.32),5:(47,.005,.45),6:(60,.035,.22),7:(13,.004,.12),8:(81,.008,.09)}
events=[]
def note(ch,key,time,length,velocity=70):events.append((ch,key,time,length,velocity))
def chord(ch,keys,time,length,velocity=60):
    for key in keys:note(ch,key,time,length,velocity)

# New musical material authored for this story; no transcription or audio from
# the reference video's ending is used.
chord(3,[47,54,62,73],0,5.2,35)
for i,key in enumerate([71,78,72,81,77,74,82,76]):note(4,key,.4+i*.59,.31,44+i%3*5)
for i in range(10):note(1,35+(7 if i%4==2 else 0),.1+i*.52,.14,45)
for start,root in [(5.5,47),(8,50)]:
    chord(0,[root,root+7,root+15,root+26],start,2.4,49)
    for i in range(10):note(1,root-12,start+i*.245,.16,53 if i%2==0 else 40)
    note(6,root+19,start+.2,1.1,48)

# Rayquaza accelerates through a short brass-and-string rise.
for j,(start,root) in enumerate([(10.5,47),(12.1,52),(13.7,54)]):
    chord(0,[root,root+7,root+15,root+22],start,1.5,57+j*8)
    note(6,root+24,start+.08,.64,66+j*8)
    for i in range(8):
        note(0,root+[7,15,19,22,15,19,22,26][i],start+i*.19,.12,53+j*6)
        if i%2==0:note(5,root-12,start+i*.19,.27,58+j*10)
chord(6,[47,54,61,66,74],14.8,.6,95);note(5,35,14.8,.85,112)
chord(3,[47,54,60,73],15.1,3.55,31)
for i,key in enumerate([83,78,81,72]):note(4,key,16.6+i*.49,.55,45)

# Alien geometry: the short pulse motif is deliberately asymmetric and original.
motif=[0,7,1,10,6,3,11,5]
for i in range(40):
    time=19+i*.195;note(7,71+motif[i%8],time,.105,50+i%3*6)
    if i%2==0:note(1,35+[0,0,7,1][i//2%4],time,.13,65)
for start in [19,21,23,25]:chord(3,[47,54,60],start,1.9,30)

# The triangle reddens and approaches; tempo density builds into the reveal.
for i in range(27):
    time=27+i*.155;note(2,71+motif[(i*3)%8],time,.085,52+min(20,i))
    if i%2==0:note(1,35+(i%6==0)*7,time,.13,68)
for i in range(12):note(5,35,29.6+i*.13,.11,40+i*4)
chord(0,[47,54,62,72],27,4.15,65)
chord(8,[59,66,74],31.3,.5,66);note(5,35,31.3,.6,104)
for i in range(29):
    time=31.3+i*.145
    note(2,71+motif[(i+2)%8],time,.085,68 if i%4==0 else 59)
    if i%2==0:note(1,35+[0,7,1,10][i//2%4],time,.13,77)
    if i%4==0:note(7,83+[0,3,6,1][i//4%4],time,.16,60)
chord(0,[47,54,62,73],33.3,2.1,58)

score=np.zeros((2,N+SR),np.float32)
for ch,key,time,length,velocity in events:
    program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release)
    start=round(time*SR);end=min(score.shape[1],start+tone.shape[1]);score[:,start:end]+=tone[:,:end-start]
dry=score.copy()
for seconds,gain in [(.047,.12),(.083,.1),(.149,.07),(.229,.04)]:
    offset=round(seconds*SR);score[:,offset:]+=dry[::-1,:-offset]*gain
score=score[:,:N];t=np.arange(N)/SR;score*=np.minimum(1,t/.2)*np.minimum(1,(36-t)/.65);score*=.74/float(np.abs(score).max())
def write_wav(path,data):
    with wave.open(str(path),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((data.T*32767).astype('<i2').tobytes())
write_wav(ROOT/'le-code-delta-score.wav',score)

def vlq(n):
    result=[n&127];n>>=7
    while n:result.insert(0,(n&127)|128);n>>=7
    return bytes(result)
def midi_chunk(items):
    data=b'';last=0
    for time,priority,payload in sorted(items,key=lambda a:(a[0],a[1])):
        tick=round(time*960);data+=vlq(tick-last)+payload;last=tick
    data+=b'\0\xff\x2f\0';return b'MTrk'+struct.pack('>I',len(data))+data
chunks=[midi_chunk([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
for ch,(program,_,_) in tracks.items():
    items=[(0,0,bytes([0xc0+ch,program]))]
    for channel,key,time,length,velocity in events:
        if channel==ch:items.extend([(time,2,bytes([0x90+ch,key,velocity])),(time+length,1,bytes([0x80+ch,key,0]))])
    chunks.append(midi_chunk(items))
(ROOT/'le-code-delta.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))

# Original synchronized effects: laboratory, dash, collision, geometric hops.
rng=np.random.default_rng(386);sound=score.astype(np.float64)*.87
def add(samples,start=0,gain=1,pan=0):
    i=round(start*SR);end=min(N,i+len(samples));sample=samples[:end-i]*gain
    sound[0,i:end]+=sample*np.sqrt((1-pan)/2);sound[1,i:end]+=sample*np.sqrt((1+pan)/2)
def impact(start,gain,length=1.4):
    q=np.arange(round(length*SR))/SR;n=rng.normal(0,1,len(q));n=np.convolve(n,np.ones(25)/25,'same')
    sample=(.55*np.sin(2*np.pi*(46*q-8*q*q))+.65*n)*np.exp(-q*3.4/length)*np.minimum(1,q/.006);add(sample,start,gain)
for start in [1.3,2.7,4.0]:
    q=np.arange(round(.13*SR))/SR;add(np.sin(2*np.pi*(920*q+160*q*q))*np.exp(-q*29)*np.minimum(1,q/.005),start,.025)
q=np.arange(round(4.3*SR))/SR
dash=(.19*np.sin(2*np.pi*(80*q+95*q*q))+.3*np.convolve(rng.normal(0,1,len(q)),np.ones(15)/15,'same'))
dash*=np.minimum(1,q/.8)*np.minimum(1,(4.3-q)/.18);add(dash,10.5,.34)
impact(14.8,.43);impact(31.3,.27)
for hop in [.6,1.85,2.85,3.6,4.35,5.1,5.35,5.6,6.1,6.35]:
    q=np.arange(round(.15*SR))/SR;phase=2*np.pi*(650*q+1400*q*q)
    add((np.sin(phase)+.2*np.sin(phase*2))*np.exp(-q*22)*np.minimum(1,q/.004),19+hop,.045)

resampler=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(ROOT/'audio/386-cry.ogg')) as source:
    for frame in source.decode(audio=0):
        for converted in resampler.resample(frame):parts.append(converted.to_ndarray())
for converted in resampler.resample(None):parts.append(converted.to_ndarray())
cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());cry_start=32*SR;assert cry_start+cry.shape[1]<N
duck=np.clip((t-31.85)/.15,0,1)*np.clip((32+cry.shape[1]/SR+.35-t)/.35,0,1);sound*=1-.68*duck;sound[:,cry_start:cry_start+cry.shape[1]]+=cry
sound*=np.minimum(1,t/.18)*np.minimum(1,(36-t)/.5);sound*=.78/float(np.abs(sound).max());pcm=sound.astype(np.float32)
write_wav(ROOT/'deoxys-soundtrack.wav',pcm)
(ROOT/'score.json').write_text(json.dumps({'title':'Le Code Delta','notes':len(events),'duration':36,'cues':{'laboratory':0,'approach':5.5,'rayquaza':10.5,'impact':14.8,'triangle':19,'reveal':31.3,'cry':32},'music':'Original retro electronic score, not an arrangement or transcription of the official theme.','reference':'https://www.youtube.com/watch?v=jPqWP_9vxbk','soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')

destination=ROOT/'386-appearance-v1.mp4'
with av.open(str(destination),'w',options={'movflags':'+faststart'}) as output:
    video=output.add_stream('libx264',rate=24);video.width=960;video.height=540;video.pix_fmt='yuv420p';video.options={'crf':'17','preset':'medium'}
    audio=output.add_stream('aac',rate=SR);audio.layout='stereo';audio.bit_rate=192000;cursor=0
    for i in range(864):
        with Image.open(ROOT/'frames'/f'{i:05}.png') as image:frame=av.VideoFrame.from_image(image.convert('RGB'))
        frame.pts=i;frame.time_base=Fraction(1,24)
        for packet in video.encode(frame):output.mux(packet)
        end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
        for packet in audio.encode(af):output.mux(packet)
        cursor=end
    for packet in video.encode():output.mux(packet)
    for packet in audio.encode():output.mux(packet)
with av.open(str(destination)) as check:
    frames=list(check.decode(video=0));assert len(frames)==864;assert all(b.time>a.time for a,b in zip(frames,frames[1:]));frames[round(34.8*24)].to_image().save(ROOT/'poster.png')
    qa=ROOT/'encoded-preview';qa.mkdir(exist_ok=True)
    for time in [1,9.8,14.7,15.2,17.4,20.2,21.5,23.3,24.9,26.5,29.5,30.6,32.6,34.8]:frames[round(time*24)].to_image().save(qa/f'{time:.1f}.jpg',quality=94)
with av.open(str(destination)) as check:decoded=np.concatenate([f.to_ndarray() for f in check.decode(audio=0)],axis=1)[:,:N]
corr=float(np.corrcoef(decoded[:,cry_start:cry_start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8;assert np.isfinite(decoded).all();assert float(np.abs(decoded).max())<1
report={'species':386,'duration':36,'frames':864,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'bytes':destination.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','music':'Le Code Delta','cryAt':32,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'checks':'Full video/audio decode, 864 monotonic frames, actual Deoxys cry correlation at reveal timestamp.'}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
