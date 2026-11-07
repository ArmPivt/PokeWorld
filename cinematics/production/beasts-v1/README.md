# Les trois gardiens de Johto

Trois cinématiques normales pour **Raikou (243), Entei (244), Suicune (245)**. Chaque MP4 : **30 secondes, 960 × 540, 24 images/s**, musique originale, effets et cri intégrés.

## Montage

| Temps | Scène |
| --- | --- |
| 0–2,5 s | Tour en flammes sous un ciel calme, reprise de Lugia v2. |
| 2,5–7,5 s | L’orage s’installe. L’éclair à 4,6 s ne révèle que l’ombre noire de Lugia. |
| 7,5–8 s | Noir. |
| 8–13,5 s | Tour détruite, arc-en-ciel et lumière dense révélant les trois silhouettes noires, repris du montage court de Ho-Oh. |
| 13,5–14 s | Noir. |
| 14–20 s | Suicune : reflet sombre renversé et strié sur un lac nocturne. Raikou : plateau sous l’orage, silhouette uniquement lors des éclairs. Entei : fumée volcanique, silhouette derrière les volutes. |
| 20–22 s | L’eau s’illumine, la foudre éclate ou les fumées s’écartent ; la forme colorée apparaît à partir de 21,25 s. |
| 22–30 s | Révélation entière et animée du Pokémon dans son environnement ; vrai cri à 23,1 s et fondu final. |

Les premières 14 secondes ont les mêmes images et le même master PCM dans les trois versions. Les esprits colorés restent absents avant leur révélation personnelle. Les ancrages corporels sont stables entre les poses ; les limites de toutes les poses de repos sont documentées dans `*-render-info.json`.

## Décors et animation

**ImageGen intégré** a créé les trois décors : `lake.png`, `storm.png`, `volcano.png`. Les prompts exacts sont dans `lake-prompt.txt`, `storm-prompt.txt`, `volcano-prompt.txt`, avec provenance dans `backdrops.json`. Le décor nocturne de la tour et les ruines sont repris des [sources Lugia v2](../lugia-v2/README.md) et [Ho-Oh v2](../hooh-v2/README.md). Aucun Pokémon n’est peint dans les nouveaux décors.

Sprites animés natifs : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), espèces 0243, 0244, 0245 et ombre de 0249. Atlases `*-Anim.png` enregistrés sous leurs noms de modes courts, XML des durées et crédits dans `characters/`. Adresses exactes dans `sprite-sources.json`. Les ombres utilisent un masque `source-in`, les reflets sont retournés et écrêtés sous la surface de l’eau. Les flammes, nuages, pluie, éclairs, fumées, braises, brume, reflets, ondes et étincelles sont animés en Canvas. `film.mjs` concatène `prefix.mjs`, `shared.mjs`, `common.mjs`, `scenes.mjs`.

## Musiques et effets

- Raikou : **Le Rugissement du tonnerre**, cordes rythmiques, cuivres, percussions et tonnerre.
- Entei : **Le Souffle du volcan**, cordes graves, cors, percussions, grondements et braises.
- Suicune : **Le Miroir de la nuit**, harpe, célesta, flûte, cordes et clapotis.

Compositions originales ; aucune musique officielle, mélodie officielle ou prise vidéo n’est copiée. La musique originale de Lugia accompagne la tour et l’orage, celle de Ho-Oh accompagne l’arc-en-ciel. Les sources MIDI des trois nouvelles parties et leurs masters WAV sont conservés. La banque **GeneralUser GS 2.0.3** et sa licence sont partagées dans `../rayquaza/v4-musique-originale/`. Les vrais cris proviennent de [PokéAPI / cries](https://github.com/PokeAPI/cries), avec fichiers et documentation dans `audio/`. La musique et les effets s’atténuent sous le cri.

## Reproduction et validation

1. `node server.cjs` sert `http://127.0.0.1:4202/?id=245` (ou 243, 244).
2. `node render.cjs 245 all` produit 720 images ; répéter pour 243 et 244. Sans `all`, plans de contrôle.
3. `python compose_and_encode.py 245` crée le MIDI, le master WAV et le MP4 ; répéter pour les autres. Python : PyAV, NumPy, Pillow. Les sources d’introduction sont lues dans les dossiers de production voisins.
4. `python contact.py` assemble les plans de contrôle des vidéos réellement décodées.

Adapter les chemins Playwright/Edge dans le script de rendu selon la machine. Les dossiers temporaires `frames/` et les captures Canvas brutes ne sont pas archivés. `*-validation.json` vérifie 720 images à horodatages croissants, le décodage audio complet sans saturation, les deux noirs silencieux, la présence des cris par corrélation et les dimensions finales. Les tests du jeu vérifient l’invocation normale, l’audio, la récompense, la fin native, le retour à l’écran d’obtention, la relecture et l’affichage mobile. Seules les variantes normales sont enregistrées.
