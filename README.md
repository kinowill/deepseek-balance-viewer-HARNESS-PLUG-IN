# dsh-balance-viewer

Plugin **DeepSeek Harness** : votre solde DeepSeek en direct, directement dans
l'interface.

- 💰 **Badge permanent** en bas de la barre latérale : montant total + LED
  d'état (vert = OK, orange = clé manquante, rouge = erreur).
- 📊 **Panneau dépliant** : détails offert / rechargé, rafraîchissement manuel,
  mise à jour automatique toutes les 60 s.
- 🔑 **Clé API** gérée depuis le panneau, stockée dans le magasin de
  credentials de DeepSeek Harness (`~/.dsh/.credentials.yaml`, référence
  `DEEPSEEK_BALANCE_API_KEY`) — **jamais** dans un fichier de configuration,
  un patch ou ce dépôt.

L'API interrogée est `https://api.deepseek.com/user/balance`, la même que le
widget Python [deepseek-balance-viewer](https://github.com/kinowill/deepseek-balance-viewer).

## Installation

### Profils web / headless / personnalisés

```sh
# depuis npm (recommandé)
dsh plugin --profile web add dsh-balance-viewer

# depuis GitHub
dsh plugin --profile web add github:kinowill/deepseek-balance-viewer-HARNESS-PLUG-IN
```

Le paquet déclare `dsh.bundle`, donc `dsh plugin` l'ajoute automatiquement à
`dsh.profile.bundles`.

### Profil desktop (application Electron)

La CLI refuse de gérer le profil `desktop` (réservé). Utilisez le script :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
# puis redémarrez DeepSeek Harness
```

Désinstallation : `powershell -ExecutionPolicy Bypass -File .\scripts\uninstall.ps1`

> ⚠️ Après une mise à jour de DeepSeek Harness, l'application peut réinstaller
> ses dépendances et retirer la copie du plugin : relancez `install.ps1`.

## Configuration

| Champ | Défaut | Signification |
|---|---:|---|
| `intervalMs` | `60000` | Intervalle de rafraîchissement côté hôte (min. 10 s) |

Surchargez-le dans le `cordis.patch.yml` du profil :

```yaml
- id: deepseek-balance
  config:
    intervalMs: 30000
```

La clé API se configure dans le panneau du badge (ou via le service de
credentials DSH sous la référence `DEEPSEEK_BALANCE_API_KEY`).

## Architecture

- `lib/index.js` — moitié hôte : service Cordis/Typert Remote `balance`
  (`get`, `refresh`, `setApiKey`, `removeApiKey`, `describeKey`), polling,
  credentials DSH.
- `lib/client.js` — moitié cliente : bundle servi à la volée par le système de
  modules client DSH (`/plugins`), enregistré dans le slot
  `sidebar.footer.action`. Aucune étape de build.
- `cordis.patch.yml` — patch de bundle (une entrée `insert`).

## Sécurité

La clé API ne transite que du panneau vers le magasin de credentials, puis du
magasin vers l'API DeepSeek. Elle n'apparaît ni dans les journaux, ni dans les
fichiers de configuration, ni dans ce dépôt. Aucune autre donnée n'est
envoyée à un tiers.

## Licence

MIT — voir [LICENSE](LICENSE).

Projet suivi selon le protocole MAITRE :
[DOCUMENT_MAITRE.md](DOCUMENT_MAITRE.md) · [ROADMAP.md](ROADMAP.md) ·
[VALIDATION_LOG.md](VALIDATION_LOG.md).
