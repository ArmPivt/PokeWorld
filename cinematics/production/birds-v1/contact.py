from pathlib import Path
from PIL import Image,ImageDraw
r=Path(__file__).parent
TIMES={144:[1.2,3.8,5.6,8.3,10.3,11.6,14,16.5,17.5,19,20.6,21.3,22.3,24,26,28.5],145:[1.2,3.6,5.3,6.8,9,11.4,12.5,14.5,17.5,18.5,20,21.8,22.3,23.1,25,28.5],146:[1.2,4.4,6.6,9,11.3,12.5,15,17.7,18.8,21,23.7,24.3,25.1,27,29,30.8]}
for id,times in TIMES.items():
 encoded=(r/'encoded-preview'/str(id)).exists();folder=r/('encoded-preview' if encoded else 'previews')/str(id);ext='jpg' if encoded else 'png'
 if not folder.exists():continue
 out=Image.new('RGB',(1440,6*295),'#080c18');draw=ImageDraw.Draw(out)
 for i,t in enumerate(times):
  im=Image.open(folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));draw.text((x+8,y+274),str(t)+'s',fill='white')
 out.save(r/f'{id}-story-contact.jpg',quality=94)
