from pathlib import Path
from PIL import Image,ImageDraw
d=Path(__file__).parent;times=[1,3.8,5.3,5.85,6.4,6.8,7.95,8.8,13.6,14.4,15.2,16.4,20,24.3,25.5,26.5,27.3,29.5]
for id in [380,381]:
 encoded=(d/str(id)/'revision-v2-preview').exists();folder='revision-v2-preview' if encoded else 'previews';ext='jpg' if encoded else 'png'
 out=Image.new('RGB',(1440,1770),'#080c18');draw=ImageDraw.Draw(out)
 for i,t in enumerate(times):
  im=Image.open(d/str(id)/folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));draw.text((x+8,y+274),str(t)+'s',fill='white')
 out.save(d/str(id)/'story-contact.jpg',quality=94)

