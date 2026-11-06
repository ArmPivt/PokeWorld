from pathlib import Path
from PIL import Image,ImageDraw
d=Path(__file__).parent;times=[1.2,4.5,6.7,8.2,9.6,10.8,12.7,15.4,18.1,19.8,21.3,22.7,24.3,25.55,26.7,29.3,31.3,32.2,32.5,33.35,34.05,34.6,35.3,37.3]
encoded=(d/'encoded-preview').exists();folder='encoded-preview' if encoded else 'previews';ext='jpg' if encoded else 'png'
out=Image.new('RGB',(1440,2360),'#080c18');draw=ImageDraw.Draw(out)
for i,t in enumerate(times):
 im=Image.open(d/folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));draw.text((x+8,y+274),str(t)+'s',fill='white')
out.save(d/'story-contact.jpg',quality=94)

