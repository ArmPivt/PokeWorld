"""Original short orchestral cue, rendered in NumPy from a licensed SoundFont.

No audio, MIDI or transcription from the YouTube reference is used.
This small offline renderer supports the sample zones needed by this score;
it is not a complete SoundFont synthesizer.
"""
from pathlib import Path
import struct
import json
import wave
import hashlib
import argparse
import numpy as np

ROOT=Path(__file__).resolve().parent
SR=48000
DURATION=21.625
parser=argparse.ArgumentParser()
parser.add_argument('--soundfont',type=Path,default=ROOT/'GeneralUser-GS.sf2' if (ROOT/'GeneralUser-GS.sf2').exists() else ROOT.parent/'orchestra'/'GeneralUser-GS.sf2')
args=parser.parse_args()

def children(data,start,end):
    result={}
    while start+8<=end:
        key=data[start:start+4];size=struct.unpack_from('<I',data,start+4)[0]
        result[key]=data[start+8:start+8+size]
        start+=8+size+(size%2)
    return result

class SoundFont:
    def __init__(self,path):
        data=path.read_bytes(); lists={}
        at=12
        while at+8<=len(data):
            size=struct.unpack_from('<I',data,at+4)[0]
            if data[at:at+4]==b'LIST': lists[data[at+8:at+12]]=children(data,at+12,at+8+size)
            at+=8+size+(size%2)
        self.samples=np.frombuffer(lists[b'sdta'][b'smpl'],dtype='<i2').astype(np.float32)/32768
        self.tables=lists[b'pdta']; self.cache={}
        self.presets={}
        for name,program,bank,bag,_,_,_ in struct.iter_unpack('<20sHHHIII',self.tables[b'phdr']):
            self.presets[(bank,program)]=(name.rstrip(b'\0').decode(errors='replace'),bag)
        self.sh=list(struct.iter_unpack('<20sIIIIIBbHH',self.tables[b'shdr']))

    def zones(self,index,end,bags,gens):
        baglist=list(struct.iter_unpack('<HH',self.tables[bags]))
        genlist=list(struct.iter_unpack('<HH',self.tables[gens]))
        for b in range(index,end):
            values={}
            for op,value in genlist[baglist[b][0]:baglist[b+1][0]]:
                values[op]=value if op in (41,43,44,53,54,58) else value-65536 if value>=32768 else value
            yield values

    def regions(self,program):
        if program in self.cache:return self.cache[program]
        ph=list(struct.iter_unpack('<20sHHHIII',self.tables[b'phdr']))
        p=next(i for i,h in enumerate(ph[:-1]) if h[1:3]==(program,0))
        inst=list(struct.iter_unpack('<20sH',self.tables[b'inst']))
        globalp={}; result=[]
        for zone in self.zones(ph[p][3],ph[p+1][3],b'pbag',b'pgen'):
            if 41 not in zone:globalp=zone;continue
            preset={**globalp,**zone};ix=zone[41];globali={}
            for iz in self.zones(inst[ix][1],inst[ix+1][1],b'ibag',b'igen'):
                if 53 not in iz:globali=iz;continue
                region={**globali,**iz}
                for key,value in preset.items():
                    if key in (41,43,44):continue
                    region[key]=region.get(key,0)+value
                for key in (43,44):
                    a=preset.get(key,0x7f00);b=region.get(key,0x7f00)
                    region[key]=max(a&255,b&255)|(min(a>>8,b>>8)<<8)
                result.append(region)
        self.cache[program]=result
        return result

    def note(self,program,key,velocity,duration,attack,release):
        count=round((duration+release)*SR);tt=np.arange(count)/SR
        stereo=np.zeros((2,count),np.float32)
        for region in self.regions(program):
            kr=region.get(43,0x7f00);vr=region.get(44,0x7f00)
            if not (kr&255)<=key<=(kr>>8) or not (vr&255)<=velocity<=(vr>>8):continue
            header=self.sh[region[53]]
            _,start,end,loopstart,loopend,rate,pitch,correction,link,kind=header
            start+=region.get(0,0)+32768*region.get(4,0)
            end+=region.get(1,0)+32768*region.get(12,0)
            loopstart+=region.get(2,0)+32768*region.get(45,0)
            loopend+=region.get(3,0)+32768*region.get(50,0)
            root=region.get(58,pitch)
            cents=(key-root)*region.get(56,100)+region.get(51,0)*100+region.get(52,0)+correction
            positions=start+tt*rate*2**(cents/1200)
            looping=(region.get(54,0)&1) and loopend>loopstart
            if looping:positions=np.where(positions>=loopend,loopstart+(positions-loopstart)%(loopend-loopstart),positions)
            valid=positions<end-1
            indexes=np.minimum(positions.astype(np.int64),len(self.samples)-2)
            values=(self.samples[indexes]*(1-(positions-indexes))+self.samples[indexes+1]*(positions-indexes))*valid
            envelope=np.minimum(1,tt/attack)*np.clip((duration+release-tt)/release,0,1)
            if program in (46,47):envelope*=np.exp(-tt/(.5 if program==46 else .85))
            gain=(velocity/127)**1.6*10**(-region.get(48,0)/200)
            pan=np.clip(region.get(17,0)/500,-1,1)
            stereo[0]+=values*envelope*gain*np.sqrt((1-pan)/2)
            stereo[1]+=values*envelope*gain*np.sqrt((1+pan)/2)
        return stereo

