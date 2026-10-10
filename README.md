# Escudo do Mestre — Shadowdark (PWA)

Webapp **mobile-first** para consulta de regras curadas, bestiário, geradores de mesa e tabelas — setting **Fantasia / Mundo Fraturado** (Shadowdark).

- **Produção:** [GitHub Pages](https://ferandomanoelalmeida.github.io/escudo-mestre-shadowdarkrpg-webapp/)
- **Dados:** `public/data/` (`escudo-shadowdark.json`, `ameacas.json`, `tabelas/`, `catalogo/`)
- **Fonte MD:** repo [`shadowdarkrpg-fantasia`](https://github.com/FernandoManoelAlmeida/shadowdarkrpg-fantasia) (`Referências/shadowdark/`)

## Agentes de IA

**[AGENTS.md](AGENTS.md)** — skills em [`.cursor/skills/`](.cursor/skills/) (`escudo-shadowdark-*`).

## Início rápido

```bash
yarn install
yarn dev
```

Hub TTRPG (recomendado):

```bash
cd repos/escudo-mestre-shadowdarkrpg-webapp
yarn migrate:from-fantasia
yarn test:run
yarn dev
```

## Build GitHub Pages (local)

```bash
GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/escudo-mestre-shadowdarkrpg-webapp yarn build
```

Documentação: [`docs/desenvolvimento/`](docs/desenvolvimento/).
