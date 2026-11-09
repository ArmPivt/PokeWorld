# Arceus — Avant le premier matin

Cinématique normale, 32 s, 960 × 540, 24 images/s. Dix plans animés, musique originale **Le Chant des Origines**, véritable cri d’Arceus à 26,3 s. La variante chromatique conserve son propre traitement et ne reçoit pas ce film normal.

## Référence et adaptation
[Pokémon HG/SS – Arceus Event Cutscene (Sinjoh Ruins)](https://www.youtube.com/watch?v=hi6WyRP6Cog), M@T, 79 secondes. Métadonnées conservées dans reference-metadata.json ; vidéo examinée par plans dans l’atelier local, aucune copie de référence redistribuée. Les cercles lumineux, Zarbi et le montage de création inspirent une nouvelle réalisation en pixel art. Les images photographiques de l’original sont remplacées par une galaxie, une planète, une forêt et des cellules animées. Aucun sample ni transcription de la musique officielle.

## Plans
- 0–5 s : mur ancien gravé en alphabet Zarbi, rapprochement de caméra.
- 5–9 s : les yeux s’ouvrent, les inscriptions quittent la pierre et forment un cercle.
- 9–12 s : passage vers le cosmos et sceau géométrique lumineux.
- 12–22 s : galaxie, planète, forêt, vie microscopique, convergence de la lumière.
- 22–25,2 s : la Salle Originelle apparaît, un noyau lumineux descend vers le dais.
- 25,2–32 s : Arceus se révèle, s’anime et pousse son cri ; fondu final.

Inscription originale : **AVANT LE TEMPS / AVANT L ESPACE / LA LUMIERE**, réellement composée avec les formes A–Z de Zarbi.

## Ressources et prompts
Décors créés avec **ImageGen intégré** : [493-ruins.png](493-ruins.png), [493-origin.png](493-origin.png). Prompts exacts : [ruines](493-ruins-prompt.txt), [Salle Originelle](493-origin-prompt.txt). La forêt réutilise le décor original ImageGen de ../celebi-v1/spring.png, copié ici dans world-forest.png.

Sprites animés d’Arceus : [PMDCollab/SpriteCollab, sprite/0493](https://github.com/PMDCollab/SpriteCollab/tree/master/sprite/0493), XML et crédits conservés dans characters/493/. Zarbi : [PokéAPI/sprites](https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-v/black-white), fichiers 201.png et 201-b.png à 201-z.png, conservés dans unown/. Cri : [PokéAPI/cries](https://github.com/PokeAPI/cries), cries/pokemon/latest/493.ogg. Pokémon © Nintendo / Creatures / GAME FREAK.

Musique composée localement pour ce film, sans mélodie officielle ; MIDI, score.wav et soundtrack.wav dans 493/. Instruments GeneralUser GS 2.0.3, banque et licence partagées dans ../rayquaza/v4-musique-originale/.

## Reproduction et contrôles
`node server.cjs` (port 4199), `node render.cjs all`, `python compose_and_encode.py`. Les 768 PNG temporaires sont exclus du dépôt. `493/validation.json` documente le décodage intégral, le niveau audio et la corrélation du cri. Les captures encoded-preview proviennent du MP4 encodé. Le lecteur du jeu masque le chargement, respecte les animations réduites et termine sur la fin native de la vidéo. Relecture depuis la fiche sans consommation de ticket.
