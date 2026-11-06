from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
times=[1.5,4.8,6.6,8.5,10.5,12.8,15.8,17.9,18.7,19.4,21.1,24.8]
for species in [382,383]:
    sheet=Image.new('RGB',(1440,1200),'#0b1422');draw=ImageDraw.Draw(sheet)
    for i,t in enumerate(times):
        with Image.open(root/str(species)/'previews'/f'{t:.2f}.png') as image:frame=image.resize((480,270),Image.Resampling.NEAREST)
        x=i%3*480;y=i//3*300;sheet.paste(frame,(x,y));draw.text((x+8,y+278),f'{species} - {t:.2f}s',fill='white')
    sheet.save(root/str(species)/'contact.jpg',quality=95)
