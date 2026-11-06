import argparse, av, hashlib, json, pathlib, re, shutil

parser=argparse.ArgumentParser(description='Register a real, visually reviewed legendary video. Does not generate or fake movies.')
parser.add_argument('--project',required=True)
parser.add_argument('--key',required=True)
parser.add_argument('--input',required=True)
parser.add_argument('--source-url',required=True)
parser.add_argument('--review-note',required=True)
parser.add_argument('--reviewed',action='store_true',required=True)
args=parser.parse_args()
project=pathlib.Path(args.project).resolve()
key=args.key
if not re.fullmatch(r'\d+s?',key):raise ValueError('Invalid Pokémon key')
species=int(key.rstrip('s'));shiny=key.endswith('s')
dex=json.loads((project/'dist/data/dex.json').read_text(encoding='utf-8'))
supported={p['id']:p for p in json.loads((project/'dist/data/supported.json').read_text(encoding='utf-8'))}
if species not in supported or dex[str(species)]['rarity']!='legendary':raise ValueError('Unsupported legendary')
if shiny and not supported[species]['shiny']:raise ValueError('Unsupported shiny')
if not re.fullmatch(r'https://app\.pixverse\.ai/video/\d+',args.source_url):raise ValueError('Record the actual provider result page')
source=pathlib.Path(args.input).resolve()
if source.suffix.lower()!='.mp4':raise ValueError('Expected the actual MP4 result')
with av.open(str(source)) as movie:
    stream=movie.streams.video[0]
    fps=float(stream.average_rate)
    frames=list(movie.decode(video=0))
    width,height=stream.width,stream.height
if len(frames)<48 or not 3<=len(frames)/fps<=45 or width/height<1.5:raise ValueError('Unexpected movie dimensions or duration')
folder=project/'dist/assets/cinematics';folder.mkdir(exist_ok=True)
name=f'{key}-appearance-v1'
target=folder/(name+'.mp4')
digest=hashlib.sha256(source.read_bytes()).hexdigest()
if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()!=digest:raise ValueError('Do not overwrite a different movie; create a new version')
if source!=target:shutil.copyfile(source,target)
frames[0].to_image().save(folder/(name+'-poster.png'))
records_path=project/'cinematics/production/reviewed-media.json'
records=json.loads(records_path.read_text(encoding='utf-8')) if records_path.exists() else {}
records[key]={'id':species,'shiny':shiny,'src':f'assets/cinematics/{name}.mp4','poster':f'assets/cinematics/{name}-poster.png','duration':len(frames)/fps,'width':width,'height':height,'fps':fps,'frameCount':len(frames),'sha256':digest,'provider':'PixVerse V6','sourceUrl':args.source_url,'reviewed':True,'reviewNote':args.review_note,'reviewedOn':'2026-11-06','watermarkPreserved':True}
records_path.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for registered,r in records.items():
    if registered!=str(r['id'])+('s' if r['shiny'] else ''):raise ValueError('Variant mismatch')
    if not r.get('reviewed') or not (project/'dist'/r['src']).is_file():raise ValueError('Missing or unreviewed movie')
    if hashlib.sha256((project/'dist'/r['src']).read_bytes()).hexdigest()!=r['sha256']:raise ValueError('Movie hash changed after review')
media={k:{name:r[name] for name in ['src','poster','duration','width','height','provider']} for k,r in records.items()}
module='// Only real encoded movies reviewed for the exact Pokémon variant are registered.\n'
module+='export const LEGENDARY_MEDIA='+json.dumps(media,ensure_ascii=False,indent=2)+';\n'
module+='''export function legendaryMedia(key,{reducedMotion=false}={}){
 const entry=LEGENDARY_MEDIA[String(key)];if(!entry)return null;
 const src=reducedMotion&&entry.reducedSrc?entry.reducedSrc:entry.src;
 if(!/^assets\\/cinematics\\/[a-zA-Z0-9_./-]+\\.(mp4|webm)$/.test(src)||src.includes('..'))return null;
 return {...entry,src,manualStart:reducedMotion&&!entry.reducedSrc};
}
'''
(project/'dist/js/legendary-media.mjs').write_text(module,encoding='utf-8')
print(json.dumps({'registered':key,'duration':len(frames)/fps,'frames':len(frames),'sha256':digest,'totalReviewed':len(records)}))
