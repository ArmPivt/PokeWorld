from pathlib import Path
from PIL import Image,ImageDraw
r=Path(__file__).parent;times=[1.2,2.8,3.35,3.75,4.4,5.3,6.2,7.3,8.7,9.35,9.75,10.4,11.6,12.8,14.4,15.8,17.7,19.5,20.7,21.4,22.3,23.2,25,27,28.8]
encoded=(r/'encoded-preview').exists();folder=r/('encoded-preview' if encoded else 'previews');ext='jpg' if encoded else 'png'
out=Image.new('RGB',(1440,9*295),'#080c18');d=ImageDraw.Draw(out)
for i,t in enumerate(times):
 im=Image.open(folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));d.text((x+8,y+274),str(t)+'s',fill='white')
out.save(r/'story-contact.jpg',quality=94)
