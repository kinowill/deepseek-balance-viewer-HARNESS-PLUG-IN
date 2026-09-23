# Journal de validation — dsh-deepseek-balance (plugin DeepSeek Harness)

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
  `~/.dsh/profiles/node_modules/dsh-deepseek-balance` (révision après la
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
  servi contient `dsh-deepseek-balance` dans le graphe de boot ;
  `/plugins/??dsh-deepseek-balance/client.js` répond 20 160 octets contenant
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

