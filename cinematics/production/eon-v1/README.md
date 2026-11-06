# Latias et Latios — Le voyage de l’Île du Sud, révision 2

Deux films de 32 secondes, 960 × 540 à 24 images/seconde, H.264/AAC. La version active est **appearance-v2** pour les deux légendaires.

| Pokémon obtenu | Guide venant chercher le voyageur | Personnage demandé |
| --- | --- | --- |
| Latias (380) | **Latios (381)** | **Flora**, la fille de la seconde capture : nœud orange et blanc, haut orange, sac vert à la taille. |
| Latios (381) | **Latias (380)** | **Brice**, le garçon de la première capture : casquette blanche, haut orange, short sombre, sac vert. |

Le guide transporte le personnage vers l’île ; c’est l’autre légendaire, celui obtenu, qui apparaît à la fin. Variantes normales uniquement.

## Déroulement

| Temps | Plan |
| --- | --- |
| 0–5 s | Brice ou Flora attend sur la côte. Le légendaire opposé arrive depuis la mer. |
| 5–8 s | Le guide se retourne ; le personnage rejoint son flanc, monte, replie les jambes et se stabilise assis. Le décollage commence seulement après l’installation. |
| 8–14 s | Vol vers l’île : le personnage reste fixé au dos, le couple partage les mouvements et l’inclinaison. |
| 14–17 s | Arrivée sur la plage : le personnage descend une seule fois puis rejoint la forêt ; le guide s’envole ensuite. |
| 17–25 s | Traversée en vue subjective avec troncs et feuillages en parallaxe, lumière croissante. |
| 25–26 s | Écran blanc complet. |
| 26–32 s | Révélation du légendaire obtenu dans la clairière aux cascades ; cri à 27 s, puis retour à l’écran d’obtention du jeu. |

## Personnages et correction de l’embarquement

Les deux captures fournies par l’utilisateur sont conservées sans modification dans rider-references/. Deux planches transparentes ont été créées avec **ImageGen intégré**, en génération à partir de références d’identité :

- boy-poses.png : Brice debout et assis ;
- girl-poses.png : Flora debout et assise.

Prompts exacts dans boy-poses-prompt.txt, girl-poses-prompt.txt et riders-imagegen.json. Les planches originales gardent leur transparence ; le moteur utilise des rectangles source, sans retoucher les PNG. riders.json décrit les cadres et les points du bassin.

Pendant la montée, la taille ne varie plus avec la pose ou l’envergure du Pokémon. Le passage debout → assis conserve le même point du bassin et la même échelle de pixels. Un seul personnage est dessiné par image. Pendant le transport, la pose de vol plané du guide est tenue ; un point source fixe sur son dos détermine la position du bassin. Toute translation ou inclinaison est appliquée au même groupe, guide et passager. La descente suit aussi une trajectoire continue avant le départ du guide.

Le contrôle de rendu parcourt toutes les images de la montée, du vol et de la descente : un seul personnage, guide opposé, personnage approprié et erreur d’attache nulle. Les coordonnées et écarts sont conservés dans chaque render-info.json et revision-v2-validation.json. Les planches boarding-contact.jpg et landing-contact.jpg montrent les poses des films réellement encodés.

## Éléments conservés

La musique, les bruitages et les cris sont repris de la piste AAC de la v1 **sans recompression**, avec empreinte des paquets identique. Chaque film conserve aussi les **360 images source depuis 17 s**, forêt, blanc et révélation compris : comparaison pixel par pixel avec la v1, aucune différence.

- Latias : **La Promesse de l’Île du Sud**.
- Latios : **Les Ailes de l’Île du Sud**.

Compositions originales, sans sample ni transcription de la vidéo de référence. Partitions et mixages d’origine dans les dossiers 380/ et 381/, composition dans compose_and_encode.py. Banque et licence [GeneralUser GS 2.0.3](https://github.com/mrbumpy409/GeneralUser-GS) partagées dans ../rayquaza/v4-musique-originale/. Cris [PokéAPI / cries](https://github.com/PokeAPI/cries), conservés dans audio/.

Les cinq décors ImageGen — coast.png, island.png, landing.png, forest.png, clearing.png — restent identiques. Prompts dans les fichiers correspondants et backdrops.json.

Sprites Pokémon : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), sprite/0380 et sprite/0381 ; XML, planches et crédits conservés dans characters/. Palettes normales conservées.

## Référence de mise en scène

Vidéo fournie précédemment : [CAPTURER MEGA LATIOS POKEMON RUBIS OMEGA 12](https://www.youtube.com/watch?v=0wL7Qk8Fh4U), compte Leandra Sapp, durée 2 623 secondes. Début observé autour de 120–240 s : venue du guide, embarquement, île et clairière. Les rôles sont corrigés selon la précision de l’utilisateur : guide opposé au Pokémon obtenu. Métadonnées dans reference-metadata.json ; la vidéo d’analyse n’est pas distribuée.

## Reproduction et contrôle

1. node server.cjs — prévisualisation sur 127.0.0.1:4196.
2. node render.cjs — contrôles visuels et assertions de montage.
3. node render.cjs all — 768 images temporaires par film ; ajouter 380 ou 381 pour une seule version.
4. python encode_revision_v2.py — MP4 v2 et copie de la piste AAC de la v1. Option --reference-frames-root : dossier contenant les anciennes images 380/frames et 381/frames, pour comparer les 360 images de la fin.
5. python contact.py et python contact_revision.py — planches des films encodés.

Python : av, Pillow. Le script de composition initial nécessite aussi numpy et la banque SoundFont, mais il n’est pas utilisé pour produire cette révision. Adapter les chemins de Playwright et Edge dans render.cjs selon la machine. Les images temporaires ne sont pas archivées.

768 images par film décodées intégralement, horodatages croissants, audio intégralement décodé, empreintes SHA-256 du film et de l’AAC contrôlées. Les contrôles du jeu couvrent l’invocation de la v2, l’audio, la fin native et la récompense, l’affichage mobile, la relecture et le solde de tickets.

Les MP4 v1, film-v1.mjs, scenes-v1.mjs, render-v1.cjs et README-v1.md sont conservés comme historique. Les captures de la révision sont dans 380/revision-v2-preview/ et 381/revision-v2-preview/.
