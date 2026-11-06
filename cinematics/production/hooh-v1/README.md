# Ho-Oh — La Promesse des deux tours

Cinématique d’obtention normale pour PokéWorld : **44 secondes, 960 × 540, 24 images/s**, musique et effets stéréo intégrés au MP4 `250-appearance-v1.mp4`.

Référence fournie par l’utilisateur : [Pokemon Heart Gold — Summoning Ho-Oh, rfMokou](https://www.youtube.com/watch?v=ZRrflvE1DIU), 103 secondes. Les plans de la cérémonie ont été examinés : cinq femmes en kimono, cloches lumineuses, feuilles portées par le vent, lumière dorée dans les nuages et arrivée de Ho-Oh. La vidéo et son enregistrement musical servent uniquement à l’étude dans le dossier de travail ; ils ne sont pas inclus dans le jeu ou les sources archivées. Seules les métadonnées sont conservées ici.

## Scénario

| Temps | Plan |
| --- | --- |
| 0–7 s | La tour historique brûle sous l’orage : flammes sur les étages, fumée et pluie. |
| 7–13 s | La pluie éteint progressivement l’incendie. La fumée cache l’effondrement des étages, puis révèle la Tour Cendrée. |
| 13–20 s | Après l’extinction complète, un arc-en-ciel traverse les nuages et une lumière multicolore éclaire les ruines. |
| 20–29 s | Au sommet de la Tour Carillon, les cinq femmes en kimono exécutent une danse avec leurs éventails. Rapprochement de caméra sur la cérémonie ; les deux cloches résonnent. |
| 29–35 s | Un autre plan suit une lumière dorée dans les nuages ; une traînée irisée et des éclats précèdent son arrivée. |
| 35–44 s | Un flash doré révèle Ho-Oh. Il descend au-dessus de la terrasse, bat des ailes et pousse son véritable cri à 37,15 s. Les danseuses restent présentes. |

La Tour Cendrée reste une ruine. La cérémonie finale se déroule sur la terrasse de la **Tour Carillon**, conformément au lieu de la référence HeartGold.

## Décors et danseuses

Création par **ImageGen intégré** :

- `tower.png` : la tour avant son effondrement ; les grandes flammes sont animées séparément.
- `ruins.png` : édition du même décor, conservant cadrage, fondation, cour et arbres après l’incendie.
- `terrace.png` : terrasse de cérémonie et deux cloches en bronze.
- `sky.png` : ciel de l’arrivée.
- `dancers.png` : planche réellement transparente de cinq femmes en kimono, quatre poses chacune.

Les cinq prompts exacts sont conservés dans les fichiers `*-prompt.txt` et dans `backdrops.json`, avec les PNG finaux. `dancers.json` décrit les vingt poses et leurs ancrages. Les personnages gardent la même échelle dans toutes les poses ; les pieds et le centre de chaque cellule servent d’ancrages, avec de petites transitions et un déplacement latéral continu.

Les mouvements de caméra, le feu, la pluie, la fumée de l’effondrement, le tracé progressif des sept couleurs de l’arc-en-ciel, les faisceaux sur les ruines, les feuilles, les ondes des cloches et l’arrivée lumineuse sont animés en Canvas dans `scenes.mjs`.

Ho-Oh utilise ses véritables planches [PMDCollab / SpriteCollab, espèce 0250](https://github.com/PMDCollab/SpriteCollab/tree/master/sprite/0250). PNG, XML des durées et crédits conservés dans `characters/250/`. Un ancrage fixe du corps évite que la position change avec l’extrémité des ailes. `bird-layout.json` conserve le cadrage calculé sur toutes les poses.

## Musique et son

**La Promesse des deux tours** est une composition originale dans une ambiance de cérémonie inspirée de la référence. Cordes sombres et taiko pendant le feu ; textures plus légères sous la pluie ; harpe et flûte lors de l’arc-en-ciel ; koto, shamisen, shakuhachi et percussions sur le rythme de la danse ; puis cordes, chœur et montée lumineuse lors de la révélation. Aucun enregistrement, sample musical, MIDI tiers ou transcription du thème officiel n’est réutilisé.

Partition : `la-promesse-des-deux-tours.mid`. Musique seule : `la-promesse-des-deux-tours-score.wav`. Mix complet : `hooh-soundtrack.wav`. Composition, cloches en bronze synthétisées, bruitages et encodage : `compose_and_encode.py`. Instruments et repères dans `score.json`.

Banque : [GeneralUser GS 2.0.3, S. Christian Collins](https://github.com/mrbumpy409/GeneralUser-GS), fichier et licence partagés dans `../rayquaza/v4-musique-originale/`.

Cri de Ho-Oh : [PokéAPI / cries](https://github.com/PokeAPI/cries), `cries/pokemon/latest/250.ogg`, inclus dans `audio/` avec la documentation et la licence du dépôt. Le niveau musical baisse pendant son cri. Feu, pluie, bois, souffle et cloches sont synthétisés localement.

## Reproduction et vérification

1. `node server.cjs` : aperçu local à `127.0.0.1:4200`.
2. `node render.cjs` : plans de contrôle et vérification de la séquence.
3. `node render.cjs all` : 1 056 images temporaires.
4. `python compose_and_encode.py` : partition, musique, mixage et MP4.
5. `python contact.py` : planche de contrôle depuis le MP4 décodé.

Python : av, NumPy, Pillow ; SoundFont partagé. Playwright et Edge rendent Canvas ; adapter leurs chemins dans `render.cjs` selon la machine. `prefix.mjs` et `scenes.mjs` forment `film.mjs`. Les images temporaires et la copie de travail du SoundFont ne sont pas archivées.

`render-info.json` vérifie six plans lisibles, l’extinction totale avant l’arc-en-ciel, cinq danseuses et quatre poses effectivement utilisées, ainsi que les limites de toutes les ailes après l’arrivée de Ho-Oh. `validation.json` vérifie les 1 056 images décodées, les horodatages, la piste audio complète sans saturation et le vrai cri par corrélation. Captures issues du MP4 dans `encoded-preview/`, planche dans `story-contact.jpg`.

La vidéo est affectée exclusivement à **Ho-Oh normal (250)**. Le contrôle de jeu sélectionne le portail de génération 2, puis vérifie la première obtention, la vidéo et l’audio, le retour à la récompense après la fin native, le cadrage mobile et la relecture depuis la fiche sans consommer de ticket.
