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

### Repositório privado

No plano Free, **GitHub Pages não existe** em repo privado (`configure-pages` devolve 404). Torne o repo **público** (como o Escudo OPRPG) ou use plano com Pages em privado.

### «Get Pages site failed» com repo já público

Só tornar o repo público **não** activa o Pages. Confirme em **Settings → Pages** que a origem é **GitHub Actions** (ou API `POST .../pages` com `build_type=workflow`). Enquanto `has_pages` for falso na API, o passo **Setup Pages** falha.

### PWA no Android: «Não foi possível abrir o aplicativo»

O workflow corre `yarn verify:pwa-github-pages` após o build — o `out/sw.js` deployado deve ter precache com prefixo `/escudo-mestre-shadowdarkrpg-webapp/`, não `/data/` na raiz do `github.io`. Após deploy, confira no DevTools (Application → Manifest / Service Workers) ou com `curl …/sw.js | grep '/data/'` (não deve listar `url:"/data/`). Utilizador: [PWA e offline (utilizador)](../usuario/pwa-e-offline.md#não-foi-possível-abrir-o-aplicativo-android).

Ver também [PWA e basePath](pwa-e-basepath.md) e skill `escudo-shadowdark-deploy`.
