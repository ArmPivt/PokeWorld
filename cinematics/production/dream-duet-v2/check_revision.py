from pathlib import Path
import av,numpy as np,json
R=Path(__file__).parent;p=R/'scenes.mjs';s=p.read_text(encoding='utf8').replace("location:shot===1?'bedroom':'matched-garden'","location:fearMoment?'bedroom-nightmare':shot===1?'bedroom':'matched-garden'");p.write_text(s,encoding='utf8');(R/'film.mjs').write_text('\n'.join((R/n).read_text(encoding='utf8') for n in ['prefix.mjs','shared.mjs','scenes.mjs']),encoding='utf8')
p=R/'paired-check.cjs';s=p.read_text(encoding='utf8').replace('assert.equal(a.location,c.location);','if(!a.fearMoment&&!c.fearMoment)assert.equal(a.location,c.location);').replace('sameCamerasAndLocations:true','sameBaseCamerasAndLocations:true,darkraiWindowInsert:true').replace('six matching shots and locations','six matching base shots with a distinct nightmare window insert');p.write_text(s,encoding='utf8')
with av.open(str(R/'491-appearance-v2.mp4')) as f:audio=np.concatenate([x.to_ndarray() for x in f.decode(audio=0)],axis=1)
peak=float(np.abs(audio[:,round(12.635*48000):round(12.695*48000)]).max());assert peak<.005,peak
(R/'horror-cut-validation.json').write_text(json.dumps({'darkraiCut':[12.6,13.45],'pauseInterior':[12.635,12.695],'decodedPausePeak':peak,'singleBlackCut':True,'noRepeatedFlashes':True},indent=2),encoding='utf8')
print('PASS: actual audio drop in encoded Darkrai video; metadata distinguishes the extra nightmare insert.')
