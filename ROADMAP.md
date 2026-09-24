# Roadmap — dsh-balance-viewer (plugin DeepSeek Harness)

> Une ligne par chantier. Mise à jour à chaque session qui change quelque chose.

## En cours

- [ ] Publication npm après authentification locale (`npm login`).

## À faire (2-3 prochaines tâches)

- [ ] Vérification de l'installation distante après publication
  (`dsh plugin --profile web add dsh-balance-viewer`).
- [ ] Intervalle de rafraîchissement configurable depuis l'interface (au lieu
  du seul `intervalMs` du patch).
- [ ] Documentation d'installation générique (profil web/headless) dans le README.

## Fait

- [x] v0.1.0 — paquet complet : moitié hôte (service Remote `balance`,
  credentials DSH, polling) et moitié client (badge LED + panneau).
- [x] Validation réelle : test Cordis de la moitié hôte (appel HTTP réel) et
  boot d'une instance du profil web avec bundle client servi par `/plugins`
  (voir `VALIDATION_LOG.md` du 2026-09-23).
- [x] Intégration au profil `desktop` (copie dans `node_modules` +
  `dsh.profile.bundles`, script `install.ps1`).
- [x] Renommage en `dsh-balance-viewer`, migration des deux anciennes copies
  locales et validation de l'idempotence des scripts d'installation.
- [x] Correction du boot client : suppression du montage Remote circulaire,
  contrat RPC testé et deux démarrages desktop à froid sans rapport de crash.
- [x] Correctif exécutable et renommage poussés sur `origin/main`
  (`2bea791`).
- [x] Déclaration du paquet comme dépendance locale du profil desktop afin
  qu'il apparaisse dans le groupe Installed du gestionnaire de plug-ins.
- [x] Correction du rendu vide : `React.createElement` et noms d'icônes
  réellement exportés par Harness, avec test du badge et du panneau.
- [x] Validation visuelle dans Harness : badge « No API key » visible dans le
  pied de la barre latérale et panneau fonctionnel à l'ouverture.
- [x] Conservation et affichage des montants lorsque DeepSeek répond
  `is_available: false`, avec avertissement explicite ; tests automatisés,
  réponse API réelle filtrée et redémarrage desktop validés.
- [x] Confirmation visuelle par l'utilisateur du nouveau rendu dans le panneau
  desktop.

## Bloqué

- Publication npm : session npm non authentifiée (`npm whoami` → `ENEEDAUTH`).
