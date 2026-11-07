from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).parent;times=[1.2,4.3,6.7,8.5,11.3,13.7,15.2,17.8,19.2,20.8,22.6,24.5];encoded=(R/'encoded-preview').exists();folder=R/('encoded-preview' if encoded else 'previews');ext='jpg' if encoded else 'png';out=Image.new('RGB',(1440,1180),'#07181f');d=ImageDraw.Draw(out)
for i,t in enumerate(times):
 im=Image.open(folder/f'{t:.2f}.{ext}');im.thumbnail((480,270));x=i%3*480;y=i//3*295;out.paste(im,(x,y));d.text((x+8,y+274),f'{t:.2f}s',fill='white')
out.save(R/'story-contact.jpg',quality=94)
