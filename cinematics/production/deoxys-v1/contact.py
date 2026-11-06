from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
times=[1,3.8,6.2,9.8,11.6,13.2,14.7,15.2,17.4,19.4,20.2,21.5,22.6,23.3,24.9,25.4,26.5,28,29.5,30.6,31.6,32.6,34.8]
for label,subset in [('story',times[:12]),('reveal',times[12:])]:
    sheet=Image.new('RGB',(1440,1200),'#0a1221');draw=ImageDraw.Draw(sheet)
    for i,t in enumerate(subset):
        with Image.open(root/'previews'/f'{t:.2f}.png') as image:frame=image.resize((480,270),Image.Resampling.NEAREST)
        x=i%3*480;y=i//3*300;sheet.paste(frame,(x,y));draw.text((x+10,y+278),f'{t:.2f}s',fill='white')
    sheet.save(root/(label+'-contact.jpg'),quality=95)
