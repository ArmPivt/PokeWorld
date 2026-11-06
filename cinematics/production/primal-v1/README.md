# Kyogre et Groudon — cinématiques narratives

Deux films de 26 secondes, cinq plans, 960 × 540 à 24 images/seconde. Rendu local Canvas, sprites animés image par image, décors pixel art originaux, musiques composées pour ces scènes, cris propres aux deux espèces.

## Découpage

| Temps | Kyogre | Groudon |
| --- | --- | --- |
| 0–3,8 s | Fresque de la Grotte Granite, approche du panneau marin | Même fresque, approche du panneau du continent |
| 3,8–12 s | Descente continue dans l'océan, Loupio, Wailmer et Relicanth animés | Descente dans le volcan, coulées de lave, Limagma et Volcaropod animés |
| 12–15,4 s | Sanctuaire sombre, seuls les yeux bleus de la statue ressortent | Sanctuaire sombre, yeux rouges de la statue |
| 15,4–19 s | L'Orbe Bleu s'allume, lévite et projette une lumière bleue | L'Orbe Rouge s'allume, lévite et projette une lumière rouge |
| 19–26 s | Kyogre à la surface de l'océan, eau au premier plan, pluie et éclairs | Groudon sur un grand plateau continental, soleil fort et chaleur |

Le cri commence à 20,2 s ; le niveau de la musique et des effets baisse pendant sa lecture.

## Musiques

- Kyogre : **Le Serment des Abysses**, harpe, cordes graves, chœurs et cors.
- Groudon : **Le Cœur du Continent**, contrebasses, timbales, cordes et cuivres.

Ce sont deux compositions originales. La vidéo fournie en référence est intitulée « Pokémon Ruby, Sapphire & Emerald - Kyogre & Groudon Battle Music (HQ) », publiée par Pokeli : https://www.youtube.com/watch?v=r2BWx32tXXo&t=52s . Aucun audio, sample, MIDI ou transcription de ce morceau n'est employé. Les notes sont conservées en MIDI et dans le script de composition.

Instruments : GeneralUser GS 2.0.3, S. Christian Collins, https://github.com/mrbumpy409/GeneralUser-GS . Licence complète jointe ; banque partagée avec `../rayquaza/v4-musique-originale/GeneralUser-GS.sf2`. Aucun binaire FluidSynth ni abonnement n'est nécessaire au rendu.

## Sources graphiques et audio

Décors : sept images originales créées avec ImageGen ; prompts exacts dans les fichiers `*-prompt.txt` et `backdrops.json`. Les chemins de génération dans ce dernier fichier sont des traces de provenance ; le moteur emploie les PNG locaux du présent dossier.

Sprites : PMDCollab/SpriteCollab, https://github.com/PMDCollab/SpriteCollab , espèces 170, 218, 219, 320, 369, 382 et 383. Les planches, XML de durées et crédits sont conservés dans `characters/`. Les références de sprites et les images des statues sont distinctes ; les statues sont immobiles.

Cris : https://github.com/PokeAPI/cries , fichiers `cries/pokemon/latest/382.ogg` et `383.ogg`. Fichiers et documentation du dépôt conservés dans `audio/`. Bruitages de vent, bulles, grondements et impacts synthétisés localement avec NumPy.

## Production et contrôle

`film.mjs` est le moteur autonome complet, avec une résolution interne de 480 × 270 agrandie sans interpolation. `scenes.mjs` conserve la partie mise en scène. Choisir le film avec `?species=382` ou `?species=383`.

1. `node server.cjs` — serveur local sur 127.0.0.1:4190.
2. `node render.cjs` — images de contrôle dans les dossiers de chaque espèce.
3. `node render.cjs all` — 624 images par film dans les dossiers temporaires `382/frames` et `383/frames`.
4. `python compose_and_encode.py` — musiques, partitions MIDI, mixages et films MP4 H.264/AAC.

Python nécessite `av`, `numpy` et `Pillow`. Le script de capture utilise l'installation locale de Playwright et Edge ; adapter leurs chemins sur une autre machine. Les images temporaires ne sont pas archivées avec les sources.

Chaque MP4 est entièrement décodé, ses 624 images et ses horodatages sont vérifiés, ainsi que la présence du cri à 20,2 s par corrélation après compression AAC. Résultats, empreintes SHA-256, posters et contacts de contrôle figurent dans les dossiers `382/` et `383/`.

## Correction visuelle du 6 novembre 2026

Les médias actifs sont maintenant `382/382-appearance-v2.mp4` et `383/383-appearance-v3.mp4`. Les contours des lueurs suivent les orbites peintes, avec les mêmes coordonnées et le même zoom que le décor. Kyogre est présenté de trois quarts et la vague ne masque plus sa tête. Le premier Limagma est placé sur la surface du rebord gauche. Les deux pistes sonores AAC sont recopiées bit pour bit depuis les films précédents. `encode_revision.py` reproduit cet export après `node render.cjs all`. Les contrôles et les images réellement décodées sont conservés dans les dossiers de chaque espèce.
