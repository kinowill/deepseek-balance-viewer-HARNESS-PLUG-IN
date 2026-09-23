# Journal de validation — dsh-balance-viewer (plugin DeepSeek Harness)

> Une entrée par validation réelle. Chaque entrée consigne l'environnement
> exact et l'état testé, pour qu'un repreneur puisse vérifier sans la session.

## 2026-09-23 — Vérification en lecture seule du mécanisme de plugins DSH

- **Environnement** : DeepSeek Harness 0.1.7-alpha.2 (profil desktop),
  Windows 11, inspection des paquets publiés `0.1.5-rc.3` dans
  `~/.dsh/profiles/node_modules/@deepseek-ai`, protocole MAITRE noyau v1.0.0.
- **État testé** : avant tout code du plugin ; lecture de
  `dsh-app-boot`, `cordis-plugin-loader`, `dsh-client-modules`,
  `dsh-typert-protocol`, `dsh-api-gateway`, `dsh-credentials`, profil
  `desktop` réel.
- **Attendu** : confirmer que le plugin peut être chargé sans rebuild du
  frontend (bundle client servi à la volée par `/plugins`).
- **Observé** : conforme — le bundle client est lu depuis
  `exports["./client"]` du manifest du paquet (résolution par remontée au
  `package.json`), la Gateway lit les marqueurs `remoteMethods` en mode
  source, les patches de bundle sont des listes `insert`, et le fiber
  instancie les classes avec `(ctx, config)`.
- **Statut** : réussi.
- **Preuve** : lectures des fichiers listés ci-dessus ; `~/.dsh/plugins/`
  n'est référencé par aucun code (le squelette créé à la main y est inutile).
- **Limites** : vérification statique uniquement, aucun chargement réel.
- **Prochaine action** : monter le plugin et valider en conditions réelles.

## 2026-09-23 — Test de la moitié hôte dans un vrai contexte Cordis

- **Environnement** : node v22.22.2, paquets DSH 0.1.5-rc.3 du profil,
  contexte `@deepseek-ai/cordis` réel, credentials simulés en mémoire,
  réseau réel vers `api.deepseek.com` ; protocole MAITRE noyau v1.0.0.
- **État testé** : `lib/index.js` copié dans
  `~/.dsh/profiles/node_modules/dsh-balance-viewer` (révision après la
  correction des champs privés `#doRefresh` → `_doRefresh`).
- **Attendu** : montage du service `balance`, marqueurs Remote lisibles par
  la Gateway, machine à états du solde, clé stockée via le service
  credentials, arrêt propre.
- **Observé** : service monté (nom `balance`), `remoteMethods` =
  get, refresh, setApiKey, removeApiKey, describeKey ; `get()` →
  `missing-key` ; `setApiKey('sk-invalid-test-key')` + appel HTTP réel →
  `invalid-key` (401 géré) ; `describeKey()` → `{configured: true, writable:
  true}` ; `removeApiKey()` → `missing-key` ; `dispose()` propre.
- **Statut** : réussi.
- **Preuve** : sortie du test node (hors secrets ; clé factice).
- **Limites** : credentials simulés (le magasin réel DSH n'est pas monté dans
  ce test) ; le rendu React n'est pas couvert.
- **Prochaine action** : boot d'une instance réelle pour valider la chaîne
  client (découverte du manifest `dsh.client`, service `/plugins`).

## 2026-09-23 — Boot réel du profil web avec le plugin (instance séparée)

- **Environnement** : CLI `dsh` du harnais (`@deepseek-ai/dsh/lib/bin.js`),
  profil `web` sur le port 8099, plugin installé dans
  `~/.dsh/profiles/web/node_modules` + `dsh.profile.bundles` ; protocole
  MAITRE noyau v1.0.0.
- **État testé** : `lib/index.js` après retrait de `logger` de la liste
  `inject` (c'est un accesseur, pas un service) ; `lib/client.js` v1.
- **Attendu** : composition du patch de bundle, activation du plugin,
  découverte du manifest `dsh.client`, bundle servi sur `/plugins`.
- **Observé** : premier boot échoué avec « pending (waiting for service:
  logger) » (diagnostic exact), corrigé ; second boot sans erreur. L'index
  servi contient `dsh-balance-viewer` dans le graphe de boot ;
  `/plugins/??dsh-balance-viewer/client.js` répond 20 160 octets contenant
  l'enregistrement `sidebar.footer.action`, le CSS du badge et l'usage de
  `remote.balance`.
- **Statut** : réussi.
- **Preuve** : sortie CLI `dsh web` + réponses HTTP (contenus vérifiés par
  motif).
- **Limites** : rendu visuel du badge non vérifié (pas de navigateur) ;
  l'instance de test a été arrêtée et le profil web nettoyé (manifeste
  restauré).
- **Prochaine action** : redémarrage de l'application desktop (profil
  `desktop`, plugin déjà installé) et validation visuelle du badge ; saisie
  de la clé API dans le panneau.

## 2026-09-23 — Renommage, migration et installation desktop

- **Environnement** : Windows 11, Windows PowerShell 5.1, node v22.22.2,
  profil `desktop` réel et fixture isolée reproduisant les deux anciens
  emplacements du paquet.
- **État testé** : renommage npm vers `dsh-balance-viewer`, scripts
  `install.ps1` / `uninstall.ps1`, anciennes copies dans les `node_modules`
  hoisté et propre au profil desktop.
- **Attendu** : retirer les deux copies `dsh-deepseek-balance`, installer le
  nouveau paquet, remplacer l'entrée du manifeste, rester idempotent et
  désinstaller les deux noms proprement.
