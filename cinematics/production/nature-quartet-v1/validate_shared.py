from pathlib import Path
import wave,json,hashlib
R=Path(__file__).parent
for i in range(288):
 a=R/'frames/489'/f'{i:05}.png';b=R/'frames/490'/f'{i:05}.png';assert a.read_bytes()==b.read_bytes(),i
with wave.open(str(R/'489-soundtrack.wav')) as a,wave.open(str(R/'490-soundtrack.wav')) as b:
 assert a.getframerate()==b.getframerate()==48000
 aa=a.readframes(12*48000);bb=b.readframes(12*48000);assert aa==bb
report={'species':[489,490],'sharedOpeningSeconds':12,'identicalRawFrames':288,'identicalOpeningPCM':True,'openingPCM_SHA256':hashlib.sha256(aa).hexdigest(),'separateReveals':'Phione in a water bubble; Manaphy in a heart of light'}
(R/'shared-water-validation.json').write_text(json.dumps(report,indent=2),encoding='utf8');print('PASS: 288 identical opening frames and 12 seconds of identical stereo PCM for Phione and Manaphy.')
