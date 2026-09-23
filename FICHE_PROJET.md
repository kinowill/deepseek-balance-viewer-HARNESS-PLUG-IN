# Fiche projet — dsh-deepseek-balance (plugin DeepSeek Harness)

> Chargée avec le noyau. Uniquement les spécificités locales ; aucune règle
> générale du protocole ici (elles vivent dans NOYAU.md / PROTOCOLE.md).

- Langue de l'utilisateur : français
- Stack : Node ESM (Cordis 4, Typert), client React via module loader DSH,
  pas d'étape de build ; publication npm + GitHub.
- Commandes :
  - `powershell .\scripts\install.ps1` — installe dans le profil desktop DSH
  - `powershell .\scripts\uninstall.ps1` — retire du profil desktop DSH
  - `npm publish` — publication du paquet (après `npm login`)
- Sources de vérité : `DOCUMENT_MAITRE.md`, `ROADMAP.md`, `VALIDATION_LOG.md`
- Zones sensibles : clé API DeepSeek (jamais dans le repo ni dans les patches ;
  magasin de credentials DSH uniquement) ; fichiers du profil `desktop`
  (`~/.dsh/profiles/desktop/package.json` — sauvegarder avant modification).
- Contraintes de prod : DeepSeek Harness 0.1.x (manifest `dsh.bundle` +
  `dsh.client`), profil `desktop` réservé Electron (CLI `dsh plugin` refusée),
  l'application peut réinstaller/pruner `~/.dsh/profiles/node_modules` lors
  d'une mise à jour → réinstaller via le script après chaque mise à jour DSH.
