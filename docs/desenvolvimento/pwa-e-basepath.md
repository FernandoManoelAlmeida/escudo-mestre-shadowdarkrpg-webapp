# PWA e basePath

Em produção (GitHub Pages), o app vive sob `/escudo-mestre-shadowdarkrpg-webapp/`.

- `next.config.ts`: `basePath` / `assetPrefix` quando `GITHUB_PAGES=1`
- `NEXT_PUBLIC_BASE_PATH` deve coincidir com o nome do repositório
- `lib/basePath.ts` e `assetUrl()` para ícones e fetch de `/data/`
- Service worker (`@ducanh2912/next-pwa`): precache de assets; JSON em `/data/` pode cachear até novo deploy
- `public/version.json` gerado por `scripts/write-version.js` no build

Desenvolvimento: `yarn dev` sem PWA; basePath vazio em localhost.
