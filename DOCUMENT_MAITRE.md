# Document maître — dsh-deepseek-balance (plugin DeepSeek Harness)

> Référence opérative du projet. Lisible seul. Mis à jour dans la même
> session dès qu'une action change la vérité du projet.
>
> Repo : https://github.com/kinowill/deepseek-balance-viewer-HARNESS-PLUG-IN
> Clone local : `C:\PROJETS\deepseek-balance-viewer-HARNESS-PLUG-IN`

## REPRISE (10 lignes max)

- **État courant** : v0.1.0 écrite et validée en partie — moitié hôte
  testée dans un vrai contexte Cordis (appel HTTP réel vers l'API DeepSeek),
  chaîne client validée par le boot d'une instance du profil web (bundle
  servi par `/plugins`). Intégrée au profil `desktop` (copie + bundles).
  Reste la validation visuelle après redémarrage de l'application.
- **Dernière validation réelle** : 2026-09-23 — boot réel du profil web avec
  le plugin (voir `VALIDATION_LOG.md`).
- **Prochaine action** : redémarrer DeepSeek Harness (desktop), vérifier le
  badge en bas de la barre latérale, saisir la clé API dans le panneau ;
  puis commits/push GitHub et publication npm.
- **Points durs / blocages** : le profil `desktop` (Electron) refuse la CLI
  `dsh plugin` → intégration par copie physique dans
  `~/.dsh/profiles/node_modules` + ajout au champ `dsh.profile.bundles` ;
  après une mise à jour de DSH, relancer `scripts/install.ps1`.

## 1. But du projet

Afficher le solde DeepSeek (API `https://api.deepseek.com/user/balance`)
directement dans l'interface de DeepSeek Harness, sous forme d'un badge
permanent dans le pied de la barre latérale : montant total, LED d'état
(vert = OK, orange = clé manquante, rouge = erreur), panneau dépliant avec
détails (offert / rechargé), rafraîchissement et gestion de la clé API —
équivalent intégré du widget Python `deepseek-balance-viewer`.

## 2. Stack et structure

- Stack : Node ESM (Cordis / Typert / DSH 0.1.x), React côté client via le
  module loader DSH (`window.__ModuleLoader__.load`), sans étape de build.
- Dossiers clés :
  - `lib/index.js` — moitié hôte : classe `BalanceService` (Remote Typert
    `balance`), polling, credentials DSH (`DEEPSEEK_BALANCE_API_KEY`).
  - `lib/client.js` — moitié client : bundle servi par `/plugins`,
    enregistrement dans le slot `sidebar.footer.action`.
  - `cordis.patch.yml` — patch de bundle : une entrée `insert` (id
    `deepseek-balance`, module `dsh-deepseek-balance`).
  - `scripts/install.ps1` / `uninstall.ps1` — intégration au profil
    `desktop` de DSH.

## 3. Sources de vérité

1. Ce document.
2. `ROADMAP.md` — fait / en cours / à faire / bloqué.
3. `VALIDATION_LOG.md` — validations réelles.
4. Code effectivement déployé (`~/.dsh/profiles/node_modules/dsh-deepseek-balance`
   et profil `desktop`) — gagne en cas de conflit.

## 4. Environnement (faits uniquement, jamais de secrets)

- Où tourne le projet : Windows 11, DeepSeek Harness 0.1.7-alpha.2 (desktop),
  profil `desktop` (`~/.dsh/profiles/desktop`), node 22 (système) / 24 (runtime).
- Commandes utiles :
  - Installer : `powershell .\scripts\install.ps1`
  - Désinstaller : `powershell .\scripts\uninstall.ps1`
  - Vérifier la présence : Settings → Plugins (inventaire) + badge en bas de
    la barre latérale.
- Accès nécessaires : API DeepSeek (clé stockée dans `~/.dsh/.credentials.yaml`).
- Hors documentation (clés, comptes) : clé API DeepSeek, comptes GitHub/npm —
  jamais dans le repo.

## 5. Décisions

| Date | Contexte | Options | Choix | Pourquoi |
|---|---|---|---|---|
| 2026-09-23 | Hébergement du code | sous-dossier du repo viewer ; repo dédié | repo dédié `deepseek-balance-viewer-HARNESS-PLUG-IN` | séparation Python/Node, releases et issues indépendantes |
| 2026-09-23 | Distribution | GitHub seul ; GitHub + npm | GitHub + npm (paquet `dsh-deepseek-balance`) | installation `dsh plugin add` standard |
| 2026-09-23 | Stockage de la clé API | champ de config ; magasin credentials DSH | credentials DSH, référence `DEEPSEEK_BALANCE_API_KEY` | jamais de secret dans les fichiers de config ni le repo |
| 2026-09-23 | Intégration profil desktop | pnpm dans le profil ; copie physique | copie physique + `dsh.profile.bundles` | la CLI `dsh` refuse le profil `desktop` (réservé Electron) |

## 6. État courant

1. **Stable** : code v0.1.0 écrit, testé côté hôte (Cordis + HTTP réel) et
   côté chaîne client (boot web + `/plugins`), intégré au profil `desktop`.
2. **En cours** : commits git initiaux et push GitHub ; publication npm.
3. **À vérifier** : affichage réel du badge dans l'application desktop après
   redémarrage ; comportement d'un `pnpm install` lancé par l'application
   (prune éventuelle de la copie — réinstallation via script).
