# Lugia — L’Appel des marées, v2

Version active de 30 secondes, 960 × 540, 24 images/s.

La tour commence en flammes sous un ciel calme. L’orage s’installe sans montrer Lugia. À **4,6 s**, un éclair illumine les nuages : **seule une silhouette noire** apparaît, pendant **0,32 seconde**, puis disparaît. Aucun œil, ventre ou plumage coloré n’est visible. Les éclairs fixes du décor orageux de la v1 sont remplacés par une météo animée sur le décor calme.

La transition noire et les scènes de la Cloche Marée, des cinq femmes en kimono, du bassin et des cascades sont conservées. Les **540 images de rendu après 7,5 s sont identiques à la v1**, comme les **paquets AAC de toute la musique, des effets et du cri à 22,4 s**, conservés sans recompression.

## Sources et prompts

Les décors ImageGen, les prompts exacts `*-prompt.txt`, la provenance `backdrops.json`, les sprites natifs de Lugia et leurs crédits, ainsi que les danseuses sont repris de la [v1](../lugia-v1/README.md). Aucune nouvelle image générée. La silhouette est un masque `source-in` de couleur `#080b18`, appliqué au sprite animé uniquement pendant l’éclair. Musique originale **L’Appel des marées**, sources MIDI/WAV et provenance conservées dans la v1. Référence : [cérémonie de Lugia dans SoulSilver](https://www.youtube.com/shorts/gQQogOvgizc).

## Reproduction et contrôles

1. `node server.cjs`, aperçu à `http://127.0.0.1:4202`.
2. `node render.cjs all` produit les 720 images. `intro` ne produit que les 180 premières.
3. `python encode_revision.py` encode les images et reprend l’audio de `../lugia-v1/249-appearance-v1.mp4` sans le modifier. Python : PyAV, Pillow, NumPy.
4. `python contact.py` produit la planche des images réellement décodées.

Le chemin Playwright/Edge dans le script de rendu est à adapter à la machine. Les fichiers temporaires `frames/` et `video-only.mp4` ne sont pas archivés. `render-info.json` et `validation.json` contrôlent la fenêtre d’apparition de l’ombre, l’absence de Lugia coloré pendant l’orage, le noir, les cinq danseuses, le cadrage des ailes, le décodage de 720 images et de l’audio, et l’identité de tous les paquets AAC. La conservation des 540 images finales a également été vérifiée contre les images de travail de la v1.

La v2 remplace uniquement la cinématique normale de Lugia dans le jeu. La v1 reste archivée.
