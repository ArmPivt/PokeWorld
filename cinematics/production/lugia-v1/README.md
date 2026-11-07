# Lugia — L’Appel des marées

Cinématique d’obtention normale pour PokéWorld : **30 secondes, 960 × 540, 24 images/s**, avec musique et effets stéréo intégrés au MP4 `249-appearance-v1.mp4`.

Référence fournie par l’utilisateur : [How to reach Lugia in Pokémon SoulSilver, Pro Shashank](https://www.youtube.com/shorts/gQQogOvgizc), 178 secondes. La cérémonie et l’arrivée de Lugia ont été examinées : les cinq femmes en kimono, la Cloche Marée, les plumes blanches, les lumières, le bassin entouré de rochers et Lugia traversant les cascades. La route dans les Tourb’Îles n’est pas reprise dans le film. L’enregistrement vidéo et musical de la référence reste uniquement dans le dossier d’étude local ; seuls ses métadonnées sont archivées ici.

## Scénario

| Temps | Plan |
| --- | --- |
| 0–2,5 s | Même tour et flammes que l’ouverture de Ho-Oh, mais sous un ciel calme, sans pluie ni éclairs. |
| 2,5–7,5 s | Lugia arrive au-dessus de la tour. Son animation et ses ondes d’énergie précèdent l’orage, déclenché à 3,6 s ; la pluie affaiblit les flammes. |
| 7,5–8 s | Transition entièrement noire. |
| 8–13 s | Les cinq femmes en kimono dansent autour de la Cloche Marée dans la grotte des Tourb’Îles. |
| 13–17 s | Le bassin tourbillonne, des plumes argentées apparaissent et les cascades s’intensifient. |
| 17–21 s | Le rideau d’eau s’écarte et Lugia traverse la cascade vers le bassin. |
| 21–30 s | Un éclat argenté mène au plan large de Lugia, ailes déployées, au-dessus de l’eau et des danseuses. Son vrai cri commence à 22,4 s. |

Lugia est montré à l’ouverture afin que la cause de l’orage soit explicite, puis reçoit sa véritable scène d’apparition dans la grotte.

## Décors et animation

Trois images ont été créées avec **ImageGen intégré** :

- `calm.png` : édition du décor de tour de Ho-Oh, avec pluie, éclairs et nuages d’orage retirés ; architecture et cadrage conservés.
- `shrine.png` : la grotte de la cérémonie, son îlot de pierre, sa cloche et le bassin circulaire.
- `waterfall.png` : le plan rapproché du bassin et des cascades.

PNG finaux et prompts exacts `*-prompt.txt` conservés dans ce dossier, avec leur provenance dans `backdrops.json`. Le décor orageux `storm.png` est repris de `../hooh-v1/tower.png` ; il n’est fondu à l’image qu’après l’invocation de Lugia. Les cinq danseuses et leurs quatre poses transparentes proviennent aussi de la v1 de Ho-Oh, avec leurs ancrages dans `dancers.json`.

Les flammes, l’arrivée et l’animation de Lugia, les ondes de son invocation, la météo, les reflets, les cloches lumineuses, la danse, les plumes argentées, le tourbillon, le rideau d’eau et son ouverture sont animés en Canvas dans `scenes.mjs` et `shared.mjs`.

Sprites de Lugia : [PMDCollab / SpriteCollab, espèce 0249](https://github.com/PMDCollab/SpriteCollab/tree/master/sprite/0249). PNG, XML des durées et crédits conservés dans `characters/249/`. Un ancrage corporel stable est utilisé entre les poses. `bird-layout.json` documente le cadrage calculé sur tous les battements d’ailes du plan final.

## Musique et son

**L’Appel des marées** est une composition originale dans l’ambiance cérémonielle et aquatique de la référence : cordes sombres pendant le feu, montée lorsque Lugia invoque l’orage, koto, shamisen, shakuhachi et percussions pour la danse, puis harpe, célesta, cordes et chœur pour les cascades et la révélation. Aucun thème officiel, enregistrement musical, sample ou MIDI tiers n’est repris.

Partition éditable : `l-appel-des-marees.mid`. Musique seule : `l-appel-des-marees-score.wav`. Mix complet : `lugia-soundtrack.wav`. Composition, cloches argentées synthétisées, bruitages et encodage : `compose_and_encode.py`. Instruments et repères dans `score.json`.

Banque : [GeneralUser GS 2.0.3, S. Christian Collins](https://github.com/mrbumpy409/GeneralUser-GS), fichier et licence partagés dans `../rayquaza/v4-musique-originale/`. Cri de Lugia : [PokéAPI / cries](https://github.com/PokeAPI/cries), `cries/pokemon/latest/249.ogg`, inclus dans `audio/` avec documentation et licence. Le mix musical et les effets baissent sous le cri. Feu, pluie, tonnerre, souffle, écume et cloches sont synthétisés localement.

## Reproduction et validation

1. `node server.cjs` : aperçu à `127.0.0.1:4202`.
2. `node render.cjs` : plans de contrôle ; `node render.cjs all` : 720 images temporaires.
3. `python compose_and_encode.py` : partition, musique, mixage et MP4.
4. `python contact.py` : planche depuis les images réellement décodées du film.

Python : av, NumPy, Pillow ; SoundFont partagé. Playwright et Edge rendent Canvas ; adapter leurs chemins dans `render.cjs` selon la machine. `prefix.mjs`, `shared.mjs` et `scenes.mjs` forment `film.mjs`. Les images temporaires et la copie de travail du SoundFont ne sont pas archivées.

`render-info.json` vérifie que le ciel reste calme jusqu’à l’invocation, que Lugia est déjà visible lorsqu’il déclenche l’orage, que la transition est noire, que les cinq danseuses sont présentes et que Lugia reste entier dans le cadre final. `validation.json` vérifie les 720 images décodées, les horodatages croissants, l’audio complet sans saturation, le silence du noir et le vrai cri par corrélation. Captures dans `encoded-preview/`, planche dans `story-contact.jpg`.

Le film concerne uniquement **Lugia normal (249)**. Le contrôle du jeu sélectionne le portail de génération 2 puis vérifie vidéo et audio, première obtention, fin native et retour à la récompense, affichage mobile, relecture depuis la fiche et conservation des tickets lors de cette relecture.
