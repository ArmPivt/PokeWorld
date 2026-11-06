# Mew — L’Ombre de la jungle

Cinématique d’obtention normale pour PokéWorld. **32 secondes, 960 × 540, 24 images/s**, musique et effets stéréo intégrés au MP4. Aucun abonnement vidéo ou musical nécessaire.

## Scénario demandé

| Temps | Plan |
| --- | --- |
| 0–6 s | Début conservé de Mewtwo : scientifiques sur l’île devant l’ancienne fresque de Mew. |
| 6–12 s | Une silhouette noire de Mew traverse la jungle au niveau du sol, change de direction et passe derrière les arbres. |
| 12–18 s | Nouveau plan dans la canopée : la silhouette bondit et flotte entre les grandes branches. |
| 18–24 s | Elle rejoint une clairière ensoleillée ; la caméra avance à sa suite. |
| 24–32 s | L’ombre se colore et Mew apparaît enfin, puis flotte plus près de la caméra. Son véritable cri commence à 25,3 s. |

Le prélèvement d’ADN et les scènes de laboratoire appartiennent uniquement à Mewtwo. Aucun de ces plans n’est présent ici. La cinématique reste réservée à Mew normal (151), sans réutilisation pour Mew chromatique (151s).

## Décors et animation

Le décor et le plan d’ouverture sont réutilisés de `../mewtwo-v1/`. Les 144 images de cette ouverture sont identiques aux images de rendu approuvées de Mewtwo ; les six premières secondes du mix WAV sont conservées à l’identique.

Trois nouveaux décors ont été créés avec **ImageGen intégré** : `floor.png`, `canopy.png`, `clearing.png`. Les prompts exacts sont conservés dans `backdrops.json` et les trois fichiers `*-prompt.txt`. `mural-prompt.txt` documente le décor d’ouverture existant. Les PNG finaux sont inclus dans ce dossier.

Le film est monté et animé localement en Canvas : trajectoires Catmull-Rom continues, sprites natifs directionnels, masque noir pendant la poursuite, arbres et feuilles au premier plan, feuilles emportées, reflets, particules, mouvements de caméra et apparition colorée dans la clairière. Aucun plan n’est simplement une vidéo générée à partir d’une seule image fixe.

Sprites : [PMDCollab / SpriteCollab, espèce 0151](https://github.com/PMDCollab/SpriteCollab/tree/master/sprite/0151). Planches d’animation, durées XML et crédits conservés dans `characters/151/`, `sprites.json` et `sprite-sources.json`. La silhouette utilise le masque alpha des véritables sprites de Mew.

## Musique et son

**L’Ombre de la jungle** : composition originale. Après l’introduction commune de six secondes avec *Le Projet Origine*, de nouvelles phrases de marimba, flûte, pizzicato, harpe et célesta accompagnent la poursuite, puis une cadence lumineuse accompagne la révélation. Aucun thème officiel, échantillon musical ou MIDI tiers repris.

Partition : `l-ombre-de-la-jungle.mid`. Musique seule : `l-ombre-de-la-jungle-score.wav`. Mix complet : `mew-soundtrack.wav`. Composition, bruitages synthétisés et encodage : `compose_and_encode.py`. Le MIDI contient les notes originales ; l’introduction audio du rendu final est reprise du master Mewtwo pour garder sa continuité exacte.

Banque instrumentale : [GeneralUser GS 2.0.3, S. Christian Collins](https://github.com/mrbumpy409/GeneralUser-GS), fichier et licence partagés dans `../rayquaza/v4-musique-originale/`.

Cri de Mew : [PokéAPI / cries](https://github.com/PokeAPI/cries), `cries/pokemon/latest/151.ogg`, conservé dans `audio/` avec la documentation et la licence du dépôt. La musique baisse sous le cri. Vent, bruissements des feuilles, oiseaux lointains et scintillement sont synthétisés localement.

## Reproduction et vérification

1. `node server.cjs` : aperçu local sur `127.0.0.1:4198`.
2. `node render.cjs` : plans de contrôle et continuité des trajectoires.
3. `node render.cjs all` : 768 images temporaires.
4. `python compose_and_encode.py` : partition, musique, mixage et MP4.
5. `python contact.py` : planche de contrôle depuis le MP4 décodé.

Python : av, NumPy, Pillow ; SoundFont partagé ci-dessus. Playwright et Edge sont utilisés pour rendre Canvas ; adapter leurs chemins dans `render.cjs` sur une autre machine. Les images de rendu temporaires ne sont pas archivées. `prefix.mjs` et `scenes.mjs` forment `film.mjs`.

`validation.json` vérifie les 768 images, les horodatages croissants, l’audio complet sans saturation, le véritable cri par corrélation et la conservation de l’ouverture. `render-info.json` vérifie des plans lisibles, l’ombre en déplacement avant la clairière, l’apparition colorée et l’absence de saut brutal de position. Captures issues du MP4 dans `encoded-preview/`, planche complète dans `story-contact.jpg`.

Le contrôle du jeu utilise le portail de génération 1, puis vérifie la première obtention, la piste audio, la fin native du film et le retour à la récompense, l’affichage mobile, la relecture depuis la fiche et la conservation du solde de tickets lors de cette relecture.
