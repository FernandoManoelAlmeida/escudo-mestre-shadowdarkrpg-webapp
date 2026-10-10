# Build e testes

## Build de produção

```bash
yarn build
```

Isto executa `next build --webpack` seguido de `node scripts/write-version.js`, que gera `public/version.json` (e actualiza `out/version.json` se a pasta `out/` já existir após o export).

### Export estático (GitHub Pages / Capacitor)

Quando `GITHUB_PAGES=1` ou `BUILD_ANDROID_CAPACITOR=1`, o `next.config.ts` activa `output: "export"`, `images.unoptimized` e `trailingSlash: true`. O resultado publicável fica em **`out/`**.

Build local simulando Pages:

```bash
GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/nome-do-repo yarn build
```

Substitua `nome-do-repo` pelo segmento do caminho (ex.: `escudo-mestre-oprpg-webapp`).

## Servir a pasta `out/` localmente

Qualquer servidor de ficheiros estáticos na pasta `out/` funciona, por exemplo:

```bash
npx --yes serve out -l 3000
```

Confirme que os pedidos usam o mesmo **basePath** que configurou no build (URLs como `http://localhost:3000/nome-do-repo/`).

## Testes

```bash
yarn test        # modo watch
yarn test:run    # uma execução (CI local)
yarn test:coverage
```

Os testes usam **Vitest** e **Testing Library** (`tests/`, `*.test.ts`).

## Lint e formatação

```bash
yarn lint
yarn lint:fix
yarn format    # lint:fix + prettier --write .
```

## Documentação relacionada

- [Requisitos e setup](requisitos-e-setup.md)
- [Deploy GitHub Pages](deploy-github-pages.md)
