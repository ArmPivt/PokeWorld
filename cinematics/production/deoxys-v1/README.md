# Deoxys — Le Code Delta

Cinématique originale en pixel art, 36 secondes, six plans, 960 × 540 à 24 images/seconde. Rendu Canvas local, sprites réellement animés, musique originale et cri de Deoxys.

## Découpage

| Temps | Plan |
| --- | --- |
| 0–5,5 s | Laboratoire : deux scientifiques, données animées sur les moniteurs, balayage de la météorite dans une enceinte de recherche. |
| 5,5–10,5 s | La météorite approche de la Terre, tourne et grandit dans le cadre. |
| 10,5–16,5 s | Rayquaza entre dans le champ, accélère, s'allonge dans son animation d'attaque et heurte la météorite. Impact à 14,8 s, explosion et fragments. |
| 16,5–19 s | Un triangle sombre apparaît au milieu des débris. |
| 19–27 s | Bonds rapides et pauses du triangle, dans l'ordre observé dans la référence, puis retour au centre. Sa couleur vire progressivement au rouge. |
| 27–36 s | Le triangle grossit ; des filaments apparaissent ; il se brise et révèle Deoxys. Cri à 32 s, animation d'attaque spéciale et maintien du personnage avant le fondu final. |

## Référence et mouvements du triangle

Vidéo fournie par l'utilisateur : [Pokemon Omega Ruby & Alpha Sapphire: Mega Rayquaza & Deoxys Cutscene HD](https://www.youtube.com/watch?v=jPqWP_9vxbk), publiée par Rox, durée 123 s.

La séquence du triangle a été inspectée visuellement autour de 90,8–97,2 s. L'ordre adapté au cadrage pixel art est : centre, bas gauche, haut centre, bas droite, haut gauche, haut droite, bas centre, milieu gauche, milieu droite, bas centre, centre. Les déplacements rapides restent séparés par des pauses ; le triangle ne tourne pas arbitrairement sur lui-même. Les coordonnées et temps employés figurent dans `scenes.mjs` (`TRIANGLE_PATH`) et `render-info.json`.

La copie basse résolution et les captures de référence utilisées uniquement pour l'analyse ne font pas partie des fichiers du jeu ni des sources distribuées. Les décors, les effets, le montage et la musique présents ici ont été créés pour ce projet. Rayquaza est dans sa forme normale, cohérente avec le sprite déjà employé dans PokéWorld.

## Musique et son

**Le Code Delta** : composition originale électro rétro. Introduction de laboratoire, tension pendant l'approche de la météorite, montée de cuivres pendant l'attaque, puis motif électronique asymétrique pour le triangle et Deoxys. Aucun extrait, sample, MIDI ni transcription de la musique officielle de la vidéo n'est utilisé. L'utilisateur a confirmé le choix d'une composition originale dans cette ambiance.

La partition éditable est conservée dans `le-code-delta.mid`, la musique seule dans `le-code-delta-score.wav` et le mixage dans `deoxys-soundtrack.wav`. Le niveau baisse sous le cri à 32 s.

Instruments : GeneralUser GS 2.0.3, S. Christian Collins, https://github.com/mrbumpy409/GeneralUser-GS . Licence complète jointe ; banque partagée avec `../rayquaza/v4-musique-originale/GeneralUser-GS.sf2`. Le rendu est effectué par NumPy sans logiciel payant ni binaire FluidSynth.

Cris : [PokéAPI / cries](https://github.com/PokeAPI/cries), fichier `cries/pokemon/latest/386.ogg`, conservé avec la documentation du dépôt dans `audio/`. Effets de scanner, propulsion, explosion et déplacements du triangle synthétisés dans le script de mixage.

## Images et crédits

Trois assets ImageGen : laboratoire, espace avec Terre et météorite transparente. Images originales, prompts exacts dans `lab-prompt.txt`, `space-prompt.txt`, `meteor-prompt.txt` et `backdrops.json`. Ce dernier contient également les chemins historiques de génération ; le moteur charge les PNG locaux du présent dossier. Les images ont été créées avec l'outil ImageGen intégré.

Sprites : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), dossiers `sprite/0384` et `sprite/0386`. Planches, XML des durées et crédits conservés dans `characters/`. Deoxys utilise sa forme normale. Aucun film normal n'est utilisé pour sa variante chromatique.

## Reproduction et validation

1. `node server.cjs` — serveur local sur 127.0.0.1:4192.
2. `node render.cjs` — images de contrôle.
3. `node render.cjs all` — 864 images temporaires dans `frames/`.
4. `python compose_and_encode.py` — partition, musique, mixage et film MP4 H.264/AAC.

Python : `av`, `numpy`, `Pillow`. Adapter les chemins locaux de Playwright et Edge dans `render.cjs` sur une autre machine. Les fichiers temporaires image par image ne sont pas archivés avec les sources.

Le MP4 final est intégralement décodé ; les 864 images, les horodatages croissants et l'audio sont contrôlés. La présence du cri à 32 s est vérifiée par corrélation après compression AAC. Empreinte SHA-256 et résultats dans `validation.json`. Le poster et les plans de contrôle de `encoded-preview/` sont tirés du MP4 réellement encodé.
