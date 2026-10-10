# Deploy GitHub Pages

Workflow: [`.github/workflows/nextjs.yml`](../../.github/workflows/nextjs.yml) — build estático Next → pasta `out/` → GitHub Pages.

## Variáveis no CI

- `GITHUB_PAGES=1` — `output: "export"` e `basePath` em `next.config.ts`
- `NEXT_PUBLIC_BASE_PATH=/${{ github.event.repository.name }}` — ex.: `/escudo-mestre-shadowdarkrpg-webapp`

## `.nojekyll`

`public/.nojekyll` é copiado para a raiz do export. Sem ele, `_next/` não publica no Pages.

## Build local (smoke)

```bash
yarn test:run
GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/escudo-mestre-shadowdarkrpg-webapp yarn build
```

## Configuração GitHub (uma vez)

1. **Settings → Pages → Build and deployment:** Source = **GitHub Actions**
2. Push em `master` com workflow presente

URL esperada: `https://ferandomanoelalmeida.github.io/escudo-mestre-shadowdarkrpg-webapp/`

Ver também [PWA e basePath](pwa-e-basepath.md) e skill `escudo-shadowdark-deploy`.
