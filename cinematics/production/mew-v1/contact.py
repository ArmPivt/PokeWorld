from pathlib import Path
from PIL import Image,ImageDraw
d=Path(__file__).parent
times=[1.2,4.5,6.5,7.4,8.2,9,9.8,10.5,11.2,12.5,13.5,14.3,15.3,16.3,17.2,18.3,19.3,20.3,21.3,22.3,23.7,24.2,25.3,26.8,28.5,30.5]
encoded=(d/'encoded-preview').exists();folder='encoded-preview' if encoded else 'previews';ext='jpg' if encoded else 'png'
out=Image.new('RGB',(1440,9*295),'#080c18');draw=ImageDraw.Draw(out)
for i,t in enumerate(times):
 im=Image.open(d/folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));draw.text((x+8,y+274),str(t)+'s',fill='white')
out.save(d/'story-contact.jpg',quality=94)
