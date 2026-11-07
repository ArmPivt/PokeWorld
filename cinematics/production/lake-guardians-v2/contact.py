from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).parent;times=[1.1,3.1,5.1,7.8,9.5,10.5,13.7,18.1,19.7,21.5,24.5,28.5]
for id in [480,481,482]:
 encoded=(R/'encoded-preview'/str(id)).exists();folder=R/('encoded-preview' if encoded else 'previews')/str(id);ext='jpg' if encoded else 'png';out=Image.new('RGB',(1440,1180),'#10152b');d=ImageDraw.Draw(out)
 for i,t in enumerate(times):
  im=Image.open(folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));d.text((x+8,y+274),f'{id} / {t:.2f}s',fill='white')
 out.save(R/f'{id}-contact.jpg',quality=94)
