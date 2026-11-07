from pathlib import Path
import numpy as np,json,wave,struct,shutil
P=Path(r'C:\Users\arman\OneDrive\Documents\La tour Infernale');R=Path(__file__).parent
from sample_renderer import SoundFont
SR=48000;D=28;N=SR*D;font=SoundFont(P/'cinematics/production/rayquaza/v4-musique-originale/GeneralUser-GS.sf2')
tracks={0:(48,.08,.3),1:(8,.005,.25),2:(46,.005,.3),3:(73,.025,.22),4:(52,.12,.5),5:(116,.004,.15)};events=[]
def note(ch,key,t,d=.3,v=45):
 if t<D:events.append((ch,key,t,d,v))
def chord(ch,keys,t,d,v):
 for key in keys:note(ch,key,t,d,v)
for i,key in enumerate([72,79,76,83,79,88,86,91]):note(1,key,.08+i*.24,.3,40+i*2)
chord(0,[48,55,60,67],0,3.5,36)
for i,key in enumerate([60,67,72,76,79,84]):note(2,key,1.85+i*.17,.3,44+i*2)
chord(0,[48,55,64,71],3.25,3.5,45);chord(4,[60,67,74],3.3,3.0,30)
for i,key in enumerate([79,83,86,88,83,90,88,86,81,83,79]):note(3,key,3.5+i*.56,.42,46)
for start,keys in [(8,[45,52,60,67]),(12,[41,48,57,64]),(16,[43,50,59,65]),(20,[48,55,64,71]),(24,[43,50,60,67])]:chord(0,keys,start,3.6,33)
for i in range(60):
 at=4+i*.38
 if at>27:break
 root=[72,69,65,67,72,67][min(5,int((at-4)/4))];note(2,root+[0,7,4,11,12,7][i%6],at,.25,29+i%3*3)
 if i%4==0:note(5,36,at,.14,20)
for i,key in enumerate([83,86,88,91,88,86,83,79]):note(1,key,20.2+i*.55,.32,32)
sound=np.zeros((2,N+SR),np.float32)
for ch,key,t,d,v in events:
 program,attack,release=tracks[ch];tone=font.note(program,key,v,d,attack,release);start=round(t*SR);end=min(sound.shape[1],start+tone.shape[1]);sound[:,start:end]+=tone[:,:end-start]
dry=sound.copy()
for delay,g in [(.061,.12),(.139,.07),(.261,.04)]:off=round(delay*SR);sound[:,off:]+=dry[::-1,:-off]*g
sound=sound[:,:N];t=np.arange(N)/SR;sound*=np.minimum(1,t/.08)*np.minimum(1,(D-t)/.65);sound*=.66/float(np.abs(sound).max());assert np.isfinite(sound).all()
with wave.open(str(R/'invocation.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((sound.T*32767).astype('<i2').tobytes())
def vlq(n):
 b=[n&127];n>>=7
 while n:b.insert(0,(n&127)|128);n>>=7
 return bytes(b)
def chunk(items):
 data=b'';last=0
 for t,priority,p in sorted(items,key=lambda a:(a[0],a[1])):tick=round(t*960);data+=vlq(tick-last)+p;last=tick
 data+=b'\0\xff\x2f\0';return b'MTrk'+struct.pack('>I',len(data))+data
chunks=[chunk([(0,0,b'\xff\x51\x03\x07\xa1\x20')])]
for ch,(program,_,_) in tracks.items():
 items=[(0,0,bytes([0xc0+ch,program]))]
 for channel,key,t,d,v in events:
  if channel==ch:items.extend([(t,2,bytes([0x90+ch,key,v])),(t+d,1,bytes([0x80+ch,key,0]))])
 chunks.append(chunk(items))
(R/'invocation.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(chunks),480)+b''.join(chunks))
(R/'music.json').write_text(json.dumps({'title':'Sous une pluie d’étoiles','duration':D,'bpm':120,'notes':len(events),'original':True,'instruments':'GeneralUser GS 2.0.3: celesta, harp, flute, strings, choir and quiet taiko. Original melody and score; no music from the reference video copied.','reference':'https://www.youtube.com/watch?v=rp7KdOqaIxE'},ensure_ascii=False,indent=2),encoding='utf-8')
print('Original invocation score: 28 s, stereo 48 kHz, peak '+str(float(np.abs(sound).max())))
