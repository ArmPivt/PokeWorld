# Darkrai et Cresselia — diptyque du rêve

Deux films originaux de 30 secondes qui se répondent par les mêmes six plans et le même motif musical. Darkrai transforme le beau rêve en cauchemar ; Cresselia transforme le cauchemar en beau rêve.

## Plans communs

1. 0–4 s : chambre et dormeur sous la lumière de la lune. Le début de Darkrai est paisible ; celui de Cresselia est oppressant.
2. 4–9 s : jardin rêvé, pont, bassin, arbres et lune. Version fleurie chez Darkrai, version corrompue chez Cresselia.
3. 9–14 s : plume lunaire et reflets. La plume perd sa lumière d’un côté et la retrouve de l’autre.
4. 14–18 s : fleurs, ciel, eau et ombres évoluent progressivement dans des sens opposés.
5. 18–21 s : une présence se dessine dans le jardin, dans l’ombre ou la lumière.
6. 21–30 s : apparition en couleur, cri à 22,7 s et conclusion dans le cauchemar ou le rêve guéri.

Les deux jardins gardent le même point de vue, les mêmes structures et les mêmes emplacements. nightmare.png est une édition du décor garden.png réalisée avec l’outil imagegen intégré, après inspection de l’image source. La chambre est aussi un décor imagegen. Prompts exacts : prompts.json ; provenance : backdrops.json. Les deux courbes de corruption sont mathématiquement opposées et les coupes identiques, vérifiées par paired-check.cjs.

Musique originale : « Le Rêve dévoré » et « Le Rêve retrouvé ». Un même motif passe du majeur au mineur pour Darkrai, et du mineur au majeur pour Cresselia, avec battements, vents et clochettes opposés. Partition d’événements dans {id}-score.json, moteur dans compose_encode.py. Instruments GeneralUser GS, SoundFont et licence déjà conservés dans la production Rayquaza. Aucun enregistrement ni thème officiel repris.

Sprites PMDCollab/SpriteCollab, crédits dans characters/{id}/credits.txt ; sources dans sprite-sources.json. Cris PokeAPI/cries, fichiers OGG conservés dans audio. Les silhouettes utilisent exactement les sprites animés qui sont ensuite révélés ; aucun œil ajouté à la main.

Rendu logique 480×270 ; MP4 H.264 960×540, 24 images/s, AAC stéréo ; 720 images par film. Les posters montrent la chambre avant toute silhouette de Pokémon. Les formes normales sont enregistrées séparément des chromatiques.

Reproduction : node server.cjs, node render.cjs {491 ou 488} all puis compose_encode.py avec Python, PyAV, NumPy, Pillow et le moteur SoundFont existant. Les PNG intermédiaires et WAV restent dans le dossier de travail. Les validations décodent les MP4, comptent les images, vérifient les horodatages, le cadrage complet, l’absence de saturation et la présence du cri.
