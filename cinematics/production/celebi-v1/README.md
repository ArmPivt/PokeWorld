# Celebi — Le Souffle du temps

Cinématique d’obtention normale : **30 secondes, 960 × 540, 24 images/s**, avec musique originale, effets et vrai cri intégrés au MP4 `251-appearance-v1.mp4`.

## Recherches et adaptation

L’utilisateur a laissé le choix du scénario après une recherche sur Internet. Références consultées, le 7 novembre 2026 :

- [Pokémon Cristal — Celebi et la GS Ball, Serebii](https://www.serebii.net/crystal/celebi.shtml) : arbres agités et GS Ball placée dans le sanctuaire du Bois aux Chênes pour faire apparaître Celebi.
- [Événement Celebi de HeartGold/SoulSilver, Serebii](https://www.serebii.net/heartgoldsoulsilver/celebi.shtml) : Celebi brille près du sanctuaire et transporte les personnages dans le temps.
- [Pokémon 4Ever, synopsis officiel](https://www.pokemon.com/fr/dessins-animes/films/pokemon-4ever) : Sam et Celebi sont retrouvés dans une forêt quarante ans après leur disparition.
- [Description officielle de Celebi](https://zarude.pokemon.com/en-us/) : voyage à travers le temps et protection des forêts.

**Scénario original**, inspiré de ces éléments : les saisons remontent dans une même clairière, puis un tunnel de feuilles lumineuses mène à Celebi. Cette séquence précise n’est pas présentée comme une scène officielle. Aucun extrait vidéo ou musical n’est repris.

## Montage

| Temps | Plan |
| --- | --- |
| 0–4 s | Approche du petit sanctuaire dans la forêt au crépuscule ; GS Ball sur l’autel. |
| 4–8 s | Plan rapproché de la GS Ball : vibrations, lumière verte, ondes et pollen lumineux. |
| 8–10,5 s | Même clairière en hiver, flocons qui remontent. |
| 10,5–13 s | Retour à l’automne, feuilles ambrées qui montent vers les branches. |
| 13–16 s | Printemps ; un passage vert s’ouvre dans le creux du grand chêne. |
| 16–21 s | Traversée du passage temporel, anneaux et feuilles en perspective ; petite silhouette de Celebi, puis flash. |
| 21–30 s | Celebi apparaît en couleurs, flotte dans la clairière et fait fleurir le sol ; cri à 22,6 s. |

## Visuels et animation

**ImageGen intégré** : `shrine.png` et `spring.png` ont été générés ; `winter.png` et `autumn.png` sont des éditions du même décor printanier, avec caméra, arbres, racines et chemin conservés pour les transitions. Les prompts exacts sont archivés dans `*-prompt.txt`, provenance dans `backdrops.json`. Aucun Pokémon n’est peint dans les décors.

Sprites animés natifs : [PMDCollab / SpriteCollab, espèce 0251](https://github.com/PMDCollab/SpriteCollab/tree/master/sprite/0251). Atlases `Idle-Anim.png` et `Walk-Anim.png`, XML des durées et crédits dans `characters/251/`, sous leurs noms courts de modes. Ancrage corporel stable entre les six poses de repos ; dimensions de toutes les poses dans `render-info.json`. GS Ball dessinée en Canvas pixel art, coque dorée et argentée, bouton et marques GS. Les feuilles, flocons, pollen, lumière, portail, tunnel, silhouette, vol et fleurs sont animés en Canvas. `film.mjs` concatène `prefix.mjs`, `shared.mjs` et `scenes.mjs`.

## Musique et son

**Le Souffle du temps** : composition originale pour cordes, flûte, célesta, harpe, nappes aériennes et chœur. La mélodie s’éveille avec la GS Ball, traverse trois couleurs harmoniques pour les saisons, accélère dans le passage et se résout à l’apparition. Bruitages d’oiseaux, vent inversé, cloches et souffle temporel synthétisés localement. Aucune mélodie, prise musicale ou partition officielle copiée.

Sources éditables : `251-score.mid`, `251-score.json`, master stéréo `251-soundtrack.wav`, composition et encodeur `compose_and_encode.py`. Instruments : banque GeneralUser GS 2.0.3, fichier et licence partagés dans `../rayquaza/v4-musique-originale/`. Vrai cri : [PokéAPI / cries](https://github.com/PokeAPI/cries), `cries/pokemon/latest/251.ogg`, inclus avec documentation dans `audio/`. La musique et les effets s’atténuent sous le cri.

## Reproduction et validation

1. `node server.cjs` : aperçu sur `http://127.0.0.1:4202`.
2. `node render.cjs all` : 720 images de rendu temporaires ; sans `all`, plans de contrôle.
3. `python compose_and_encode.py` : MIDI, master et MP4. Python : PyAV, NumPy et Pillow. Banque de sons partagée dans le dossier voisin de Rayquaza.
4. `python contact.py` : planche depuis les images réellement décodées.

Adapter les chemins Playwright et Edge dans le script de rendu selon la machine. Les fichiers temporaires `frames/` ne sont pas archivés. `render-info.json` et `251-validation.json` contrôlent les sept plans, trois saisons, GS Ball, silhouette avant la révélation colorée, cadrage complet des poses, décodage de 720 images aux horodatages croissants, audio stéréo sans saturation et vrai cri par corrélation. Les contrôles du jeu portent sur l’invocation, la récompense, la fin native, le retour à l’obtention, la relecture et l’affichage mobile. Seule la variante normale est enregistrée.
