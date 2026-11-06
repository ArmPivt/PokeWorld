import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const project=process.argv[2];
if(!project)throw Error('Pass the project directory');
const {LEGENDARY_STORIES:stories}=await import(pathToFileURL(path.join(project,'dist/js/legendary-stories.mjs')));
const {LEGENDARY_MEDIA:media}=await import(pathToFileURL(path.join(project,'dist/js/legendary-media.mjs')));
const dex=JSON.parse(fs.readFileSync(path.join(project,'dist/data/dex.json')));
const supported=JSON.parse(fs.readFileSync(path.join(project,'dist/data/supported.json')));
const rows=`
144|An icy arch above the frozen sea of the Seafoam Islands|The blue bird slowly lifts its wings halfway and tips its head toward the viewer|A few broad snowflakes drift and a thin line of ice advances across the pool
145|A dark abandoned power station with one broken copper conductor|The yellow bird raises its pointed crest and flexes its wings slightly|Two short yellow arcs light the conductor and then fade
146|A black volcanic crater with a simple glowing ember nest|The fire bird calmly unfolds its wings a little and raises its beak|Its flame feathers flicker in broad orange pixel clusters above three rising embers
150|A broken incubation chamber above a cracked circular laboratory platform|Mewtwo opens its eyes slowly and lifts one hand a little while hovering|Three small stones rise gently as a restrained violet psychic ring expands below its feet
151|A mossy hollow tree above a tiny moonlit forest pool|Mew tilts its head and curls the end of its long tail around itself|Two soft pink reflections circle the pool and fade between the leaves
243|A flat thunder rock on a windswept dark grassland|The saber-toothed beast lowers its head slightly and takes one firm paw step|A brief golden bolt strikes the rock behind it and its purple mane ripples softly
244|A cooled lava path at the foot of a volcanic ridge|The large beast gently exhales and lifts its head into a proud stance|Three orange embers rise and a red crack lights beneath its planted paw
245|A still spring surrounded by dark reeds and pale mist|The blue beast softly lifts one paw over the water while its two ribbons sway|A single clean ripple clears a small patch of cloudy water
249|A submerged stone bell visible through a deep ocean grotto|Lugia slowly lifts its broad white wings while keeping its body steady|A wide dark current turns once around the bell and blue bubbles rise
250|A bronze bell hanging above the roof of an old pagoda|The rainbow bird gently raises its chest and spreads its tail feathers a little|The bell moves once and a restrained seven-color band crosses the dawn clouds
251|A small wooden shrine among three large forest trunks|Celebi slowly opens its eyes and tilts forward in midair|A few green leaves turn around the shrine in a single slow circle
377|A sandstone doorway with seven dim dots in a quiet desert ruin|The rock golem turns its head a little and raises one heavy arm|Its seven lights turn on in sequence and two pebbles settle at its feet
378|A blue glacier chamber surrounding a cracked crystal pedestal|The ice golem rocks its body slightly without changing its crystalline shape|Its face dots glow in sequence and a few square ice crystals fall
379|A sealed iron arch above a dusty circular metal floor|The steel golem lifts its head slowly and opens its arms a little|A dim red scan passes once through its face lights and dust lifts from the floor
380|A red feather on a stone ledge overlooking a calm tropical island|Latias makes a small hovering dip and tilts its head curiously|A red reflection glides across the still water beneath it
381|A blue feather beside a high sea cliff above a bank of clouds|Latios gently extends its wings and turns its head toward the distant horizon|Two broad cloud bands slide behind it and a faint blue wind trail fades
382|A sheltered ocean cavern with a blue orb on a low stone ledge|Kyogre bobs very slightly at the water surface and moves its short fins gently without lifting out of the sea|A single broad wave rises below its body and a few rain drops disturb the cavern pool
383|A low lava chamber containing a red orb and three dark basalt pillars|Groudon opens its eyes and slowly raises one claw without changing its stance|A red fissure lights beneath the platform and lava pulses once behind it
384|The top of the Sky Pillar above a dark blue ocean and three broad cloud layers|Rayquaza gently floats upward then settles while its jaw closes and only the tip of its tail curls|A few green sparks pulse beneath the same stable S-shaped body
385|A star-shaped cradle on a small crater ledge beneath a dark sky|Jirachi slowly opens its eyes and lifts its short arms a little|One falling star crosses the background and its paper tags sway softly
386|A dark meteorite resting on a simple circular island crater|Deoxys gently straightens its upper body and moves its two existing arms a little|A narrow orange light pulses through the meteorite without changing the creature's form
480|A small golden knowledge rune above a still blue lake|Uxie floats up a little and tips its closed-eyed head forward|Three gold rune dots light on the water in a slow sequence
481|A pink gem above a quiet island in Lake Verity|Mesprit gently turns its head and lets its twin tails sway|Two pink heart-shaped reflections briefly brighten the lake
482|A small blue will-flame beside the rocky edge of Lake Valor|Azelf lifts its head and holds its small arms in a determined pose|The blue flame grows one size and casts a short reflection across the water
483|A broken clock face between two pillars at Spear Pillar|Dialga raises its head slowly while the shape of its armor stays fixed|Three floating stone fragments stop together and its chest diamond pulses once
484|A luminous pearl between two old pillars under a violet sky|Palkia slowly turns its head and opens its shoulder stance a little|A narrow violet oval opens behind its body and the distant stars shift once
485|A rounded basalt chamber lit by a small magma pool|Heatran takes one short deliberate front-foot step and lowers its head|A bubble of lava breaks behind it and two orange sparks rise
486|A huge sealed doorway with three colored seals in a snow temple|Regigigas slowly straightens its shoulders and lifts one massive hand|The three seals glow in turn and a thin line of dust falls from the arch
487|A tilted stone platform reflected in a dark vertical mirror|Giratina inclines its head while keeping exactly the same body form and limbs|A few stones float upward behind it and one dark ripple crosses the mirror
488|A calm crescent-shaped island beneath a large pale moon|Cresselia gently lifts its head and sways its crescent wings a little|A pink lunar feather drifts past and one bright ring crosses the water
489|A single large bubble rising beside a moonlit sea egg|Phione paddles its small fins gently while bobbing in place|Two small bubbles rise beside it and the sea egg glints once
490|A pearl crown resting on a low platform in a sunken stone temple|Manaphy slowly opens its eyes and gently lifts one small arm|Three pearls brighten in sequence and bubbles drift between the pillars
491|A black feather on a dark shore beneath a dim crescent moon|Darkrai rises a small distance and slightly opens its existing arms|A low band of black mist parts and a thin violet glow gathers beneath it
492|A single wilted flower in a small mossy clearing|Land-form Shaymin lifts its head gently and blinks while staying on four feet|Three nearby flowers open in a simple staggered sequence
493|A golden ring above three broad luminous steps in an empty dark cosmos|Arceus slowly raises its head while keeping its body and ring perfectly formed|The three steps light upward and a restrained gold halo pulses once
494|A small warm lighthouse window at dawn above Liberty Island|Victini raises its V-shaped ears and lifts one small hand|A tiny victory flame brightens the window and two orange sparks rise
638|A blue blade-shaped reflection between mossy stones in a quiet clearing|Cobalion tips its head forward and places one hoof down slowly|The blue line on the stones glows once and two grass blades sway
639|A split boulder on a broad rocky ledge above a distant valley|Terrakion raises its head and makes one firm forehoof step|Two small stones tumble down the split boulder and dust settles
640|A leaf-shaped green sword of light above a simple forest clearing|Virizion lifts its head and gently turns one ear toward the viewer|Three broad leaves sweep past and a green line travels over the grass
641|A wind chime hanging over a broad cloud platform|Incarnate Tornadus slowly shifts its existing arms and sways the end of its tail|One loose spiral of wind moves around the cloud and the chime swings once
642|A black storm cloud above a stone lightning spike|Incarnate Thundurus gently raises one existing arm while staying on its cloud|Two blue bolts jump between the spike and the cloud without changing its body
643|A pale stone between the pillars of Dragonspiral Tower|Reshiram raises its head and opens its white wings a little|Its tail flame pulses softly and a short warm glow travels across the stone
644|A dark stone in a wide circular chamber with blue floor lines|Zekrom slowly turns its head and tightens its stance|Its tail reactor lights with a single calm blue electric pulse
645|An old harvest altar above a dry field with three planted rows|Incarnate Landorus opens one hand and slowly inclines its head|Three small green shoots appear along the nearest row as dust settles
646|A broken ice crystal in a wide silent frozen cavern|Kyurem slowly lifts its head while keeping its asymmetrical wings unchanged|A low frost wave crosses the floor and one ice shard drops behind it
647|A short waterfall and a clear stream beside a stone training ledge|Keldeo lifts one front hoof and raises its head in a proud small gesture|A short blue water blade glints beside the stream and spray drifts downward
648|A small music box on a dark empty theatre stage|Aria-form Meloetta sways its upper body gently and lifts one existing hand|Three soft colored music notes rise from the box under a single warm spotlight
649|A dormant cannon cradle inside a dark laboratory with two red monitor blocks|Genesect slowly raises its head and adjusts its existing arm a little|One red targeting light crosses the floor while its back cannon remains attached and correctly shaped
716|A bare dark tree at the edge of a quiet twilight forest|Xerneas lifts its head slowly and holds its antlers steady|Three colored antler lights brighten in sequence and two broad leaves unfold on the tree
717|A red cocoon shell on a dark cliff above a deep valley|Yveltal opens its broad wings a little and gently raises its head|A narrow shadow passes over the valley and one red pulse crosses the cocoon
718|A low cave arch surrounded by scattered green cells|The exact Zygarde form from the reference lifts its head and subtly shifts its tail|Three existing green cells drift toward the arch without altering the creature's body
719|A pink diamond pedestal inside a simple crystal hall|Diancie slowly opens its eyes and gently inclines its crown|Three broad pink facets brighten in sequence behind it
720|A golden ring floating above an empty sandstone courtyard|Confined-form Hoopa raises one little hand and tips its head mischievously|One small ring turns slowly behind its body and a few sand grains lift
721|A warm rocky gorge containing one broad steaming geyser|Volcanion raises its head gently while keeping its ring arms in the same shape|One slow white steam puff emerges behind it and drifts sideways
772|A dim containment room with a heavy locked mask cradle|Type Null takes one short hesitant foreleg step and lowers its masked head|One chain link swings gently and a faint blue laboratory light flickers once
773|A broken mask resting beside a wide laboratory doorway|Silvally lifts its unmasked head proudly and flexes its crest slightly|A narrow rainbow band crosses the doorway while dust falls around the discarded mask
785|A yellow shell altar beneath a simple tropical thundercloud|Tapu Koko slowly opens its existing shell halves a little|Two short yellow sparks jump over the altar without changing the shell shape
786|A pink shell altar above a wide bed of island flowers|Tapu Lele gently tilts its head and bobs inside its shell|Three broad pink scales drift downward and the flower bed sways
787|A wooden shell altar among thick dark roots|Tapu Bulu slowly raises its head and holds its existing shell arms steady|Two roots lift slightly beside the altar and one warm bell glow pulses
788|A violet shell altar beside a calm misty tidal pool|Tapu Fini gently opens its shell a little and inclines its head|A broad purple mist band parts to reveal a single ripple in the pool
789|A small star-cloud cradle above a dark lunar altar|Cosmog softly bobs and sways its two existing cloud arms|Three simple star dots brighten around the altar and slowly fade
790|A small golden star core suspended over three dark floating stones|Cosmoem rotates only a few degrees while keeping its exact star-shaped shell|The three stones move downward a tiny distance and a gold light pulses once
791|A circular sun disc at the top of a wide stone altar|Solgaleo slowly raises its head and plants one forepaw firmly|The sun disc brightens behind its mane and one warm band crosses the steps
792|A pale moon disc above a quiet open lunar altar|Lunala slowly lifts its broad crescent wings a little|The stars behind it dim briefly then brighten as a violet ring passes over the altar
800|A broken black prism among three pale crystal pillars|Necrozma slowly turns its head and lifts one existing angular hand|Three simple colored light beams converge on the black prism without reshaping its body
801|A dusty mechanical heart on a small royal workshop bench|Magearna slowly opens its eyes and lifts one small metal hand|Two large visible gears turn a little and a warm gold heart-light pulses
802|A small stone courtyard containing one lamp and a broad midnight shadow|Marshadow gently raises its head and brightens its two eyes|Its floor shadow stretches slightly and returns while one green flame flickers softly
807|An ionized rock ledge with three small golden claw sparks|Zeraora bends its knees slightly and slowly flexes one existing clawed hand|A short yellow electric trace travels along the ledge then fades
808|A large loose hex nut on a small metal workshop floor|Meltan tips its nut-shaped head curiously and blinks its single eye|Three tiny metal flakes slide a short distance toward its liquid body
809|A round forge core surrounded by three large unused nuts|Melmetal slowly raises one heavy existing arm and steadies its body|A warm orange line lights the forge and two nearby nuts tilt slightly
888|An old sword resting on a mossy stone in a foggy forest clearing|The exact Zacian form shown in the reference slowly raises its head and holds its stance|A narrow blue light crosses the sword on the stone and the fog parts gently
889|An old shield leaning against a tree beside a quiet forest path|The exact Zamazenta form shown in the reference lifts its chest and plants one forepaw|A restrained red ring glows across the old shield as the broad leaves sway
890|A red crystal core above the top of a dark power reactor|The exact Eternatus form from the reference gently raises its head while keeping all limbs stable|One broad red spiral slowly turns in the far sky behind it
891|A small training stone above the calm sea of the Isle of Armor|Kubfu raises its little fists into a steady guard and nods once|One leaf drifts past the training stone and a tiny dust puff settles
892|An old master scroll beside a wooden platform in a tower of trials|The exact Urshifu form from the reference lifts one fist slightly and holds a composed stance|A single short pale energy line passes over the scroll and dust drops from one beam
894|Two broad metal rings surrounding a small electric cage in an ancient ruin|Regieleki gently compresses then settles back to its original proportions|Two short yellow arcs bridge the rings and its face lights pulse once
895|A stone dragon jaw doorway protecting a dark red crystal|Regidrago slowly lifts its existing jaw-shaped arms a little|A red draconic glow travels once across the stone doorway
896|A frozen carrot beside a low ice ridge on a snowy slope|Glastrier gently stamps one forehoof and exhales a small pale puff|Two broad snowflakes fall and a short line of frost lights at its hoof
897|A black carrot on a violet moonlit path through a simple misty valley|Spectrier lifts one forehoof slowly and lets its existing mane sway|A thin violet trail fades behind its planted hoof and one mist band drifts
898|A small royal bud on a mossy throne inside a quiet ruined crown temple|Base-form Calyrex gently inclines its head and lifts one small hand|The royal bud opens two broad leaves under a single restrained green glow
905|A pink spring orb above a still marsh with three large unopened flowers|Incarnate Enamorus gently tips its head while remaining on its existing cloud|The three marsh flowers open slowly in sequence and a soft pink breeze crosses the water
1004|Two red beads above a small black-rock brazier|Chi-Yu slowly sways its existing fins as if swimming in warm air|A small orange flame curls once around the brazier and the two beads glint
1007|A broad prehistoric root arch at the edge of a dense crater jungle|Koraidon slowly raises its head and places one front claw down firmly|Two broad fern leaves part behind it and a short dust puff rises
1015|A blue chain hanging from a torii above a quiet lantern path|Munkidori slowly inclines its head and lifts one existing hand a little|A narrow blue reflection passes along the chain and one lantern sways
1016|A pink feather resting on a stone stair beneath a village torii|Fezandipiti raises its head and slightly spreads its existing elegant wings|The pink feather drifts down one step and a soft lantern reflection passes over it
1017|Four old masks arranged beside a lantern-lit mountain doorway|Teal-mask Ogerpon peeks slightly from its existing mask and slowly tilts its head|Two warm lanterns pulse once and one broad leaf falls near the unused masks
1024|A low crystal shell pedestal in the dark depths of Area Zero|Base-form Terapagos slowly opens its eyes and raises its head a little|Three large crystal facets brighten in blue cyan and violet around the pedestal
`.trim().split('\n').map(line=>{const [id,setting,action,environment]=line.split('|');return [+id,{setting,action,environment}]});
const directions=new Map(rows);
const style='SIMPLE Game Boy Advance-style pixel art, logical 320x180 canvas enlarged with nearest-neighbor, large crisp square pixel clusters, stepped outlines, 32-color palette, only 2 or 3 shades per material, simple broad background shapes, no gradients, no tiny textures, no 3D, no blur, no text, no UI, wide 16:9.';
const constraints='One Pokémon only, the exact form and colors shown in the identity reference. Keep the entire silhouette comfortably inside the frame. Fixed camera and one continuous five-second shot, restrained movement only. No body rotation, stretching, growing limbs, changing proportions, zoom or scene cuts. Preserve the flat palette and crisp pixel edges.';
const out=path.join(project,'cinematics/production');
const issues=fs.existsSync(path.join(out,'generation-issues.json'))?JSON.parse(fs.readFileSync(path.join(out,'generation-issues.json'))):{};
const list=[];
for(const entry of supported.filter(s=>stories[s.id])){
 const id=entry.id,s=stories[id],d=directions.get(id),p=dex[id];
 if(!d)throw Error('Missing explicit direction for '+id);
 const variants=[];
 for(const shiny of [false,...entry.shiny?[true]:[]]){
  const key=String(id)+(shiny?'s':''),icon=`dist/assets/pmd/${id}/${shiny?'icon-shiny':'icon'}.png`;
  if(!fs.existsSync(path.join(project,icon)))throw Error('Missing identity reference '+icon);
  const ready=!!media[key]&&fs.existsSync(path.join(project,'dist',media[key].src));
  variants.push({key,shiny,status:ready?'reviewed-media':issues[key]?'image-blocked':'planned',generationIssue:issues[key]||null,sourceImageReady:fs.existsSync(path.join(project,`cinematics/production/species/${id}/${key}-frame-v1.png`)),identityReference:icon,sourceImage:`cinematics/production/species/${id}/${key}-frame-v1.png`,destination:`assets/cinematics/${key}-appearance-v1.mp4`,imagePrompt:`Create the first frame of an original ${p.name} summoning appearance titled ${s.title}. Setting: ${d.setting}. Starting pose is calm and held, ready for this modest action: ${d.action}. Environmental action to prepare: ${d.environment}. Use the supplied Pokémon icon only as identity reference, never as the whole scene; use the approved Rayquaza image only as pixel style reference. ${shiny?'Chromatic variant: match the shiny icon colors exactly; do not use the regular palette.':'Regular variant: match the regular icon colors exactly.'} ${style} ${constraints}`,animationPrompt:`Simple retro 2D pixel art. ${d.action}. ${d.environment}. ${constraints}`});
 }
 list.push({id,name:p.name,generation:p.gen,title:s.title,location:s.location,...d,variants});
}
const keys=list.flatMap(p=>p.variants);
const catalog={schemaVersion:1,style,provider:'PixVerse V6',settings:{seconds:5,resolution:'540P',audio:false,multishot:false},creditsPerGenerationObserved:30,retriesIncluded:false,speciesCount:list.length,variantCount:keys.length,reviewed:keys.filter(v=>v.status==='reviewed-media').length,planned:keys.filter(v=>v.status!=='reviewed-media').length,blockedImages:keys.filter(v=>v.status==='image-blocked').length,estimatedRemainingCredits:keys.filter(v=>v.status!=='reviewed-media').length*30,species:list};
if(list.length!==87||keys.length!==172||new Set(list.map(x=>x.action+'|'+x.environment)).size!==87||new Set(keys.map(x=>x.key)).size!==172)throw Error('Coverage/uniqueness failed');
fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');
for(const p of list){const folder=path.join(out,'species',String(p.id));fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'plan.json'),JSON.stringify(p,null,2)+'\n');}
const md=['# Apparitions légendaires — production','',`${list.length} espèces compatibles ; ${keys.length} variantes avec les chromatiques disponibles. Chaque scène et chaque mouvement ci-dessous sont préparés, pas générés tant que le statut du catalogue reste planned.`,'','Une génération de cinq secondes coûte actuellement 30 crédits sur le compte utilisé. Les reprises ne sont pas incluses dans l’estimation. Les images seules et les prompts ne sont jamais comptés comme des vidéos terminées.','','| Pokémon | Décor | Mouvement et effet propres à l’espèce |','| --- | --- | --- |',...list.map(p=>`| ${p.name} | ${p.location} — ${p.setting} | ${p.action}. ${p.environment}. |`),'','Les références de forme normale et chromatique sont distinctes. Aucun film normal ne sera affiché pour un Pokémon chromatique sans média correspondant. Les sept espèces sans sprites compatibles restent exclues.',''];
fs.writeFileSync(path.join(out,'CATALOGUE.md'),md.join('\n'));
console.log(JSON.stringify({species:catalog.speciesCount,variants:catalog.variantCount,reviewed:catalog.reviewed,planned:catalog.planned,estimatedRemainingCredits:catalog.estimatedRemainingCredits}));
