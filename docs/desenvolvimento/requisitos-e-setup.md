# Requisitos e setup

## Ferramentas

- **Node.js** — alinhado ao CI (GitHub Actions usa Node **20**). Recomenda-se LTS 20 ou superior compatível com Next 16.
- **Yarn** — o projecto usa **Yarn** (ficheiro `yarn.lock`). Não é obrigatório `npm` para o fluxo documentado.

## Instalação

Na raiz do repositório do webapp:

```bash
yarn install
```

O `package.json` define `postinstall` com `patch-package` para aplicar patches locais em dependências.

## Servidor de desenvolvimento

```bash
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) (ou a porta indicada no terminal). O script usa `next dev --webpack` (PWA desactivado em desenvolvimento).

## Scripts úteis (resumo)

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Desenvolvimento com hot reload |
| `yarn build` | Build de produção + `write-version.js` |
| `yarn start` | Servidor Next após build (não export estático) |
| `yarn test` / `yarn test:run` | Vitest |
| `yarn lint` | ESLint |
| `yarn format` | ESLint fix + Prettier |

Para detalhes de build, testes e export estático, ver [Build e testes](build-e-testes.md).

## Estrutura relevante

- `app/` — rotas e páginas (App Router)
- `components/` — UI partilhada
- `lib/` — lógica (carregamento de dados, `dice`, `basePath`, etc.)
- `public/data/` — JSON servidos ao cliente

## Documentação relacionada

- [Build e testes](build-e-testes.md)
- [Dados e migrações](dados-e-migracoes.md)
