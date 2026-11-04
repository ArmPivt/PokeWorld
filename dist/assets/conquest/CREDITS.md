# Cartes stratégiques de Conquête

Les neuf cartes de ce dossier sont des schémas originaux redessinés pour PokéWorld. Elles évoquent les régions des jeux Pokémon (côtes, îles, reliefs et principaux lieux), avec des distances, formes et positions volontairement simplifiées pour la stratégie. Ce ne sont ni des captures des jeux ni des reproductions fidèles de leurs cartes officielles. Aucun raster de tiers n’est inclus.

## Sources de référence consultées

- Présentation officielle des neuf régions : [The Pokémon Company — Region Map Posters](https://www.pokemon.com/us/news/adventure-from-kanto-to-paldea-with-the-pokemon-center-s-region-map-posters).
- Noms français des lieux : [PokéAPI — location_names.csv](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/location_names.csv) et [locations.csv](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/locations.csv).
- Références pixel art des premiers jeux consultées pour la structure, sans copier leurs fichiers : [pret/pokefirered](https://github.com/pret/pokefirered/tree/master/graphics/region_map), [pret/pokeemerald](https://github.com/pret/pokeemerald/tree/master/graphics/pokenav/region_map), [pret/pokecrystal](https://github.com/pret/pokecrystal/blob/master/gfx/pokegear/town_map.png). Ces fichiers sont des tilesets/assemblages et ne constituent pas une série homogène de neuf cartes directement utilisables.

Les noms Pokémon, lieux et univers appartiennent à Nintendo / Creatures / GAME FREAK / The Pokémon Company. Le dessin schématique, les polygones et les données de placement pour le mode Conquête sont propres à ce projet de fan gratuit.

## Format

regions.json contient neuf régions. Coordonnées normalisées entre 0 et 1 ; cadrage conseillé 160 × 104 cellules. polygons définit la terre, lakes retire de l’eau intérieure ou des estuaires, mountains situe les reliefs (rayon normalisé), cities les lieux repères français, spawn neuf points de départ répartis sur la terre et hors des lacs. Les îles des régions maritimes sont volontairement distinctes.

Reconstruction : node dist/assets/conquest/prepare-regions.cjs
