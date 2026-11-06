# Rayquaza — retour au-dessus du duel

Deuxième montage narratif de 21,63 secondes, 960 × 540, 24 images/seconde. Cinq plans montés, sprites réellement animés, effets dessinés image par image et bande sonore stéréo. Aucune génération vidéo payante ni abonnement.

## Découpage

- **0–6 s :** Groudon et Kyogre s'affrontent dans une baie orageuse. Projectile de feu, vague, lave et choc des attaques.
- **6–8,6 s :** coupe sur le sommet du Pilier Céleste, puis apparition d'un point vert.
- **8,6–12,4 s :** concentration de l'énergie et lumière qui jaillit vers le ciel ; la caméra suit son ascension.
- **12,4–14,8 s :** la lumière traverse plusieurs bancs de nuages qui l'occultent brièvement, puis se dirige vers la baie.
- **14,8–21,63 s :** retour sur Groudon et Kyogre. La lumière descend au-dessus d'eux, puis un grand flash vert à **16,52 s** révèle Rayquaza. Son cri commence à **16,85 s**, accompagné de son animation de redressement. Les trois Pokémon restent visibles ensemble avant le fondu final.

Ce montage est proposé pour validation visuelle. Il n'a pas encore remplacé la cinématique du site.

## Fichiers

- `rayquaza-retour-baie-v2.mp4` : film H.264 / AAC.
- `rayquaza-soundtrack.wav` : mixage stéréo 48 kHz.
- `film.mjs` : animation déterministe à une résolution interne de 480 × 270, agrandie sans interpolation.
- `01-battlefield.png`, `02-summit.png`, `04-clouds.png` : décors originaux générés pour ces plans ; prompts exacts conservés à côté.
- `characters/`, `sprites.json` : planches de sprites et durées originales des animations, crédits conservés par espèce.
- `encoded-contact-v2.jpg` : contrôle des images réellement décodées depuis le MP4.
- `validation.json` : contrôle du décodage complet de la vidéo et de l'audio.

## Sources et crédits

Sprites Groudon (#383), Kyogre (#382) et Rayquaza (#384) : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), dossiers `sprite/0383`, `sprite/0382`, `sprite/0384`. Les fichiers `AnimData.xml` et `credits.txt` téléchargés avec chaque espèce sont conservés sans modification. Cette attribution ne constitue pas une nouvelle autorisation de licence.

Décors : images originales générées avec ImageGen ; prompts conservés dans les fichiers `*-prompt.txt`. Mise en scène, effets et montage : moteur Canvas local créé pour PokéWorld.

Musique : compositions originales du projet PokéWorld, pistes `storm.wav` et `cosmic.wav`, attribution dans `music/LICENSE.txt`. Effets de vent, montée et impacts : synthèse NumPy dans `encode_film.py`.

Cri de Rayquaza : [PokéAPI / cries](https://github.com/PokeAPI/cries), fichier `cries/pokemon/latest/384.ogg` conservé dans `audio/rayquaza-cry.ogg`. Source exacte : https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/384.ogg . README et licence du dépôt conservés à côté. Le cri conserve sa hauteur et sa vitesse d'origine ; seul le niveau est ajusté dans le mixage, avec une baisse de la musique pendant le cri.

## Reproduction

Python : `av`, `numpy`, `Pillow`. Node : `playwright`. Le script de capture emploie l'installation locale de Microsoft Edge. Adapter son chemin de dépendance Playwright à la machine.

1. `node server.cjs` — serveur local sur `127.0.0.1:4188`.
2. `node render_frames.cjs preview` — images de contrôle.
3. `node render_frames.cjs all` — 519 images dans `frames-v2/` (dossier temporaire non livré).
4. `python encode_film.py` — bande sonore, MP4 et validation par décodage complet.

Le lecteur HTML est destiné à la capture déterministe ; `rayFilm.render(tempsEnSecondes)` affiche l'image demandée. Le MP4 est le fichier à lire pour voir le montage animé avec son son.
