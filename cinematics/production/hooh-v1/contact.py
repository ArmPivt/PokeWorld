from pathlib import Path
from PIL import Image,ImageDraw
r=Path(__file__).parent;times=[1.2,3.8,6.5,7.5,9,10.5,12.5,13.5,15,16.5,18.2,19.5,20.5,21.6,23.2,24.8,26.4,28.1,29.8,31.7,33.5,34.7,35.4,36.3,37.2,39,41,42.8]
encoded=(r/'encoded-preview').exists();folder=r/('encoded-preview' if encoded else 'previews');ext='jpg' if encoded else 'png'
out=Image.new('RGB',(1440,10*295),'#080c18');d=ImageDraw.Draw(out)
for i,t in enumerate(times):
 im=Image.open(folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));d.text((x+8,y+274),str(t)+'s',fill='white')
out.save(r/'story-contact.jpg',quality=94)