font=SoundFont(args.soundfont)
tracks={0:(48,'cordes',.055,.34),1:(43,'contrebasses',.035,.28),2:(60,'cors',.045,.22),3:(52,'choeurs',.16,.60),4:(46,'harpe',.006,.32),5:(47,'timbales',.005,.50),6:(61,'cuivres',.025,.22)}
events=[]
def note(channel,key,start,length,velocity=80):
    if start<0 or start>=DURATION:return
    events.append(dict(channel=channel,key=key,start=round(start,5),duration=round(length,5),velocity=velocity))
def chord(channel,pitches,start,length,velocity=75):
    for k in pitches:note(channel,k,start,length,velocity)

# Duel: a new minor-mode ostinato and short answering brass gestures.
for start,pitches in [(0,[50,57,62,65]),(2,[46,53,58,62]),(4,[45,52,61,67])]:
    chord(0,pitches,start,1.82,72)
    for beat in range(4):
        note(1,pitches[0]-12,start+beat*.5,.36,81 if beat%2==0 else 64)
        note(5,pitches[0]-12,start+beat*.5,.34,74 if beat%2==0 else 49)
    for j in range(8):note(0,[pitches[1],pitches[2],pitches[3],pitches[2]][j%4],start+j*.25,.16,54+j%3*5)
for key,start,length in [(62,.30,.6),(69,1.08,.33),(65,1.55,.38),(64,2.35,.52),(70,3.1,.33),(69,3.65,.25),(61,4.45,.45),(64,5.1,.35)]:note(2,key,start,length,73)

# Pillar: a genuine break in the rhythm, with a spacious harp and choir texture.
chord(3,[62,65,69,76],6.08,2.18,43)
chord(0,[50,57,64],6.1,2.2,36)
for key,start in [(74,6.38),(81,6.8),(76,7.28),(86,7.95)]:note(4,key,start,.7,59)

# Ascending energy: harmony and rhythmic density grow toward the flash.
progression=[(8.6,[55,62,67,70]),(10.58,[58,65,70,74]),(12.56,[61,67,70,76]),(14.54,[57,64,67,73])]
for section,(start,pitches) in enumerate(progression):
    chord(0,pitches,start,1.88,57+section*8)
    chord(3,[pitches[1]+12,pitches[2]+12],start,1.78,35+section*5)
    for j in range(8):
        note(0,pitches[[1,2,3,2,0,2,3,1][j]]+12,start+j*.2475,.18,57+section*7+j%2*7)
        if j%2==0:
            note(1,pitches[0]-12,start+j*.2475,.33,68+section*5)
            note(5,pitches[0]-12,start+j*.2475,.28,50+section*7)
    for j in range(4):note(4,pitches[j]+12,start+j*.495,.45,49+section*5)
for key,start,length in [(67,8.72,.7),(74,9.58,.65),(70,10.72,.6),(77,11.5,.55),(76,12.75,.6),(79,13.45,.55),(73,14.65,.5),(76,15.22,.4),(81,15.73,.46)]:note(2,key,start,length,62+round((start-8.6)*3))
for j in range(12):note(5,45 if j%3 else 33,15.05+j*.118,.13,48+j*4)

