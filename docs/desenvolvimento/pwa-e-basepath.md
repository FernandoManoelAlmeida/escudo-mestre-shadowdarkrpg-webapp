# PWA e basePath

## `NEXT_PUBLIC_BASE_PATH` e `assetUrl`

[`lib/basePath.ts`](../../lib/basePath.ts) exporta `assetUrl(path)`:

- Concatena `process.env.NEXT_PUBLIC_BASE_PATH` ao caminho (ex.: `/repo/icons/...`).
- Usado em `layout.tsx` (ícones), `UpdateBanner`, fetches versionados, etc.

Em desenvolvimento local **sem** subpath, a variável fica vazia e os caminhos são absolutos à raiz (`/data/...`).

## Instalar no telemóvel (paridade Escudo OPRPG)

- Use **produção em HTTPS** com o **basePath completo** (GitHub Pages: `https://<user>.github.io/escudo-mestre-shadowdarkrpg-webapp/`).
- **`yarn dev` não instala PWA completa** — o plugin e o registo do service worker estão desactivados; o Chrome pode criar só um **atalho** (web view com barra de URL).
- Android: menu → **Instalar aplicação** (ou ícone na barra) só quando manifest + SW estão válidos.
- iOS: **Safari → Partilhar → Ecrã inicial** (Chrome no iOS não equivale ao WebAPK do Android).

Checklist após deploy:

1. `…/manifest.webmanifest` → 200, `display: standalone`, ícones PNG 192/512.
2. `…/sw.js` → 200; DevTools → Service Workers → *activated*, scope `…/escudo-mestre-shadowdarkrpg-webapp/`.
3. `…/.nojekyll` → 200 (sem isto, `_next/` não publica no Pages).

Debug de registo falhado: build com `NEXT_PUBLIC_DEBUG_PWA=1` e ver consola `[PWA] Falha ao registar service worker`.

## Service worker

- O plugin **`@ducanh2912/next-pwa`** (`next.config.ts`) gera `public/sw.js` no build, com `scope` igual ao `basePath` terminado em `/` quando há subpath.
- `register: false` no plugin: o registo é feito **manualmente** em [`components/layout/UpdateBanner.tsx`](../../components/layout/UpdateBanner.tsx) via [`lib/pwaServiceWorkerUrls.ts`](../../lib/pwaServiceWorkerUrls.ts) (`navigator.serviceWorker.register(swScriptUrl, { scope: scopeUrl })`).
- Com subpath, [`lib/pwaWorkboxPatterns.ts`](../../lib/pwaWorkboxPatterns.ts) acrescenta rotas runtime para `/_next/static` e `start-url` **sob** o prefixo do repo (os defaults do plugin assumem raiz do origin).

## `version.json`, `sw.js` e precache

- [`scripts/write-version.js`](../../scripts/write-version.js) grava `public/version.json` com `buildId` (lê `.next/BUILD_ID` quando existe) e `generatedAt`.
- Regrava também `out/version.json` após o export, para o banner de actualização não ficar com build antigo.
- O mesmo script **copia `public/sw.js` e `public/workbox-*.js` para `out/`** depois do `next-pwa` gerar o SW — o export estático pode ter copiado um `sw.js` antigo sem o prefixo do `basePath`.
- [`lib/pwaPrefixPrecacheUrl.ts`](../../lib/pwaPrefixPrecacheUrl.ts) prefixa entradas do precache (`/data/…` → `/repo/data/…`). CI corre [`scripts/verify-pwa-github-pages.js`](../../scripts/verify-pwa-github-pages.js) após o build (`yarn verify:pwa-github-pages`).
- **`public/sw.js` e `public/workbox-*.js` não são versionados** (`.gitignore`) — só gere com build de Pages, por exemplo:
  `GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/escudo-mestre-shadowdarkrpg-webapp yarn build`
- Em `next.config.ts`, `publicExcludes` inclui **`!version.json`** para **não** entrar no precache do Workbox (evita que o SW sirva um `buildId` antigo em cache).

## Cache de dados

`runtimeCaching` define padrão para URLs sob `/data/` (com prefixo de `basePath` quando aplicável) com estratégia **CacheFirst** e TTL de 30 dias (`cacheName: data-cache`).

## Ícones PWA

- `yarn icons:pwa` gera WebP e **PNG** (`icon-192.png`, `icon-512.png`) para o manifest — ver [`scripts/icons-from-shadowdark-spot-art.js`](../../scripts/icons-from-shadowdark-spot-art.js).

## PWA desactivado

- **`yarn dev`:** `disable: true` quando `NODE_ENV === "development"`.
- **Build Capacitor:** `BUILD_ANDROID_CAPACITOR=1` também desactiva o plugin conforme configuração em `next.config.ts`.

## Documentação relacionada

- [Deploy GitHub Pages](deploy-github-pages.md)
- [PWA e offline (utilizador)](../usuario/pwa-e-offline.md)
- [Dados e migrações](dados-e-migracoes.md)
