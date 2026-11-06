# Ho-Oh — Montage court v2

Révision de la cinématique de Ho-Oh demandée par l’utilisateur : **30 secondes au lieu de 44**, 960 × 540, 24 images/s. La première partie passe à dix secondes et la danse dure cinq secondes.

| Temps | Plan |
| --- | --- |
| 0–3,5 s | Flammes sur la tour, puis fondu au noir. |
| 3,5–4 s | Noir complet. |
| 4–9,5 s | Tour détruite, arc-en-ciel progressif, lumière dorée plus dense et silhouettes de Raikou, Entei et Suicune au centre. |
| 9,5–10 s | Second noir complet. |
| 10–15 s | Danse raccourcie des cinq femmes en kimono. |
| 15–21 s | Arrivée de la lumière dorée dans les nuages, conservée de la v1. |
| 21–30 s | Apparition et descente de Ho-Oh, conservées de la v1. Cri à 23,15 s. |

Les **360 images de rendu des quinze dernières secondes sont identiques** à celles de la v1, et les quinze dernières secondes du master audio PCM sont conservées à l’identique. Le nouveau MP4 est réencodé pour former un film unique avec son nouveau montage.

## Ressources

Les cinq images créées avec ImageGen pour la v1 et leurs ancrages sont réutilisés : tour, ruines, terrasse, ciel et planche des danseuses. Les PNG sont inclus ici ; prompts et provenance dans `backdrops.json` et dans le [dossier source v1](../hooh-v1/README.md). Aucun nouveau décor généré pour cette révision.

Les trois ombres utilisent les masques alpha des véritables sprites [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab) : Raikou `0243`, Entei `0244`, Suicune `0245`. Elles sont peintes en noir, devant la lumière, avec positions et échelles dans `beasts.json`. PNG, XML des durées et crédits conservés dans `characters/`. Ho-Oh conserve son animation et son ancrage de la v1.

`shared-scenes.mjs` conserve les fonctions de mise en scène de la v1 ; `revision.mjs` contient le nouveau déroulé et la scène des silhouettes. Avec `prefix.mjs`, ces fichiers forment `film.mjs`.

## Musique

La composition originale **La Promesse des deux tours** est remontée avec des fondus sur les nouvelles coupes et une liaison douce vers la fin conservée. Un carillon discret souligne la lumière des trois silhouettes. Le détail du montage audio est dans `edit-decision.json` ; le master original et la partition MIDI restent dans `../hooh-v1/`.

Musique seule révisée : `la-promesse-des-deux-tours-v2-score.wav`. Mix complet : `hooh-v2-soundtrack.wav`. Rendu et encodage : `edit_and_encode.py`. Aucun enregistrement musical officiel ajouté. Le cri réel de Ho-Oh, issu de [PokéAPI / cries](https://github.com/PokeAPI/cries), est conservé avec sa documentation et sa licence dans `audio/`.

## Vérification

1. `node server.cjs` : aperçu à `127.0.0.1:4201`.
2. `node render.cjs` : plans de contrôle ; `node render.cjs all` : 720 images temporaires.
3. `python edit_and_encode.py` : remontage des masters de la v1, nouveau MP4 et vérifications audio/vidéo.
4. `python contact.py` : planche depuis le MP4 décodé.

Python : av, NumPy, Pillow. Playwright et Edge rendent Canvas ; adapter leurs chemins dans `render.cjs` selon la machine. Les images temporaires ne sont pas archivées.

`render-info.json` vérifie les deux intervalles noirs, les trois silhouettes et la lumière, l’arc-en-ciel après les flammes et les cinq danseuses. `validation.json` vérifie les 720 images, les horodatages, l’absence de saturation, les silences des noirs, le vrai cri à 23,15 s, les 360 images de fin et l’identité du master audio final. Captures dans `encoded-preview/`, planche dans `story-contact.jpg`.

Le jeu utilise `250-appearance-v2.mp4` et le nouveau format de 30 secondes, à la première obtention et en relecture depuis la fiche. La v1 reste archivée dans son propre dossier.
