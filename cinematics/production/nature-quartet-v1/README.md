# Heatran, Phione, Manaphy et Shaymin — films originaux

Quatre films MP4 de 28 secondes, cinq plans chacun, avec musiques originales et cris natifs.

- Heatran : approche de la grotte volcanique, grande chambre de basalte et de lave, fissure lumineuse, silhouette sortant du tunnel puis apparition sur la roche sèche.
- Phione : entrée d’une grotte marine, progression jusqu’au bassin, bulles et lumière, silhouette dans une bulle d’eau puis apparition au-dessus du petit socle.
- Manaphy : même grotte et douze premières secondes identiques à Phione, puis cœur de lumière et pulsations, silhouette et apparition avec son propre cri et thème.
- Shaymin : île couverte de fleurs, chemin vers la clairière, une fleur lumineuse, pétales et vague de floraison, puis apparition de la forme Terrestre de Shaymin.

Rendu logique Canvas 480×270, MP4 en 960×540 à 24 images/s, H.264 et AAC stéréo. Chaque film compte 672 images. La révélation en couleur est à 20 s et le cri à 21,7 s. Les posters viennent de l’approche du lieu, avant toute silhouette. Les sprites sont entièrement cadrés : Heatran sur la roche, les deux Pokémon aquatiques au-dessus du bassin, Shaymin devant les fleurs sans élément masquant son visage.

Décors créés avec **imagegen intégré** : heatran-cave.png, water-mouth.png, water-cave.png, flower-island.png, flower-clearing.png. Les prompts exacts et les fichiers sources sont conservés dans prompts.json et backdrops.json. volcano.png reprend le décor déjà approuvé de primal-films. Les scènes, particules, mouvements de caméra et transitions sont dessinés dans scenes.mjs, puis réellement encodés en vidéo.

Sprites animés : PMDCollab/SpriteCollab, crédits des artistes dans characters/{id}/credits.txt et sources dans sprite-sources.json. Cris : PokeAPI/cries, fichiers OGG et sources GitHub conservés. Musique originale composée avec GeneralUser GS (SoundFont et licence déjà présents dans la production Rayquaza), sans reprise de thème ni d’enregistrement officiel.

Titres, nombres de notes et indications d’instruments : {id}-score.json ; partition d’événements et moteur reproductible : compose_encode.py et sample_renderer.py. Les douze premières secondes de Phione et Manaphy partagent la même image et le même PCM, vérifiés par validate_shared.py. Les différences commencent après 12 s. Les formes normales sont enregistrées ; les chromatiques gardent leur routage distinct sans reprendre les mauvaises couleurs.

Pour reproduire : servir avec node server.cjs, exécuter node render.cjs {id} all, puis compose_encode.py avec le Python de production (NumPy, Pillow, PyAV). Les WAV et les 2 688 PNG intermédiaires restent dans le dossier de travail et ne sont pas déployés. Les validations décodent les MP4, vérifient les horodatages, les 672 images, la saturation et la présence corrélée du cri.
