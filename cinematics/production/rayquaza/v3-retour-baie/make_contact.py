from pathlib import Path
from PIL import Image, ImageDraw
import sys

root=Path(__file__).resolve().parent
encoded='--encoded' in sys.argv
times=[12.7,13.1,13.5,13.9,14.7,15.1,15.6,16.1,16.52,16.8,17.6,20.6]
if encoded: times=[13.1,13.5,13.9,15.1,15.6,16.1,16.52,16.8,17.1,17.6,18.5,20.6]
sheet=Image.new('RGB',(1440,1200),'#101827');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
    source=root/'encoded-preview'/f'{round(t*24):05}.jpg' if encoded else root/'previews'/f'frame-{t:.2f}.png'
    with Image.open(source) as im: frame=im.resize((480,270),Image.Resampling.NEAREST)
    x=i%3*480;y=i//3*300;sheet.paste(frame,(x,y));draw.text((x+10,y+277),f'{t:.2f}s',fill='white')
sheet.save(root/('encoded-contact-v2.jpg' if encoded else 'contact-v2.jpg'),quality=95)
