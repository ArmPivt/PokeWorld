# Le trio des Régis — Les sceaux oubliés

Trois cinématiques distinctes de 28 secondes, 960 × 540, 24 images/seconde, H.264/AAC. Regirock (377), Regice (378), Registeel (379), variantes normales exclusivement. Décors pixel art ImageGen, exploration à la première personne, lampe mobile, énigmes et portes animées, véritable cri de chaque espèce.

## Découpage commun

| Temps | Plan |
| --- | --- |
| 0–5 s | Exploration de la grotte à la lampe, balayage des parois puis des inscriptions. Mouvement de marche en vue subjective. |
| 5–12 s | Résolution de l’énigme propre au Regi. Les inscriptions sont encodées en cellules braille de six points, avec une traduction française discrète. |
| 12–15 s | Les deux panneaux de la porte coulissent et dévoilent le passage noir. Le regard revient vers l’entrée. |
| 15–18 s | Avancée dans le passage ; la lampe perd sa lumière et s’éteint. |
| 18–21,5 s | Noir complet : seuls les sept points du visage s’allument progressivement. Aucun décor ni corps visible. |
| 21,5–28 s | La grotte s’éclaire soudain ; le Regi est révélé à l’endroit exact des points, s’anime, pousse son cri à 22,2 s, puis le plan se termine en fondu. |

## Énigmes et référence

Référence fournie par l’utilisateur : [How to Unlock and Encounter the Legendary Regis — Pokémon Omega Ruby & Alpha Sapphire: How](https://www.youtube.com/watch?v=pQfphSG53Qo), TyranitarTube, 168 secondes. Séquences observées approximativement entre 107–119 s (Regirock), 125–135 s (Regice) et 145–155 s (Registeel). Les métadonnées sont conservées dans reference-metadata.json ; la copie vidéo d’analyse n’est pas distribuée.

- **Regirock** : deux déplacements à droite, deux vers l’arrière, puis Force. Les quatre mouvements produisent un décalage et un balancement de caméra ; Force fait vibrer la porte. Grotte de grès et poussière.
- **Regice** : rester face au sceau sans se déplacer, laisser passer deux minutes. Une montre fait deux tours en accéléré, suivie de l’indication « Deux minutes plus tard… ». Cette attente est une ellipse de montage : le film ne dure pas deux minutes. Grotte gelée et cristaux.
- **Registeel** : rejoindre le centre de la salle, invoquer Vol. La lampe descend vers le médaillon du sol, un courant ascendant et des plumes stylisées répondent au geste, puis le sceau s’ouvre. Caveau métallique.

Les actions sont des séquences filmées automatiquement dans la cinématique d’invocation ; elles ne créent pas un nouveau mini-jeu interactif.

## Alignement des sept points

Les points ne sont pas placés à la main devant le Pokémon. Le moteur extrait les sept pixels colorés du visage de la première image Idle, utilise le même cadre, la même ancre et la même échelle que le sprite de révélation, puis les colore avec leur RGB d’origine. eye-geometry.json documente les couleurs et la limite de région (pour exclure les doigts de Registeel). Le rendu refuse un masque contenant autre chose que sept points.

Avant l’allumage de la grotte, moins de 2 % de l’image peuvent contenir une lumière visible. Chaque render-info.json conserve les coordonnées source des sept points et la proportion de pixels lumineux. La révélation commence sur cette même pose avant l’animation Charge et Idle.

## Musiques et sons

Trois compositions originales, sans sample, transcription ou mélodie officielle :

- 377 : **Le Sceau des Sables**, pulsations sourdes et marimba.
- 378 : **L’Attente du Glacier**, célesta et nappes glacées.
- 379 : **Le Souffle de l’Acier**, vibraphone, résonances et souffle ascendant.

Dans chaque dossier d’espèce : score.mid éditable, score.wav (musique seule), soundtrack.wav (mixage), score.json (instruments et repères). Le niveau musical baisse dans le noir puis sous le cri. Bruits de pas, montre, porte et extinction de lampe synthétisés localement.

Instruments : [GeneralUser GS 2.0.3, S. Christian Collins](https://github.com/mrbumpy409/GeneralUser-GS), banque et licence partagées dans ../rayquaza/v4-musique-originale/. Rendu NumPy, aucun abonnement requis.

Cris : [PokéAPI / cries](https://github.com/PokeAPI/cries), fichiers cries/pokemon/latest/377.ogg, 378.ogg et 379.ogg, conservés dans audio/ avec la documentation et la licence du dépôt.

## Décors et sprites

Les six décors ont été générés avec **ImageGen intégré**, un asset par appel : 377-puzzle.png, 378-puzzle.png, 379-puzzle.png, 377-chamber.png, 378-chamber.png, 379-chamber.png. Prompts exacts dans les six fichiers *-prompt.txt et backdrops.json. Les ressources utilisées sont copiées dans ce dossier, aucun chemin de génération distant n’est chargé par le film.

Sprites : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), dossiers sprite/0377, sprite/0378 et sprite/0379. Planches, XML de durées et crédits conservés dans characters/. Les mains, la lampe, la montre, les glyphes et les effets sont dessinés et animés par Canvas.

## Reproduction et contrôle

1. node server.cjs — prévisualisation sur 127.0.0.1:4194, choix du Regi dans la page.
2. node render.cjs — plans de contrôle, sept points et obscurité vérifiés.
3. node render.cjs all — 672 images temporaires par espèce. Ajouter 377, 378 ou 379 pour une seule espèce.
4. python compose_and_encode.py — musiques, mixages et films. Option --species 377 (ou 378, 379).
5. python contact.py — planches de contrôle des films encodés.

Python : av, numpy, Pillow, banque SoundFont partagée. Adapter les chemins Playwright et Edge de render.cjs selon la machine. Les images temporaires ne sont pas archivées avec le projet.

Les trois MP4 sont décodés intégralement : 672 images chacun, horodatages croissants, son stéréo sans saturation, véritable cri vérifié par corrélation à 22,2 s, empreinte SHA-256. Résultats dans chaque validation.json. Les captures de encoded-preview/ proviennent du MP4 réellement encodé. Les contrôles de jeu couvrent l’invocation, la récompense à la fin native, l’affichage mobile et la relecture depuis la fiche sans nouveau ticket.
