import struct
import numpy as np
SR=48000
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

