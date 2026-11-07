# Données Pokémon locales

Source : https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv
Générées par `prepare-dex.cjs` à partir des fichiers pokemon_species, pokemon_species_names, pokemon_stats, pokemon_types, types, moves, move_names, pokemon_moves et type_efficacy.

Noms français : langue 5 des tables PokéAPI. Six statistiques de base, types et quatre attaques préparées pour les combats de ce jeu. Les raretés et les taux d’invocation sont des choix de conception propres à La Tour Infernale.

Pokémon © Nintendo / Creatures / GAME FREAK. Données distribuées par le projet PokéAPI.

Combat stratégique : CSV `moves`, `move_names`, `types`, `move_meta`, `move_meta_stat_changes`, `move_meta_ailments` et `pokemon_moves` du [dépôt officiel PokeAPI](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv). Génération via `prepare-combat.cjs`. 919 définitions de métadonnées, dont 141 capacités de statut proposées lorsque leur effet est pris en charge ; apprentissage par niveau et version disponible pour chaque espèce. Règles et adaptations détaillées dans le fichier source `COMBAT.md`.
