---
name: escudo-shadowdark-pages-pre-entrega
description: >-
  Gate antes de finalizar entrega no Escudo Shadowdark: testes + simulação CI
  GitHub Pages (PWA, sw.js, basePath). Use ao concluir tarefa, antes de
  commit/push, sync repos, deploy Pages, ou após alterar next.config, workflow,
  public/, PWA ou scripts de build.
---

# escudo-shadowdark-pages-pre-entrega

Correr **antes** de dar a entrega por pronta para GitHub Pages. Deploy: skill `escudo-shadowdark-deploy`.

## Quando aplicar

Alterações em `app/`, `components/`, `lib/`, `public/`, `next.config.ts`, `.github/workflows/`, scripts de build/migrate que afectem o bundle ou o PWA.

## Fluxo (obrigatório)

1. **cwd** = raiz de `escudo-mestre-shadowdarkrpg-webapp`.
2. `yarn test:run` — falhou → corrigir.
3. `yarn build:pages:ci-simulate` — replica CI (limpa `.next`/artefactos PWA, build Pages, `verify:pwa-github-pages`).
4. Opcional (release grande ou pedido): `yarn test:pages-ci` (`RUN_PAGES_CI=1`, ~15 min).
5. Resumir: verify OK, `out/sw.js`, precache com prefixo `/escudo-mestre-shadowdarkrpg-webapp/` (sem `url:"/data/` na raiz do `github.io`).
6. Commit/push só com pedido explícito do utilizador.

## Linux (runner ubuntu)

```bash
docker run --rm -v "$PWD":/app -w /app node:20-bookworm bash scripts/simulate-github-pages-ci.sh
```

## Referências

- [deploy-github-pages.md](../../docs/desenvolvimento/deploy-github-pages.md)
- [build-e-testes.md](../../docs/desenvolvimento/build-e-testes.md)
- [pwa-e-basepath.md](../../docs/desenvolvimento/pwa-e-basepath.md)
