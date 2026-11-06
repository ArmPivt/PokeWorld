from pathlib import Path
from PIL import Image,ImageDraw
d=Path(__file__).parent;times=[.8,3.5,3.95,6.4,8.8,10.9,14,16.2,18.6,19.9,20.7,21.5,22.3,24.7,26];out=Image.new('RGB',(1440,1475),'#080c18');draw=ImageDraw.Draw(out)
for i,t in enumerate(times):
 im=Image.open(d/'previews'/f'{t:.2f}.png');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));draw.text((x+8,y+274),str(t)+'s',fill='white')
out.save(d/'story-contact.jpg',quality=94)