# Green flash and arrival: an open D-major resolution, not the official melody.
chord(6,[50,57,62,66,73,78],16.52,.7,92)
chord(0,[50,57,62,66,73],16.52,2.0,75)
chord(3,[66,69,74,81],16.52,3.0,58)
note(5,38,16.52,.9,110)
for key,start,length in [(74,16.52,.42),(78,17.1,.55),(76,17.88,.6),(81,18.65,.82),(78,19.62,1.08)]:note(2,key,start,length,75 if start<18.4 else 87)
chord(0,[50,57,62,66,71,76],18.55,2.4,67)
chord(6,[62,66,69,74],19.5,1.15,62)
for key,start in [(74,18.55),(81,18.85),(86,19.2),(90,19.55),(93,20.0)]:note(4,key,start,.7,57)

output=np.zeros((2,round((DURATION+1)*SR)),np.float32)
for ev in events:
    program,_,attack,release=tracks[ev['channel']]
    tone=font.note(program,ev['key'],ev['velocity'],ev['duration'],attack,release)
    pos=round(ev['start']*SR);end=min(output.shape[1],pos+tone.shape[1])
    output[:,pos:end]+=tone[:,:end-pos]

# Short stereo room reflections, rendered without a third-party effect plugin.
dry=output.copy()
for seconds,gain in [(.047,.13),(.083,.11),(.131,.085),(.193,.06),(.277,.035)]:
    offset=round(seconds*SR)
    output[:,offset:]+=dry[::-1,:-offset]*gain
output=output[:,:round(DURATION*SR)]
tt=np.arange(output.shape[1])/SR
output*=np.minimum(1,tt/.12)*np.minimum(1,(DURATION-tt)/.75)
peak=float(np.abs(output).max());output*=.78/peak
with wave.open(str(ROOT/'le-sillage-emeraude-score.wav'),'wb') as file:
    file.setnchannels(2);file.setsampwidth(2);file.setframerate(SR)
    file.writeframes((output.T*32767).astype('<i2').tobytes())

# Export the actual note score as a portable standard MIDI file.
def vlq(value):
    result=[value&127];value>>=7
    while value:result.insert(0,(value&127)|128);value>>=7
    return bytes(result)
def track(items):
    data=b'';last=0
    for at,priority,payload in sorted(items,key=lambda x:(x[0],x[1])):
        tick=round(at*960);data+=vlq(tick-last)+payload;last=tick
    data+=b'\0\xff\x2f\0'
    return b'MTrk'+struct.pack('>I',len(data))+data
midi=[track([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
for channel,(program,name,_,_) in tracks.items():
    items=[(0,0,bytes([0xc0+channel,program])),(0,0,bytes([0xb0+channel,91,45]))]
    for ev in events:
        if ev['channel']==channel:
            items.append((ev['start'],2,bytes([0x90+channel,ev['key'],ev['velocity']])))
            items.append((ev['start']+ev['duration'],1,bytes([0x80+channel,ev['key'],0])))
    midi.append(track(items))
(ROOT/'le-sillage-emeraude.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(midi),480)+b''.join(midi))
manifest={'title':'Le Sillage Émeraude','duration':DURATION,'sampleRate':SR,'channels':2,'notes':len(events),
          'tracks':{c:{'program':v[0],'instrument':v[1]} for c,v in tracks.items()},
          'composition':'Original score authored for this cinematic; no extracted melody, MIDI or samples from the YouTube reference.',
          'soundfont':{'name':'GeneralUser GS 2.0.3','sha256':hashlib.sha256(args.soundfont.read_bytes()).hexdigest(),
          'source':'https://github.com/mrbumpy409/GeneralUser-GS','license':'GeneralUser-GS-LICENSE.txt'},
          'cues':[{'at':0,'action':'duel, ostinato mineur'},{'at':6,'action':'accalmie du pilier'},{'at':8.6,'action':'montée orchestrale'},
                  {'at':16.52,'action':'résolution majeure au flash'},{'at':16.85,'action':'musique baissée sous le cri dans le mixage final'}]}
(ROOT/'score.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'title':manifest['title'],'notes':len(events),'duration':DURATION,'peak':float(np.abs(output).max()),'rms':float(np.sqrt(np.mean(output**2)))},ensure_ascii=False))
