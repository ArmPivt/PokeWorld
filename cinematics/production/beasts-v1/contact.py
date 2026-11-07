from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).parent
for id in [243,244,245]:
 times=[1.2,4.65,11.2,14.6,16.25,17.4,18.1,20.5,21.4,22.5,24.5,28.5];encoded=(R/'encoded-preview'/str(id)).exists();folder=R/('encoded-preview' if encoded else 'previews')/str(id);ext='jpg' if encoded else 'png'
 out=Image.new('RGB',(1440,1180),'#070c1b');d=ImageDraw.Draw(out)
 for i,t in enumerate(times):
  im=Image.open(folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));d.text((x+8,y+274),f'{id} / {t:.2f}s',fill='white')
 out.save(R/f'{id}-contact.jpg',quality=94)
