# Antre — raids aléatoires à quatre

L’ancienne progression par gardiens est remplacée par un boss aléatoire, fixe jusqu’au prochain raid terminé (victoire ou défaite). Avant le combat, seuls ses types sont visibles. Les anciennes sauvegardes et récompenses restent conservées ; denFloor ne gouverne plus ce mode.

Chaque dresseur choisit un seul Pokémon obtenu, indépendamment de son équipe de la Tour. Les places libres sont remplies par des bots au lancement. Le niveau du boss et des bots suit la moyenne des partenaires humains ; le boss a six fois ses PV habituels et une seule action ciblée par tour. Les bots emploient l’IA stratégique existante. Les humains K.O. peuvent regarder leurs alliés terminer.

Les salons par code et les invitations du carnet d’amis utilisent PeerJS. L’hôte conserve l’autorité sur les tours. Les déconnexions d’invités sont remplacées par des bots ; la déconnexion de l’hôte ferme le raid. Le bouton de fin conserve le salon pour le prochain combat.

Après une victoire, chaque participant humain effectue un tirage personnel à 5 %. Seul le boss chromatique est ajouté à sa collection, avec IV aléatoires et conservation des meilleurs IV en cas de doublon. Les bots n’ont aucun tirage. Il n’y a aucun Pokémon normal reçu, aucune récompense d’étage ni tirage après défaite/abandon. Les résultats et statistiques sont sauvegardés par identifiant de raid, sous verrou navigateur pour éviter les doubles gains et les relances du tirage. Comme les autres modes du jeu, la sauvegarde reste locale ; ceci n’est pas un système de récompenses anti-triche côté serveur.

Les premières obtentions légendaires conservent leur cinématique. Les préférences, le boss suivant, les résultats et les statistiques survivent à la migration/recharge de la sauvegarde.

Validation : node raid-check.cjs (frontière exacte de 5 %, indépendance, persistance, absence de gains bots/défaite, sélection, quatre contre un, mobile, deux contextes PeerJS réels et reprise par bot), node pokeworld-check.cjs et node social-profile-check.cjs.
