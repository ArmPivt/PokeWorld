# Deoxys — Le Code Delta

Cinématique originale en pixel art, 36 secondes, six plans, 960 × 540 à 24 images/seconde. Rendu Canvas local, sprites réellement animés, musique originale et cri de Deoxys.

## Découpage

| Temps | Plan |
| --- | --- |
| 0–5,5 s | Laboratoire : deux scientifiques, données animées sur les moniteurs, grand écran principal analysant à distance la météorite et sa trajectoire, écran latéral montrant une double hélice ADN. Aucun incubateur ni météorite physique. |
| 5,5–10,5 s | La météorite accélère vers la Terre. À 8,4 s, une lumière verte jaillit de la planète et révèle Rayquaza allongé, volant à sa rencontre. |
| 10,5–16,5 s | Plan large dans l’espace complet, sans planète : Rayquaza reste allongé pendant son approche, heurte la météorite à 14,8 s et la pulvérise en fragments. |
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

Assets initiaux ImageGen : laboratoire, espace avec Terre et météorite transparente. Images originales, prompts exacts dans `lab-prompt.txt`, `space-prompt.txt`, `meteor-prompt.txt` et `backdrops.json`. Ce dernier contient également les chemins historiques de génération ; le moteur charge les PNG locaux du présent dossier. Les images ont été créées avec l'outil ImageGen intégré.

Révision v2 : décors lab-analysis-v2.png et deep-space-v2.png édités avec **ImageGen intégré**, à partir des décors initiaux. Prompts exacts conservés dans lab-analysis-v2-prompt.txt, deep-space-v2-prompt.txt et revision-v2-imagegen.json. Le grand écran est calibré dans les coordonnées du décor ; données, trajectoire et double hélice sont animées par Canvas. Rayquaza emploie uniquement les images 5–8 de son attaque, direction 6, pour rester allongé. Son nez est calculé à partir de l’alpha du sprite et sert de point de contact.

Sprites : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), dossiers `sprite/0384` et `sprite/0386`. Planches, XML des durées et crédits conservés dans `characters/`. Deoxys utilise sa forme normale. Aucun film normal n'est utilisé pour sa variante chromatique.

## Reproduction et validation

1. `node server.cjs` — serveur local sur 127.0.0.1:4192.
2. `node render.cjs` — images de contrôle.
3. `node render.cjs all` — 864 images temporaires dans `frames/`.
4. `python encode_revision_v2.py` — film v2 H.264 et reprise exacte de la piste AAC approuvée du MP4 v1. Option --reference-frames : comparaison des 468 images source de la fin.

compose_and_encode.py et film-v1.mjs / scenes-v1.mjs sont conservés pour la version initiale et sa composition originale. La version active est **386-appearance-v2.mp4** ; ne pas réencoder la v1 pour produire cette révision.

Python : `av`, `numpy`, `Pillow`. Adapter les chemins locaux de Playwright et Edge dans `render.cjs` sur une autre machine. Les fichiers temporaires image par image ne sont pas archivés avec les sources.

Le MP4 final est intégralement décodé ; les 864 images, les horodatages croissants et l'audio sont contrôlés. La présence du cri à 32 s est vérifiée par corrélation après compression AAC. Empreinte SHA-256 et résultats dans `validation.json`. Le poster et les plans de contrôle de `encoded-preview/` sont tirés du MP4 réellement encodé.

## Contrôle de la révision v2

Les 864 images du MP4 ont été décodées, avec horodatages croissants. Les 468 images source entre 16,5 et 36 s ont été comparées une à une à la v1 : aucune différence de pixel. Les paquets AAC de la musique et du cri ont la même empreinte SHA-256 que la v1. Résultats dans revision-v2-validation.json, aperçu des nouveaux plans dans opening-contact.jpg, captures issues du MP4 final dans revision-v2-preview/. La durée, le triangle, le cri à 32 s et l’apparition finale sont conservés.
