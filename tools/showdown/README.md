# Données et moteur Showdown

Dépendances de génération figées : @pkmn/sim 0.10.15 et esbuild 0.28.2, avec pnpm-lock.yaml. Le navigateur ne contacte pas un serveur Showdown ; le moteur compilé est embarqué.

Depuis ce dossier : `pnpm install --ignore-scripts`, puis `node sync-showdown.cjs ../..`.

Le générateur synchronise toutes les capacités standard, les niveaux, CT/tuteurs et noms canoniques des espèces et talents. Il compile aussi le moteur navigateur en conservant les noms de classes, indispensables à la sérialisation native des combats. Les champs runtime (PP restants, effets, statuts, actions légales) ne sont jamais issus des descriptions textuelles.

fr-moves.json est un instantané des noms et textes français issus de PokeAPI/data/v2/csv (move_names.csv et move_flavor_text.csv), conservé pour une régénération stable. Les statistiques et effets proviennent de Showdown. Les empreintes du moteur et des textes figurent dans dist/client/data/showdown-sources.json.

Licences des bibliothèques redistribuées : dist/client/licenses/showdown. Les adaptations PokéWorld se trouvent dans showdown-engine.mjs, move-learning.mjs et les contrôleurs de jeu ; ne pas modifier directement le bundle minifié.
