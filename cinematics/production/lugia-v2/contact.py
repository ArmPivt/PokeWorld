from pathlib import Path
from PIL import Image,ImageDraw
r=Path(__file__).parent;times=[1.2,2.3,2.9,3.3,3.9,4.55,4.65,4.78,4.95,5.6,6.7,7.35,7.75,8.5,9.2,10.7,12.3,13.6,15.2,16.6,17.6,18.4,19.3,20.4,21.4,22.4,24,26.5,28.6]
encoded=(r/'encoded-preview').exists();folder=r/('encoded-preview' if encoded else 'previews');ext='jpg' if encoded else 'png'
out=Image.new('RGB',(1440,10*295),'#080c18');d=ImageDraw.Draw(out)
for i,t in enumerate(times):
 im=Image.open(folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));d.text((x+8,y+274),str(t)+'s',fill='white')
out.save(r/'story-contact.jpg',quality=94)
