# Musiques des menus et carnet de l’Antre

Sept compositions originales distinctes accompagnent les menus : Les marches de braise (tour), Sous la pierre ancienne (Antre), Le départ des éclaireurs (survie), Face à ton rival (combats), Les anneaux de Hoopa (portails), Le conseil des factions (Conquête), Les petits métiers du camp (Pokéclick). Sources et partitions déterministes : compose-menu-music.cjs. Boucles PCM mono 22 050 Hz, volumes et pause à l’onglet masqué conservés. Les musiques des combats, de la survie en partie et des invocations restent spécifiques à ces séquences. Aucune musique officielle ou tierce copiée.

L’entrée de grotte et ses pierres de types sont un décor CSS original, sans téléchargement tiers. Le carnet présente le prochain gardien et les rencontres déjà remportées, avec pagination des plus anciennes. Chaque rencontre est identifiée par son numéro d’Antre, son espèce et son niveau : les cycles ultérieurs sont des rencontres de difficulté supérieure.

La progression denFloor est le prochain gardien inédit. Les rencontres inférieures sont déjà récompensées, y compris dans les anciennes sauvegardes. Rejouer ne donne ni tickets, bonbons, poussières ni XP. La première victoire est enregistrée sous verrou entre onglets et conserve le mode raid. Le retour et le rechargement gardent le carnet. Une rencontre d’un hôte plus avancé ne donne pas de récompense de progression à un invité qui n’a pas encore atteint cette rencontre.

Tests : test:den-menus (sept musiques uniques, types, première victoire, rejeu sans gain, rechargement, mobile), raid-network-check.cjs, tower-refresh-check.cjs, tower-refresh-browser-check.cjs, ui-refresh-browser-check.cjs, cinema-check.cjs.
