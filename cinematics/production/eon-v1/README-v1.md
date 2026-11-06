# Latias et Latios — Le voyage de l’Île du Sud

Deux films de 32 secondes, 960 × 540 à 24 images/seconde, H.264/AAC. Chaque légendaire vient lui-même chercher le voyageur et est aussi celui révélé à la fin : **Latias 380** dans une version, **Latios 381** dans l’autre. Variantes normales uniquement ; aucune réutilisation du film normal pour les chromatiques.

## Découpage

| Temps | Plan |
| --- | --- |
| 0–5 s | Sur la côte de Hoenn, un petit explorateur attend. Latias ou Latios arrive depuis la mer et ralentit près de lui. |
| 5–8 s | Le Pokémon se retourne ; le voyageur s’approche, monte sur son dos et décolle. |
| 8–14 s | Vol au-dessus de l’océan, passager visible sur le dos. L’île boisée grandit à l’horizon, les nuages et filets de vent défilent. |
| 14–17 s | Atterrissage sur la plage. Le voyageur descend et rejoint l’entrée de la forêt ; son guide prend de l’avance. |
| 17–25 s | Marche en vue subjective : chemin forestier, plusieurs couches de troncs et feuillages en parallaxe, balancement de marche, lumière lointaine qui grossit jusqu’au blanc. |
| 25–26 s | Écran entièrement blanc. |
| 26–32 s | Le blanc se retire et révèle le légendaire obtenu dans une clairière entourée de deux cascades ; cri réel à 27 s, animation puis fondu final. |

Après le film, le lecteur existant du jeu revient à l’écran d’obtention. Le film peut être revu depuis la fiche du Pokémon sans dépenser de ticket.

## Référence

Vidéo fournie par l’utilisateur : [CAPTURER MEGA LATIOS POKEMON RUBIS OMEGA 12](https://www.youtube.com/watch?v=0wL7Qk8Fh4U), compte Leandra Sapp, durée 2 623 secondes. Le début a été inspecté, notamment l’arrivée autour de 120–145 s, le départ à dos de Pokémon vers 150–160 s, l’arrivée sur l’île vers 166–172 s, puis le passage vers la clairière autour de 210–240 s.

Le montage reprend l’enchaînement demandé — venue du guide, transport, île, forêt, lumière, révélation — dans de nouveaux décors pixel art. À la demande de l’utilisateur, le guide correspond au légendaire de chaque version. Les scènes de dialogue, de combat et de Méga-Évolution de la vidéo ne font pas partie de ces films. Les métadonnées sont documentées dans reference-metadata.json ; aucune copie de la vidéo de référence n’est distribuée avec le projet.

## Images et animation

Cinq décors originaux créés avec **ImageGen intégré**, un appel par asset :

- coast.png : côte et départ ;
- island.png : vue aérienne de l’île ;
- landing.png : plage et entrée de la forêt ;
- forest.png : tunnel forestier et ouverture lumineuse ;
- clearing.png : clairière aux deux cascades.

Prompts exacts dans les cinq fichiers *-prompt.txt et backdrops.json. Les PNG utilisés sont copiés dans ce dossier, aucun chemin historique de génération n’est chargé par le film.

Le petit explorateur est un sprite générique original de cellules pixel dessinées par Canvas, avec poses debout et assise ; il ne représente pas le profil personnalisé du joueur. Les déplacements, changements de direction, embarquement, vent, nuages, feuillages proches, lumière et reflets de cascade sont animés par scenes.mjs.

Sprites Pokémon : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), dossiers sprite/0380 et sprite/0381. Planches sources, XML des durées et crédits conservés dans characters/. Les palettes normales restent celles des sprites originaux.

## Musiques et sons

Deux compositions originales, sans sample, transcription ni mélodie de la vidéo :

- **Latias : La Promesse de l’Île du Sud**, célesta, harpe, flûte et cordes.
- **Latios : Les Ailes de l’Île du Sud**, vibraphone, harpe, flûte et cordes.

Invitation paisible sur la côte, mouvement plus ample pendant le vol, musique plus espacée dans la forêt, puis cadence lumineuse à la révélation. Vent, vagues, pas, feuillages et eau sont synthétisés ; le niveau musical baisse sous le cri à 27 s.

Dans chaque dossier d’espèce : score.mid (partition), score.wav (musique seule), soundtrack.wav (mixage), score.json (repères et instruments). Composition et encodage : compose_and_encode.py.

Instruments : [GeneralUser GS 2.0.3, S. Christian Collins](https://github.com/mrbumpy409/GeneralUser-GS), banque et licence partagées dans ../rayquaza/v4-musique-originale/. Rendu NumPy sans outil musical payant.

Cris : [PokéAPI / cries](https://github.com/PokeAPI/cries), cries/pokemon/latest/380.ogg et 381.ogg, conservés dans audio/ avec la documentation et la licence du dépôt.

## Reproduction et validation

1. node server.cjs — prévisualisation sur 127.0.0.1:4195 avec choix Latias / Latios.
2. node render.cjs — plans de contrôle.
3. node render.cjs all — 768 images temporaires par film ; ajouter 380 ou 381 pour une seule version.
4. python compose_and_encode.py — musique, mixage et MP4 ; option --species 380 ou --species 381.
5. python contact.py — planches issues des images du MP4 final.

Python : av, numpy, Pillow ; banque SoundFont partagée. Adapter les chemins Playwright et Edge dans render.cjs sur une autre machine. Les images temporaires frame par frame ne sont pas archivées.

Les deux MP4 ont été intégralement décodés : 768 images chacun, horodatages croissants, audio stéréo sans saturation, cri de l’espèce vérifié par corrélation à 27 s. Le rendu contrôle aussi le guide et l’espèce révélée, la progression dans la forêt et l’écran blanc complet avant l’apparition. Résultats dans chaque validation.json et render-info.json ; captures réelles dans encoded-preview/, planches dans story-contact.jpg. Les contrôles de jeu couvrent invocation, son, fin native et récompense, format mobile, relecture depuis la fiche et solde de tickets.
