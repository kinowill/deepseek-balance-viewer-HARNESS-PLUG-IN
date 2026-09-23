# Roadmap — dsh-deepseek-balance (plugin DeepSeek Harness)

> Une ligne par chantier. Mise à jour à chaque session qui change quelque chose.

## En cours

- [ ] Validation visuelle sur le profil `desktop` (redémarrage de
  l'application, badge visible, saisie de la clé, solde affiché).

## À faire (2-3 prochaines tâches)

- [ ] Publication npm (`dsh-deepseek-balance`) + vérification de l'installation
  distante (`dsh plugin --profile web add dsh-deepseek-balance`).
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

## Bloqué
