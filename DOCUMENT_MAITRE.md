# Document maître — dsh-balance-viewer (plugin DeepSeek Harness)

> Référence opérative du projet. Lisible seul. Mis à jour dans la même
> session dès qu'une action change la vérité du projet.
>
> Repo : https://github.com/kinowill/deepseek-balance-viewer-HARNESS-PLUG-IN
> Clone local : `C:\PROJETS\DeepSeek TopUp Solde Viewer\PLUGIN DEEPSEEK HARNESS`

## REPRISE (10 lignes max)

- **État courant** : v0.1.0 `dsh-balance-viewer` installée dans le profil
  `desktop` ; une réponse DeepSeek valide avec `is_available: false` conserve
  maintenant les montants et affiche un avertissement, au lieu de les masquer.
- **Dernière validation réelle** : 2026-09-24 — vraie clé résolue sans
  exposition, réponse API HTTP 200 (`is_available: false`, une entrée de
  solde), interprétation déployée = `unavailable` avec balance et horodatage ;
  3 tests passent, paquet valide, 5 processus Harness répondants et aucun
  nouveau rapport `web-boot`.
- **Prochaine action** : confirmer visuellement les montants dans le panneau,
  recharger le crédit API côté DeepSeek si l'utilisateur veut rendre le compte
  utilisable, puis publier sur npm après authentification locale.
- **Points durs / blocages** : le profil `desktop` (Electron) refuse la CLI
  `dsh plugin` → intégration par copie physique dans
  `~/.dsh/profiles/node_modules` + dépendance locale + ajout au champ
  `dsh.profile.bundles` ;
  après une mise à jour de DSH, relancer `scripts/install.ps1`. npm n'est pas
  authentifié sur cette machine (`npm whoami` → `ENEEDAUTH`).

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
    `deepseek-balance`, module `dsh-balance-viewer`).
  - `scripts/install.ps1` / `uninstall.ps1` — intégration au profil
    `desktop` de DSH.

## 3. Sources de vérité

1. Ce document.
2. `ROADMAP.md` — fait / en cours / à faire / bloqué.
3. `VALIDATION_LOG.md` — validations réelles.
4. Code effectivement déployé (`~/.dsh/profiles/node_modules/dsh-balance-viewer`
   et profil `desktop`) — gagne en cas de conflit.

## 4. Environnement (faits uniquement, jamais de secrets)

- Où tourne le projet : Windows 11, DeepSeek Harness 0.1.7-alpha.2 (desktop),
  profil `desktop` (`~/.dsh/profiles/desktop`), node 22 (système) / 24 (runtime).
- Commandes utiles :
  - Installer : `powershell .\scripts\install.ps1`
  - Désinstaller : `powershell .\scripts\uninstall.ps1`
  - Vérifier la présence : Plugins → Installed ; état d'exécution dans
    Settings → Built-in plugins ; badge en bas de la barre latérale.
- Accès nécessaires : API DeepSeek (clé stockée dans `~/.dsh/.credentials.yaml`).
- Hors documentation (clés, comptes) : clé API DeepSeek, comptes GitHub/npm —
  jamais dans le repo.

## 5. Décisions

| Date | Contexte | Options | Choix | Pourquoi |
|---|---|---|---|---|
| 2026-09-23 | Hébergement du code | sous-dossier du repo viewer ; repo dédié | repo dédié `deepseek-balance-viewer-HARNESS-PLUG-IN` | séparation Python/Node, releases et issues indépendantes |
| 2026-09-23 | Emplacement local | clone à la racine de `C:\PROJETS` ; dossier du projet viewer | `C:\PROJETS\DeepSeek TopUp Solde Viewer\PLUGIN DEEPSEEK HARNESS` | protocole, code et historique Git réunis dans le dossier de travail demandé |
| 2026-09-23 | Distribution | GitHub seul ; GitHub + npm | GitHub + npm (paquet `dsh-balance-viewer`) | installation `dsh plugin add` standard |
| 2026-09-23 | Stockage de la clé API | champ de config ; magasin credentials DSH | credentials DSH, référence `DEEPSEEK_BALANCE_API_KEY` | jamais de secret dans les fichiers de config ni le repo |
| 2026-09-23 | Intégration profil desktop | pnpm dans le profil ; copie physique | copie physique + dépendance locale `file:` + `dsh.profile.bundles` | la CLI `dsh` refuse le profil `desktop`; la dépendance est nécessaire pour que le gestionnaire classe le paquet dans Installed |
| 2026-09-23 | Appels client du service `balance` | monter une contribution Remote tierce ; appeler le transport RPC natif | transport `connection.rpc.call("/api", "balance/*")` | le montage Remote pendant l'activation créait un interblocage et laissait le plug-in en `loading` |
| 2026-09-23 | Création des éléments React | `jsxRuntime.jsx` ; `React.createElement` | `React.createElement` | le code fournit les enfants en arguments positionnels ; avec `jsx()`, ils devenaient des clés et le badge était un conteneur vide |
| 2026-09-24 | API répond `is_available: false` avec des montants | masquer les montants ; les afficher avec avertissement | afficher total/offert/rechargé, LED orange et avertissement | le statut d'utilisabilité et les valeurs de solde sont deux informations distinctes fournies ensemble par l'API |

## 6. État courant

1. **Stable** : code v0.1.0 testé côté hôte et contrat client ; scripts de
   migration validés, profil `desktop` aligné (dépendance + bundle) et boots
   desktop réussis sans nouveau rapport de crash.
2. **En cours** : confirmation visuelle du nouveau rendu et publication npm.
3. **À vérifier** : rendu du solde indisponible dans le panneau ; publication
   npm après `npm login` ; comportement d'un `pnpm install` lancé par
   l'application (prune éventuelle de la copie — réinstallation via script).
