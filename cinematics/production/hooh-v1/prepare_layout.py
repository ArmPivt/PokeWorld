from pathlib import Path
import json,shutil
from PIL import Image,ImageDraw
r=Path(__file__).resolve().parent
for asset in json.loads((r/'backdrops.json').read_text(encoding='utf-8-sig'))['assets']:
 shutil.copy2(asset['source'],r/(asset['key']+'.png'))
 (r/(asset['key']+'-prompt.txt')).write_text(asset['prompt'],encoding='utf-8')
im=Image.open(r/'dancers.png').convert('RGBA');w,h=im.size
assert im.getpixel((0,h-1))[3]<8,'Real transparent sprites required'
assert sum(im.getchannel('A').histogram()[:8])>w*h*.4,'Grid gaps must be transparent'
rows=[]
for row in range(5):
 frames=[];standing=None
 for col in range(4):
  x0,x1=round(col*w/4),round((col+1)*w/4);y0,y1=round(row*h/5),round((row+1)*h/5)
  b=im.crop((x0,y0,x1,y1)).getchannel('A').point(lambda a:255 if a>90 else 0).getbbox();assert b
  if col==0:standing={'height':b[3]-b[1],'baseline':b[3]}
  frames.append({'x':x0+b[0],'y':y0+b[1],'w':b[2]-b[0],'h':b[3]-b[1],'anchorX':(x1-x0)/2-b[0],'anchorY':standing['baseline']-b[1]})
 rows.append({'src':'dancers.png','referenceHeight':standing['height'],'poses':frames})
(r/'dancers.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
mode=json.loads((r/'sprites.json').read_text())['250']['Walk'];atlas=Image.open(r/mode['src']).convert('RGBA');bounds=[]
for frame in range(mode['frames']):bounds.append(atlas.crop((frame*mode['w'],0,(frame+1)*mode['w'],mode['h'])).getbbox())
anchor={'x':(bounds[0][0]+bounds[0][2])/2,'y':bounds[0][3]}
left=min(b[0]-anchor['x'] for b in bounds);right=max(b[2]-anchor['x'] for b in bounds);top=min(b[1]-anchor['y'] for b in bounds);bottom=max(b[3]-anchor['y'] for b in bounds)
scale=min(264/(right-left),160/(bottom-top));target_y=14-top*scale
layout={'anchor':anchor,'scale':scale,'targetY':target_y,'bounds':{'left':240+left*scale,'right':240+right*scale,'top':14,'bottom':target_y+bottom*scale},'frameBounds':bounds}
(r/'bird-layout.json').write_text(json.dumps(layout,indent=2),encoding='utf-8')
print(json.dumps({'dancerSheet':(w,h),'dancers':len(rows),'posesPerDancer':4,'birdLayout':layout}),flush=True)
