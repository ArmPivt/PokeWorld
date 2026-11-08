from pathlib import Path
import wave
R=Path(__file__).parent
old=(R.parent/'creation-trio-v1/compose_encode.py').read_text(encoding='utf8')
header='''from pathlib import Path
from fractions import Fraction
import sys,json,hashlib,wave
import av,numpy as np
from PIL import Image
R=Path(__file__).parent;ID=int(sys.argv[1]);SR=48000;N=32*SR
title={483:'Le Premier Battement',484:'Au-delà des frontières'}[ID]
with wave.open(str(R.parent/'creation-trio-v1'/f'{ID}-soundtrack.wav')) as f:pcm=np.frombuffer(f.readframes(f.getnframes()),'<i2').reshape(-1,2).T.astype(np.float32)/32768
original=pcm.copy();rng=np.random.default_rng(ID)
def sound(q,t,g=.1,pan=0):
 start=round(t*SR);end=min(N,start+len(q));q=q[:end-start]*g;pcm[0,start:end]+=q*np.sqrt((1-pan)/2);pcm[1,start:end]+=q*np.sqrt((1+pan)/2)
def sweep(t,d,g,smooth=35):
 q=np.arange(round(d*SR))/SR;noise=np.convolve(rng.normal(0,1,len(q)),np.ones(smooth)/smooth,'same');sound(noise*np.sin(np.pi*q/d)**2,t,g)
if ID==483:
 stop=round(4.25*SR);a=round(6.25*SR);b=round(10.5*SR)
 pcm[:,stop:11*SR]=0
 # Actual sample reversal at the same speed as the backwards scene time.
 reverse=original[:,:stop][:,::-1].copy();edge=round(.005*SR);reverse[:,:edge]*=np.linspace(0,1,edge);reverse[:,-edge:]*=np.linspace(1,0,edge);pcm[:,a:b]=reverse
 edge=round(.015*SR);pcm[:,stop-edge:stop]*=np.linspace(1,0,edge)
 for t in [5.28,5.65,6.05]:
  q=np.arange(round(.10*SR))/SR;sound(np.sin(2*np.pi*1550*q)*np.exp(-q*70)*np.minimum(1,q/.002),t,.035)
 sweep(10.5,.65,.09,60)
 reverseCorr=float(np.corrcoef(pcm[:,a+1000:b-1000].ravel(),original[:,:stop][:,::-1][:,1000:-1000].ravel())[0,1]);assert reverseCorr>.9999
 freezePeak=float(np.abs(pcm[:,round(4.3*SR):round(5.2*SR)]).max());assert freezePeak==0
else:
 # Quiet space before the dimension gradually returns with its musical bed.
 pcm[:,round(6.3*SR):round(8.5*SR)]=0
 ramp=np.linspace(0,1,round(2.5*SR));pcm[:,round(8.5*SR):11*SR]*=ramp
 for i,t in enumerate([4.42,4.8,5.15,5.55,5.95]):
  q=np.arange(round(.11*SR))/SR;noise=rng.normal(0,1,len(q));sound(noise*np.exp(-q*38)*np.minimum(1,q/.002),t,.018+i*.006,(i%3-1)*.4)
 sweep(6.3,1.4,.16,3)
 for i in range(36):
  t=6.3+i*.034;q=np.arange(round((.3+i%4*.08)*SR))/SR;freq=2400+i%7*321
  sound((np.sin(2*np.pi*freq*q)+.35*np.sin(2*np.pi*freq*1.73*q))*np.exp(-q*11)*np.minimum(1,q/.002),t,.015,(i%7-3)/4)
 reverseCorr=None;freezePeak=None
assert float(np.abs(pcm).max())<.95
with wave.open(str(R/f'{ID}-soundtrack.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(pcm,-1,1).T*32767).astype('<i2').tobytes())
res=av.AudioResampler(format='fltp',layout='stereo',rate=SR);parts=[]
with av.open(str(R/'audio'/f'{ID}-cry.ogg')) as inp:
 for f in inp.decode(audio=0):parts.extend(x.to_ndarray() for x in res.resample(f))
parts.extend(x.to_ndarray() for x in res.resample(None));cry=np.concatenate(parts,axis=1);cry*=.43/float(np.abs(cry).max());at=round(25.4*SR)
(R/f'{ID}-score.json').write_text(json.dumps({'title':title,'original':True,'duration':32,'revision':2,'cryAt':25.4,'freeze':[4.25,5.25] if ID==483 else None,'reverseAudio':[6.25,10.5] if ID==483 else None,'reverseSource':[0,4.25] if ID==483 else None,'reverseCorrelation':reverseCorr,'freezePeak':freezePeak,'unchangedPCMFrom':11.2 if ID==483 else 11},ensure_ascii=False,indent=2),encoding='utf8')
'''
tail=old[old.index("dest=R/f'{ID}-appearance-v1.mp4'"):].replace('-appearance-v1','-appearance-v2')
tail=tail.replace("times=[1.5,3.5,4.6,5.6,6.7,7.5,10.3,12.8,15.1,18.2,20.5,22.5,24.8,25.8,28.5,30.5]","times=[1,3,4.4,4.9,5.5,6.1,6.7,7.4,8.2,8.9,9.7,10.4,10.8,11.5,12.8,16,20.5,25.8,28.5]")
start=tail.index('silence=float(');end=tail.index('report=',start);tail=tail[:start]+"silence=None\nif ID==483:\n silence=float(np.abs(decoded[:,round(4.3*SR):round(5.2*SR)]).max());assert silence<.001\n reverseDecoded=float(np.corrcoef(decoded[:,round(6.3*SR):round(10.4*SR)].ravel(),pcm[:,round(6.3*SR):round(10.4*SR)].ravel())[0,1]);assert reverseDecoded>.98\n"+tail[end:]
tail=tail.replace("'giratinaSilentPeak':silence","'freezeSilentPeak':silence,'reverseSourceCorrelation':reverseCorr,'revision':2")
(R/'encode_revision.py').write_text(header+tail,encoding='utf8')
print('Prepared genuine sample reversal, stopped music and glass-shatter sound effects.')
