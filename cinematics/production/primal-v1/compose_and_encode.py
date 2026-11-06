from pathlib import Path
from fractions import Fraction
import json,struct,wave,hashlib
import numpy as np
import av
from PIL import Image
from sample_renderer import SoundFont

ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=26;N=SR*DURATION
font_path=next(p for p in [ROOT/'GeneralUser-GS.sf2',ROOT.parent/'rayquaza/v4-musique-originale/GeneralUser-GS.sf2',ROOT.parent/'orchestra/GeneralUser-GS.sf2'] if p.exists())
font=SoundFont(font_path)
tracks={0:(48,.055,.34),1:(43,.035,.28),2:(60,.045,.22),3:(52,.16,.6),4:(46,.006,.32),5:(47,.005,.50),6:(61,.025,.22),7:(8,.005,.35)}

def pcm_write(path,data):
    with wave.open(str(path),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((data.T*32767).astype('<i2').tobytes())

def midi_write(path,events):
    def vlq(n):
        result=[n&127];n>>=7
        while n:result.insert(0,(n&127)|128);n>>=7
        return bytes(result)
    def chunk(items):
        data=b'';last=0
        for time,priority,payload in sorted(items,key=lambda v:(v[0],v[1])):
            tick=round(time*960);data+=vlq(tick-last)+payload;last=tick
        data+=b'\0\xff\x2f\0';return b'MTrk'+struct.pack('>I',len(data))+data
    chunks=[chunk([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
    for channel,(program,_,_) in tracks.items():
        items=[(0,0,bytes([0xc0+channel,program]))]
        for ch,key,time,length,vel in events:
            if ch==channel:items.extend([(time,2,bytes([0x90+ch,key,vel])),(time+length,1,bytes([0x80+ch,key,0]))])
        chunks.append(chunk(items))
    path.write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))

def compose(species):
    water=species==382;root=46 if water else 48;events=[]
    def note(ch,key,start,length,velocity=75):events.append((ch,key,start,length,velocity))
    def chord(ch,keys,start,length,velocity=65):
        for key in keys:note(ch,key,start,length,velocity)
    # Ancient mural: sparse choir and mallets, a different cue from Rayquaza.
    chord(3,[root+12,root+19,root+26],.1,3.5,48)
    for key,time in [(root+24,.5),(root+31,1.25),(root+27,2.15),(root+34,3.1)]:note(7 if water else 4,key,time,.7,59)
    # Four descending harmonic terraces; bass pulses and original answering motifs.
    for section,shift in enumerate([0,5,8,7]):
        start=3.8+section*2.05;base=root+shift;keys=[base,base+7,base+15,base+22]
        chord(0,keys,start,1.94,54+section*5)
        for j in range(8):
            note(1,base-12+(7 if j%4==2 else 0),start+j*.256,.19,69 if j%2==0 else 50)
            note(4 if water else 0,keys[[1,3,2,1,2,3,1,2][j]]+(12 if water else 0),start+j*.256,.2,49+section*3)
            if j%2==0:note(5,base-12,start+j*.256,.3,42+section*4 if water else 67+section*4)
        note(2 if water else 6,base+19,start+.15,.65,56 if water else 70)
        note(2 if water else 6,base+15,start+1.1,.58,60 if water else 74)
    # Eyes in darkness: an intentional hollow pause, slow low heartbeat.
    chord(3,[root,root+7,root+13],12.05,3.15,34)
    for j in range(4):
        note(1,root-12,12.2+j*.75,.23,54)
        if not water:note(5,root-12,12.2+j*.75,.28,47)
    # Orb activation: rising register, accelerating subdivisions, final dominant.
    for section in range(3):
        start=15.4+section*1.2;keys=[root+7,root+14,root+20,root+26]
        chord(0,[k+section*2 for k in keys],start,1.1,65+section*9)
        for j in range(8):
            note(4 if water else 0,root+19+[0,4,7,11,4,7,12,16][j]+section*2,start+j*.15,.12,65+section*6)
            if j%2==0:note(5,root-5,start+j*.15,.25,58+section*9)
    # Monumental arrival. These new phrases are not the reference track's melody.
    final=[root,root+7,root+15,root+22,root+26]
    chord(6,final,19,.76,91);chord(0,final,19,2.7,77);chord(3,[root+19,root+24,root+27],19,3.5,56);note(5,root-12,19,.9,110)
    for key,start,length in [(root+24,19.1,.7),(root+31,20.05,.62),(root+27,21,.7),(root+34,22.1,.8),(root+31,23.2,1.4)]:note(2,key,start,length,78)
    chord(0,[root,root+7,root+14,root+19,root+27],22.1,3.35,70)
    for key,start in [(root+31,23.4),(root+36,23.8),(root+38,24.2)]:note(4,key,start,.8,52)
    output=np.zeros((2,N+SR),np.float32)
    for ch,key,start,length,velocity in events:
        program,attack,release=tracks[ch];tone=font.note(program,key,velocity,length,attack,release)
        index=round(start*SR);end=min(output.shape[1],index+tone.shape[1]);output[:,index:end]+=tone[:,:end-index]
    dry=output.copy()
    for seconds,gain in [(.053,.13),(.091,.1),(.157,.08),(.237,.05),(.321,.03)]:
        offset=round(seconds*SR);output[:,offset:]+=dry[::-1,:-offset]*gain
    output=output[:,:N];t=np.arange(N)/SR
    output*=np.minimum(1,t/.25)*np.minimum(1,(DURATION-t)/.75);output*=.75/float(np.abs(output).max())
    folder=ROOT/str(species);pcm_write(folder/'score.wav',output);midi_write(folder/'score.mid',events)
    (folder/'score.json').write_text(json.dumps({'title':'Le Serment des Abysses' if water else 'Le Cœur du Continent','notes':len(events),'duration':26,'source':'Composition originale ; aucun extrait audio, MIDI ou transcription du thème officiel fourni en référence.','reference':'https://www.youtube.com/watch?v=r2BWx32tXXo&t=52s','soundfont':'GeneralUser GS 2.0.3','soundfontSHA256':hashlib.sha256(font_path.read_bytes()).hexdigest(),'cues':[0,3.8,12,15.4,19],'cryAt':20.2},ensure_ascii=False,indent=2),encoding='utf-8')
    return output

def mix(species,score):
    water=species==382;rng=np.random.default_rng(species);t=np.arange(N)/SR;sound=score.astype(np.float64)*.78
    def add(samples,start=0,gain=1,pan=0):
        i=round(start*SR);end=min(N,i+len(samples));samples=samples[:end-i]*gain
        sound[0,i:end]+=samples*np.sqrt((1-pan)/2);sound[1,i:end]+=samples*np.sqrt((1+pan)/2)
    noise=rng.normal(0,1,N)
    rumble=np.convolve(noise,np.ones(160)/160,'same')+.04*np.sin(2*np.pi*(29 if water else 35)*t)
    add(rumble,gain=.22)
    if water:
        for i in range(18):
            q=np.arange(round(.16*SR))/SR;freq=400+900*(i%5)/5
            bubble=np.sin(2*np.pi*(freq*q+700*q*q))*np.exp(-q*28)*np.minimum(1,q/.006)
            add(bubble,4+i*.39,.016,(i%5-2)*.25)
    def impact(at,gain,length=1.3):
        q=np.arange(round(length*SR))/SR;n=rng.normal(0,1,len(q));n=np.convolve(n,np.ones(22)/22,'same')
        sample=(.5*np.sin(2*np.pi*(49*q-8*q*q))+.8*n)*np.exp(-q*3/length)*np.minimum(1,q/.01)
        add(sample,at,gain)
    for at in ([19.65,22.35,24.4] if water else [8.4,18.8,19.65]):impact(at,.25 if water else .30,1.3)
    q=np.arange(round(3.6*SR))/SR;phase=2*np.pi*(90*q+95*q*q)
    charge=(.16*np.sin(phase)+.3*np.convolve(rng.normal(0,1,len(q)),np.ones(16)/16,'same'))*np.sin(q/3.6*np.pi)**.8
    add(charge,15.4,.40);impact(19,.31)
    # Suppress music and weather effects beneath the species' own actual cry.
    resampler=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
    with av.open(str(ROOT/'audio'/f'{species}-cry.ogg')) as source:
        for frame in source.decode(audio=0):
            for converted in resampler.resample(frame):parts.append(converted.to_ndarray())
    for converted in resampler.resample(None):parts.append(converted.to_ndarray())
    cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());start=round(20.2*SR)
    assert start+cry.shape[1]<N
    duck=np.clip((t-20.05)/.15,0,1)*np.clip((20.2+cry.shape[1]/SR+.35-t)/.35,0,1);sound*=1-.68*duck
    sound[:,start:start+cry.shape[1]]+=cry
    sound*=np.minimum(1,t/.18)*np.minimum(1,(26-t)/.5);sound*=.78/float(np.abs(sound).max())
    pcm_write(ROOT/str(species)/'soundtrack.wav',sound)
    return sound.astype(np.float32),cry

for species in [382,383]:
    folder=ROOT/str(species);score=compose(species);pcm,cry=mix(species,score)
    dest=folder/f'{species}-appearance-v1.mp4'
    with av.open(str(dest),'w',options={'movflags':'+faststart'}) as output:
        video=output.add_stream('libx264',rate=24);video.width=960;video.height=540;video.pix_fmt='yuv420p';video.options={'crf':'17','preset':'medium'}
        audio=output.add_stream('aac',rate=SR);audio.layout='stereo';audio.bit_rate=192000;cursor=0
        for i in range(624):
            with Image.open(folder/'frames'/f'{i:05}.png') as image:frame=av.VideoFrame.from_image(image.convert('RGB'))
            frame.pts=i;frame.time_base=Fraction(1,24)
            for packet in video.encode(frame):output.mux(packet)
            end=round((i+1)/24*SR);af=av.AudioFrame.from_ndarray(pcm[:,cursor:end].copy(),format='fltp',layout='stereo');af.sample_rate=SR;af.pts=cursor;af.time_base=Fraction(1,SR)
            for packet in audio.encode(af):output.mux(packet)
            cursor=end
        for packet in video.encode():output.mux(packet)
        for packet in audio.encode():output.mux(packet)
    with av.open(str(dest)) as check:
        frames=list(check.decode(video=0));assert len(frames)==624
        assert all(b.time>a.time for a,b in zip(frames,frames[1:]));frames[round(23*24)].to_image().save(folder/'poster.png')
    with av.open(str(dest)) as check:
        decoded=np.concatenate([f.to_ndarray() for f in check.decode(audio=0)],axis=1)[:,:N]
        start=round(20.2*SR);corr=float(np.corrcoef(decoded[:,start:start+cry.shape[1]].mean(axis=0),cry.mean(axis=0))[0,1]);assert corr>.8
    report={'species':species,'duration':26,'frames':624,'fps':24,'width':960,'height':540,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'audio':'AAC stereo 48 kHz 192 kb/s','cryAt':20.2,'cryDuration':cry.shape[1]/SR,'cryCorrelation':corr,'decodedPeak':float(np.abs(decoded).max()),'checks':'Full H.264/AAC decode, 624 monotonic frames, actual cry correlation at reveal timestamp.'}
    (folder/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
