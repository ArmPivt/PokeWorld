from pathlib import Path
from PIL import Image
import json
d=Path(__file__).parent;data={}
for name in ['boy','girl']:
 im=Image.open(d/(name+'-poses.png')).convert('RGBA');w,h=im.size
 assert im.getpixel((0,0))[3]==0,'Sprite sheet must have actual transparency'
 poses={}
 for kind,(x0,x1) in {'standing':(0,w//2),'seated':(w//2,w)}.items():
  mask=im.crop((x0,0,x1,h)).getchannel('A').point(lambda a:255 if a>128 else 0)
  b=mask.getbbox();assert b
  poses[kind]={'x':x0+b[0],'y':b[1],'w':b[2]-b[0],'h':b[3]-b[1]}
 standing=poses['standing'];seated=poses['seated'];hip=standing['h']*.62
 for kind,r in poses.items():
  r['hipX']=r['w']/2;r['hipY']=hip
 data[name]={'src':name+'-poses.png','referenceHeight':standing['h'],'standingHeight':54,'poses':poses}
print(json.dumps(data),flush=True)
(d/'riders.json').write_text(json.dumps(data,indent=2),encoding='utf-8')

