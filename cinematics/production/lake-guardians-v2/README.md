# Gardiens des lacs — Apparitions dans les grottes, v2

Révision des cinématiques normales de **Créhelf (480), Créfollet (481) et Créfadet (482)** : **30 secondes, 960 × 540, 24 images/s** chacune.

Les **seize premières secondes sont conservées**, image de rendu par image de rendu : lacs Savoir, Vérité et Courage, Chaîne Rouge et approche de la caverne. À partir de **16 s**, l’ombre puis la révélation en couleurs ont lieu **à l’intérieur de la grotte du Pokémon**, devant une paroi et un plafond rocheux, au-dessus d’un petit îlot entouré d’eau. La fin reste dans cet intérieur jusqu’au fondu. La neige de Créhelf est limitée aux scènes extérieures.

Les musiques originales, effets et cris sont préservés **sans réencodage audio** : tous les paquets AAC sont identiques à la v1. Révélation après 21,2 s, cri à 22,7 s, mêmes animations natives et ancrages corporels.

## Nouveaux décors ImageGen

Trois nouveaux intérieurs créés avec **ImageGen intégré** :

- `acuity-cave.png` : caverne Savoir, givre, cristaux et lumière froide, reflet ambré sur l’îlot.
- `verity-cave.png` : caverne Vérité, roche violette, veines de quartz rose et eau calme.
- `valor-cave.png` : caverne Courage, roche cobalt, cristaux cyan et courants souterrains.

Prompts exacts `*-cave-prompt.txt`, images finales et provenance dans `backdrops.json`. Les décors extérieurs, sprites natifs, crédits, références et partitions originales sont repris de la [v1](../lake-guardians-v1/README.md). Aucun Pokémon n’est peint dans les décors. Les variantes chromatiques ne réutilisent pas ces films normaux.

## Reproduction et vérification

1. `node server.cjs` : `http://127.0.0.1:4202/?id=480` (ou 481, 482).
2. `node render.cjs 480 all` : 720 images ; répéter pour chaque espèce.
3. `python encode_revision.py 480` : encode les images et reprend les paquets audio de `../lake-guardians-v1/480-appearance-v1.mp4` ; répéter pour les autres espèces. Python : PyAV, NumPy et Pillow.
4. `python contact.py` : planches issues des vidéos réellement décodées.

Les chemins Playwright/Edge dans le rendu sont à adapter selon la machine. Les images temporaires `frames/` et les MP4 intermédiaires `*-video-only.mp4` ne sont pas archivés. Les partitions et masters restent dans la v1.

Les rapports `*-render-info.json` vérifient le lieu intérieur de chaque plan à partir de 16 s, le bon décor, l’absence de révélation colorée trop tôt et le cadrage de toutes les poses et queues. `*-validation.json` vérifie le décodage de 720 images, les horodatages, l’audio complet sans saturation, l’identité des paquets AAC et celle des 384 premières images avec la v1. Les contrôles du jeu vérifient invocation, audio, récompense, fin native, retour à l’écran d’obtention, relecture et affichage mobile. Les anciens films restent archivés dans les sources de la v1.