- **Observé** : la fixture de migration passe. Sur le profil réel, un premier
  passage a révélé que Windows PowerShell 5.1 scalaire ne fournissait pas
  `.Count` pour une différence unique de `Compare-Object`; le résultat a été
  forcé en tableau, puis l'installation réelle et un second passage ont
  réussi. Le manifeste contient exactement une entrée `dsh-balance-viewer` et
  les anciennes copies ont disparu.
- **Contrôles complémentaires** : JavaScript (`node --check`), parseur
  PowerShell, JSON, UTF-8 strict, absence de marqueurs de mojibake et
  `npm pack --dry-run --json` réussis. Le nom npm est disponible ; publication
  impossible sans authentification locale (`npm whoami` → `ENEEDAUTH`).
- **Statut** : réussi pour le repo et l'installation locale ; rendu desktop
  non vérifié tant que l'application n'a pas été redémarrée.
- **Prochaine action** : redémarrer DeepSeek Harness et vérifier le badge,
  puis s'authentifier sur npm pour publier la v0.1.0.

## 2026-09-23 — Diagnostic et correction du boot desktop

- **Environnement** : DeepSeek Harness 0.1.7-alpha.2, profil `desktop` réel,
  Windows 11, runtime Electron de l'application.
- **État testé** : activation de la moitié client après installation de
  `dsh-balance-viewer` dans le profil réel.
- **Attendu** : fin d'activation du plug-in, fenêtre principale disponible et
  aucun nouveau rapport de crash `web-boot`.
- **Observé avant correction** : premier rapport « pending (waiting for
  service: remote.balance) ». Après ajout d'une contribution Remote côté
  client, le plug-in restait en `loading`; une instrumentation temporaire a
  localisé l'attente dans `await ctx.remote.$mount(...)`.
- **Cause racine** : interblocage d'activation — le plug-in attendait le
  montage d'un service Remote pendant que le boot attendait la fin de son
  activation.
- **Correction** : appels `balance/*` via le transport natif déjà actif,
  `connection.rpc.call("/api", ...)`, sans créer de service client pendant le
  boot. L'instrumentation temporaire a été retirée.
- **Contrôles** : test contractuel des routes et arguments RPC réussi ;
  `node --check` sur les deux modules ; deux démarrages à froid successifs,
  chacun avec cinq processus répondants et une fenêtre principale normale ;
  aucun nouveau fichier dans le dossier des rapports après 20 secondes sur
  chacun des deux lancements.
- **Statut** : réussi pour l'activation et la stabilité de démarrage desktop.
- **Git** : correctif exécutable et renommage commités puis poussés sur
  `origin/main` (`2bea791`).
- **Limites** : l'affichage du badge et le solde avec une vraie clé restent à
  confirmer visuellement ; aucune clé ni valeur sensible n'a été lue.
- **Prochaine action** : confirmer le rendu dans la barre latérale, puis
  publier la v0.1.0 sur npm après `npm login`.

## 2026-09-23 — Référencement dans le gestionnaire de plug-ins desktop

- **Observation** : le plug-in démarrait sans crash mais n'apparaissait pas
  dans la page Plugins. Le profil le sélectionnait dans
  `dsh.profile.bundles` et sa copie physique existait, tandis que
  `dependencies` restait vide.
- **Cause racine** : le gestionnaire de Harness 0.1.7-alpha.2 considère un
  bundle comme installé uniquement si son nom figure dans les dépendances du
  profil ; un bundle seulement sélectionné est filtré de la liste.
- **Correction** : `install.ps1` ajoute une dépendance locale `file:` vers le
  dépôt et active le bundle ; `uninstall.ps1` retire les deux déclarations.
- **Fixture** : migration de l'ancien nom réussie, dépendance locale créée,
  second passage idempotent et désinstallation complète réussie sous Windows
  PowerShell 5.1.
- **Profil réel** : une dépendance `dsh-balance-viewer` et une seule entrée de
  bundle sont présentes ; aucun ancien nom ne subsiste. Les quatre fichiers
  exécutables déployés ont les mêmes empreintes SHA-256 que le repo.
- **Boot réel** : cinq processus répondants après 20 secondes, fenêtre
  principale disponible et aucun nouveau rapport `web-boot`.
- **Limite** : confirmation visuelle de la carte Installed et du badge à faire
  dans l'interface ouverte.

## 2026-09-23 — Correction du badge invisible

- **Reproduction** : le plug-in était actif sans crash, mais la barre latérale
  ne montrait aucun badge. Un test minimal du composant a confirmé que sa
  racine ne contenait aucun enfant.
- **Cause racine** : `jsxRuntime.jsx` était appelé avec la signature de
  `React.createElement`. Les enfants positionnels étaient interprétés comme
  des clés JSX et ignorés, produisant un `div` vide. Quatre noms d'icônes
  suffixés `16` n'existaient par ailleurs pas dans les primitives de Harness.
- **Correction** : utilisation de `React.createElement` et remplacement par
  les icônes `*OutlineRegular` réellement exportées.
- **Contrôles** : le test isolé rend maintenant le bouton fermé, le panneau
  ouvert et toutes ses icônes ; l'appel RPC initial est conservé. Le paquet a
  été réinstallé puis Harness a redémarré avec cinq processus répondants et
  aucun nouveau rapport de crash après 20 secondes.
- **Validation visuelle** : badge orange « No API key » visible au-dessus du
  compte dans le pied de la barre latérale ; panneau « DeepSeek balance »
  ouvert avec état, rafraîchissement, champ de clé masqué et action Save.
- **Statut** : réussi pour le rendu sans clé. Le solde réel reste à tester
  avec une clé API fournie par l'utilisateur.

