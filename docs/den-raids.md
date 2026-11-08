# Antre — raids aléatoires à quatre

L’ancienne progression par gardiens est remplacée par un boss aléatoire, fixe jusqu’au prochain raid terminé (victoire ou défaite). Avant le combat, seuls ses types sont visibles. Les anciennes sauvegardes et récompenses restent conservées ; denFloor ne gouverne plus ce mode.

Chaque dresseur choisit un seul Pokémon obtenu, indépendamment de son équipe de la Tour. Les places libres sont remplies par des bots au lancement. Le niveau du boss et des bots suit la moyenne des partenaires humains ; le boss a six fois ses PV habituels et une seule action ciblée par tour. Les bots emploient l’IA stratégique existante. Les partenaires K.O. sont expulsés individuellement par une faille violette et les dresseurs peuvent observer leurs alliés terminer. Un dresseur expulsé ne reçoit pas de capture, même si les alliés remportent le raid.

Les salons par code et les invitations du carnet d’amis utilisent PeerJS. L’hôte conserve l’autorité sur les tours. Les déconnexions d’invités sont remplacées par des bots ; la déconnexion de l’hôte ferme le raid. Le bouton de fin conserve le salon pour le prochain combat.

Après une victoire, chaque participant humain encore en combat effectue un tirage personnel à 5 %. Seul le boss chromatique est ajouté à sa collection, avec IV aléatoires et conservation des meilleurs IV en cas de doublon. Les bots n’ont aucun tirage. Il n’y a aucun Pokémon normal reçu, aucune récompense d’étage ni tirage après défaite/abandon. Les résultats et statistiques sont sauvegardés par identifiant de raid, sous verrou navigateur pour éviter les doubles gains et les relances du tirage. Comme les autres modes du jeu, la sauvegarde reste locale ; ceci n’est pas un système de récompenses anti-triche côté serveur.

Les premières obtentions légendaires conservent leur cinématique. Les préférences, le boss suivant, les résultats et les statistiques survivent à la migration/recharge de la sauvegarde.

Validation : node raid-check.cjs (frontière exacte de 5 %, indépendance, persistance, absence de gains bots/défaite, sélection, quatre contre un, mobile, deux contextes PeerJS réels et reprise par bot), node pokeworld-check.cjs et node social-profile-check.cjs.


## Mise en scène et limite du raid

L’introduction cache entièrement le champ de bataille jusqu’à la révélation. Le message, la couleur, la densité de particules et la puissance de lumière dépendent de la rareté ; le nom apparaît ensuite. Les animations réduites raccourcissent les scènes et atténuent les flashes. Le bouton Passer termine l’animation, et une sortie de mode annule son animation et ses callbacks.

La faille se ferme après 20 tours résolus, côté hôte. Une victoire au vingtième tour est prioritaire sur cette fermeture. Le HUD ne présente jamais un tour 21 jouable. Les règles sont sérialisées avec les tours pour tous les invités.

Une capture chromatique personnelle montre le partenaire face au boss chromatique, les étincelles, le lancer de Poké Ball, l’absorption, les secousses et la confirmation. Le gain est enregistré avant l’animation pour résister aux rechargements ; passer la scène ne relance pas le tirage. Les cinématiques légendaires de première obtention restent disponibles.

La faille des quatre : boucle originale de 40 secondes à 144 BPM, percussions, ostinato de cordes, cuivres et basse synthétisés localement. Le morceau est préchargé et accompagne l’introduction et le combat. Aucun extrait musical tiers.

Vérifications supplémentaires : node raid-presentation-check.cjs et node raid-expulsion-network-check.cjs (dont un hôte K.O. qui garde son invité connecté et actif, avec résultat de capture individuel).
