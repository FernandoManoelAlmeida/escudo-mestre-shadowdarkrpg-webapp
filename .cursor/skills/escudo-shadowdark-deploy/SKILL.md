---
name: escudo-shadowdark-deploy
description: >-
  Publica o Escudo Shadowdark no GitHub Pages (GITHUB_PAGES=1, basePath, SW, .nojekyll).
---

# escudo-shadowdark-deploy

Antes do push: skill **`escudo-shadowdark-pages-pre-entrega`** (`yarn build:pages:ci-simulate`).

## Build

```bash
yarn build:pages:ci-simulate
```

CI: [`.github/workflows/nextjs.yml`](../../.github/workflows/nextjs.yml) — push `master` (build + verify PWA).

## Checklist

1. `yarn test:run` OK
2. `public/.nojekyll` presente
3. Push `master` → workflow Pages
4. Verificar SW e `version.json` após deploy

## Troubleshooting

- SW antigo: unregister + limpar cache
- `basePath` = nome do repo GitHub
- Após migrate: novo deploy (cache `/data/`)

Docs: [deploy-github-pages.md](../../docs/desenvolvimento/deploy-github-pages.md), [pwa-e-basepath.md](../../docs/desenvolvimento/pwa-e-basepath.md)
