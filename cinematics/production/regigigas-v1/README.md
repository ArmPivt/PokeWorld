# Regigigas — Le Serment des Trois Sceaux

Cinématique normale uniquement, 28 secondes, 960 × 540, 24 i/s. Animation Canvas déterministe encodée en H.264/AAC, musique originale et véritable cri de Regigigas.

## Énigme et plans
L’énigme reprend la condition de réveil du Temple de Frimapic en Sinnoh : réunir Regirock, Regice et Registeel. Référence : https://www.serebii.net/pokearth/sinnoh/snowpointtemple.shtml . Les autels et sceaux qui matérialisent cette condition sont une mise en scène originale ; il s’agit d’une séquence automatique d’invocation.

- 0–5 s : approche du temple gelé à la première personne, à la lampe.
- 5–7 s : lecture de l’inscription « Réunis la roche, la glace et l’acier ».
- 7–13 s : les trois Régis apparaissent sur les autels, leurs lumières convergent vers le sceau.
- 13–16 s : la porte de pierre s’ouvre en deux panneaux.
- 16–18 s : avancée dans l’entrée, extinction de la lampe.
- 18–21,5 s : seuls les points du visage sont visibles, alignés sur les pixels de la première image Idle.
- 21,5–28 s : le temple s’éclaire, Regigigas s’éveille et pousse son cri à 22,2 s.

## Ressources
Décor original produit par l’outil ImageGen intégré : `486-temple.png`. Sprites 2D animés : PMDCollab/SpriteCollab, sprite/0486, crédits conservés dans characters/486/credits.txt ; le trio réutilise les ressources créditées dans ../regis-v1/. Cri : PokeAPI/cries, cries/pokemon/latest/486.ogg (https://github.com/PokeAPI/cries). Musique **Le Serment des Trois Sceaux**, composition originale sans thème officiel ni sample ; instruments GeneralUser GS 2.0.3 et licence partagée dans ../rayquaza/v4-musique-originale/.

## Reproduction
`node server.cjs` (port 4198), `node render.cjs all 486`, puis `python compose_and_encode.py --species 486`. Les outils adaptent le procédé du trio des Régis. `486/validation.json` conserve l’empreinte du MP4, le décodage intégral, le niveau audio et la vérification du cri. Les images temporaires de rendu sont exclues du dépôt.

La cinématique est enregistrée pour la variante normale 486 et se relit depuis sa fiche. Elle utilise le lecteur existant qui masque le Pokémon avant le démarrage réel de la vidéo. Elle n’est pas utilisée pour une variante chromatique.
