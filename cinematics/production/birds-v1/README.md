# Les trois oiseaux légendaires — PokéWorld

Trois cinématiques d’obtention distinctes en pixel art, avec musique originale, effets et véritable cri du Pokémon. Format : **960 × 540, 24 images/s**, piste AAC stéréo 48 kHz intégrée à chaque MP4.

## Artikodin — Le Souffle des Îles Écume

Film : `144-appearance-v1.mp4`, **30 secondes**.

| Temps | Plan |
| --- | --- |
| 0–5 s | Deux îles glacées au clair de lune. Une plume bleue glisse au-dessus de la mer vers une grotte. |
| 5–11 s | La caméra suit la plume dans un tunnel de glace, le long d’un cours d’eau gelé. |
| 11–17 s | Une salle secrète s’ouvre ; le givre gagne le bassin autour d’une estrade naturelle. |
| 17–21 s | Des cristaux se dressent, des éclats tourbillonnent et un blizzard envahit le plan. |
| 21–30 s | Artikodin apparaît dans la neige, s’élève au-dessus du bassin et déploie ses ailes. Cri à 22,3 s. |

Musique originale : nappes froides, cordes, harpe, célesta, flûte et chœur lumineux lors de la révélation.

## Électhor — Le Cœur de la centrale

Film : `145-appearance-v1.mp4`, **30 secondes**.

| Temps | Plan |
| --- | --- |
| 0–6 s | Une centrale abandonnée sous l’orage. Un éclair frappe son paratonnerre. |
| 6–12 s | Le pupitre et les voyants se rallument ; des arcs parcourent la turbine. |
| 12–18 s | Gros plan sur le générateur en surcharge ; l’énergie remonte vers le toit. |
| 18–22 s | Plusieurs éclairs convergent sur le conducteur central du toit. |
| 22–30 s | Un flash jaune révèle Électhor, qui décolle au milieu des arcs et de la pluie. Cri à 23,1 s. |

Musique originale : pulsation mécanique, basse et motifs synthétiques, percussions électroniques, rupture sur le tonnerre puis montée de combat.

## Sulfura — Les Ailes de l’aube

Film : `146-appearance-v1.mp4`, **32 secondes**.

| Temps | Plan |
| --- | --- |
| 0–6 s | Avant l’aube, une braise portée par le vent rejoint le sommet du Mont Braise. |
| 6–12 s | La caméra s’enfonce le long d’une rivière de lave jusqu’à une cheminée volcanique. |
| 12–18 s | Gros plan sur le magma : bulles, reflets, chaleur et pression montent. |
| 18–24 s | Au bord du cratère, une colonne de flammes s’élève dans le ciel du matin. |
| 24–32 s | Sulfura surgit des flammes puis plane au-dessus du volcan au lever du soleil. Cri à 25,1 s. |

Musique originale : cordes graves et pizzicati dans le volcan, montée de timbales puis cuivres, harpe et chœur à l’aube.

## Décors, sprites et son

Les **neuf décors** ont été générés avec **ImageGen intégré**, un fichier par plan principal. Les PNG finaux, les neuf prompts exacts `*-prompt.txt` et `backdrops.json` sont conservés dans ce dossier. Les effets, mouvements de caméra, plume, givre, éclats, arcs, voyants, braises, distorsion de chaleur, flammes et animation des oiseaux sont réalisés en Canvas dans `scenes.mjs`.

Chaque oiseau utilise ses véritables planches animées [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab) : espèces `0144`, `0145`, `0146`. Les PNG, fichiers XML de durées et crédits sont conservés dans `characters/`, avec les URL dans `sprite-sources.json`.

Un **ancrage corporel fixe** est commun aux différentes poses d’ailes d’un même oiseau ; l’extrémité d’une aile n’est jamais utilisée comme ancre. Les oiseaux restent entièrement visibles dans tous les battements après leur envol.

Cris : [PokéAPI / cries](https://github.com/PokeAPI/cries), fichiers `cries/pokemon/latest/144.ogg`, `145.ogg`, `146.ogg`, inclus dans `audio/` avec README et licence. Les niveaux musicaux baissent sous chaque cri. Vent, glace, grésillements, pluie, grondements, lave, souffle et percussions électroniques sont synthétisés localement.

Trois compositions originales : partitions éditables `144-score.mid`, `145-score.mid`, `146-score.mid` ; musiques seules `*-score.wav` ; mix complets `*-soundtrack.wav`. Aucun thème officiel, enregistrement musical ou MIDI tiers n’est repris. Banque instrumentale : [GeneralUser GS 2.0.3, S. Christian Collins](https://github.com/mrbumpy409/GeneralUser-GS), fichier et licence partagés dans `../rayquaza/v4-musique-originale/`. Composition et encodage reproductibles dans `compose_and_encode.py` et `sample_renderer.py`.

## Reproduction et validation

1. `node server.cjs` : aperçu à `127.0.0.1:4199`, choix de l’oiseau dans la page.
2. `node render.cjs` : plans de contrôle des trois films. Ajouter `144`, `145` ou `146` pour un seul.
3. `node render.cjs all` : 720 + 720 + 768 images temporaires.
4. `python compose_and_encode.py` : les trois partitions, mixages et MP4 ; un ID facultatif sélectionne un seul film.
5. `python contact.py` : planches de contrôle depuis les images réellement décodées des MP4.

Python : av, NumPy, Pillow, SoundFont partagé. Playwright et Edge rendent Canvas ; adapter leurs chemins dans `render.cjs` selon la machine. `prefix.mjs` et `scenes.mjs` forment `film.mjs`. Les images temporaires et la copie de travail du SoundFont ne sont pas archivées dans ce dossier.

Chaque `*-validation.json` documente le nombre d’images décodées, les horodatages croissants, la piste audio complète sans saturation, la corrélation du vrai cri à son repère, la taille et l’empreinte du MP4. Les `*-render-info.json` contrôlent cinq plans différents, la révélation tardive et les limites du corps sur toutes les images de la dernière partie du film. Captures du MP4 dans `encoded-preview/`, planches `*-story-contact.jpg`.

Les films sont affectés uniquement aux oiseaux de Kanto normaux : **144, 145, 146**. Les variantes chromatiques et les formes de Galar conservent leur propre parcours. L’intégration du jeu vérifie première obtention, vidéo et audio, retour à la récompense après la fin native, affichage mobile et relecture depuis la fiche sans coût supplémentaire.
