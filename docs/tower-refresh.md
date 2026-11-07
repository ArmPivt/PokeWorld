# Tour et chargement des légendaires

Tour verticale de 50 étages avec combat final à six Pokémon, prochain dresseur et récompenses visibles, portes futures anonymes. Les anciens combats sont rejouables sans ticket, poussière, bonbon ni XP supplémentaire. Le registre des premières victoires migre les anciens étages déjà récompensés et les gains sont protégés entre onglets par Web Locks. La progression existante est conservée.

Référence de parcours : https://cookierunkingdom.fandom.com/wiki/Tower_of_Sweet_Chaos . Interface, décor CSS et règles PokéWorld créés localement, aucun asset Cookie Run copié.

Le lecteur ne présente plus les affiches révélatrices. Toute attente initiale ou remise en mémoire tampon masque entièrement la vidéo ; elle est dévoilée après une image effectivement décodée. Deux premières vidéos légendaires sont préchargées pendant l’invocation puis leurs éléments vidéo réutilisés. La durée réseau ne peut être supprimée mais ne révèle plus le Pokémon. Lecture manuelle, pause, reprise, échec et rencontres en attente restent pris en charge.

Mascottes : Kyogre (Conquête), Dracaufeu (tour), Giratina (Antre), Jungko (survie), Pikachu (Pokéclick), Lucario (combats), Hoopa (invocations). Idle de Jungko et Hoopa conservés localement pour éviter une animation dépendante du réseau : provenance et SHA-256 dans dist/assets/pmd/mode-mascot-sources.json ; crédits des artistes dans chaque dossier PMD. Animations réduites respectées.

Validation : test:tower-refresh, test:tower-refresh-browser, lecteur vidéo, invocations ×10, chronologie des combats et raid coopératif.
