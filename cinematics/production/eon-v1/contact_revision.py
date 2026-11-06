from pathlib import Path
from PIL import Image,ImageDraw
d=Path(__file__).parent
for id in [380,381]:
 for name,times in [('boarding',[5,5.3,5.65,5.85,6.1,6.4,6.6,6.8,7.05,7.3,7.65,7.95]),('landing',[14,14.4,14.65,14.9,15.2,15.45,15.9,16.4,16.9])]:
  out=Image.new('RGB',(1440,350*((len(times)+2)//3)),'#0b1520');draw=ImageDraw.Draw(out)
  for i,t in enumerate(times):
   folder='revision-v2-preview' if (d/str(id)/'revision-v2-preview').exists() else 'previews';ext='jpg' if folder=='revision-v2-preview' else 'png'
   im=Image.open(d/str(id)/folder/f'{t:.2f}.{ext}')
   im=im.crop((160,0,800,540));im.thumbnail((480,325));x=i%3*480;y=i//3*350;out.paste(im,(x,y));draw.text((x+8,y+329),str(t)+'s',fill='white')
  out.save(d/str(id)/(name+'-contact.jpg'),quality=94)

