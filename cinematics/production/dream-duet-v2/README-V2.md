# Rêves et cauchemars — version 2

Deux films de 30 secondes, avec une opposition rendue plus visible après le retour du joueur.

## Cauchemar renforcé

- Nouvelle chambre de cauchemar : grande silhouette derrière la fenêtre, mains démesurées sur la vitre, ombres qui s’étirent sur le sol et porte ouverte sur le noir.
- Nouveau jardin : arbres aux visages inquiétants, silhouette immense derrière le pont, reflets et racines menaçants, lune éclipsée.
- Dans Darkrai : coupure musicale et image noire unique de 12,60 à 12,72 s, puis retour rapproché à la fenêtre jusqu’à 13,45 s, avec deux coups et une ponctuation sonore originale.
- Dans Cresselia : le début montre directement ce cauchemar, puis les ombres et sons oppressants s’effacent avec la guérison.

## Beau rêve renforcé

Le jardin a des îlots fleuris en lévitation, des pierres flottantes au-dessus du bassin, des papillons et des rubans de nuages lumineux. Des couches animées flottent aux bords de l’image ; la silhouette et le visage du Pokémon restent dégagés lors de sa révélation.

## Son et médias

La musique originale de la v1 reste la base du diptyque. La v2 ajoute souffle filtré synthétique, subbasses désaccordées, pulsations, coups à la fenêtre et clochettes de guérison. Aucune voix ni musique officielle échantillonnée. Le passage du cri natif à 22,7 s est conservé. Les instruments restent ceux de GeneralUser GS déjà crédités dans la production Rayquaza.

Les trois nouveaux décors sont des éditions imagegen des images de dream-duet-v1. Prompts : prompts-v2.json ; références et fichiers : backdrops-v2.json. Les sprites PMDCollab et les cris PokeAPI sont inchangés, crédits dans characters/ et audio/.

720 images à 24 images/s, 960×540, H.264/AAC stéréo. Même révélation à 21 s et même routage strict des variantes normales et chromatiques. Les posters ne montrent aucun Pokémon. Les fichiers v1 sont conservés dans la production hors du paquet web.

Sources : scenes.mjs, enhanced.mjs et encode_revision.py. L’encodeur utilise les WAV de la v1 comme source, qu’on peut recréer avec son compose_encode.py. Les courbes de corruption et les six cadrages de base restent opposés ; l’insertion de chambre est une rupture supplémentaire pour Darkrai. Les MP4 sont entièrement décodés pour vérifier images, horodatages, cri et absence de saturation.
