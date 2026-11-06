from pathlib import Path
from PIL import Image,ImageDraw
d=Path(__file__).parent
times=[1,4.4,5.8,7.8,10.8,12.8,14.2,16,17.5,19.6,20.7,21.8,22.6,24.8,26.8]
for species in [377,378,379]:
 out=Image.new('RGB',(1440,1475),'#080c18');draw=ImageDraw.Draw(out)
 for i,t in enumerate(times):
  im=Image.open(d/str(species)/'encoded-preview'/f'{t:.2f}.jpg');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));draw.text((x+8,y+274),str(t)+'s',fill='white')
 out.save(d/str(species)/'story-contact.jpg',quality=94)

