# Integração com o hub TTRPG

Este webapp faz parte do monorepo virtual **[ttrpg](https://github.com/FernandoManoelAlmeida/ttrpg)** como repo **irmão** do vault Fantasia. O Markdown-fonte vive em `shadowdarkrpg-fantasia`; este repo gera JSON em `public/data/` via migrações manuais.

## Layout esperado

Após `./scripts/bootstrap.sh` na raiz do hub:

```
ttrpg/
├── scripts/bootstrap.sh
└── repos/
    ├── shadowdarkrpg-fantasia/              # fonte MD (Referências/shadowdark/)
    └── escudo-mestre-shadowdarkrpg-webapp/ # este repo
```

A pasta `repos/` **não** é versionada no repo pai — apenas clonada localmente.

## Setup

```bash
git clone git@github.com:FernandoManoelAlmeida/ttrpg.git
cd ttrpg
./scripts/bootstrap.sh --only escudo-mestre-shadowdarkrpg-webapp
# recomendado: bootstrap de todos para ter o Fantasia ao lado
./scripts/bootstrap.sh
cd repos/escudo-mestre-shadowdarkrpg-webapp
yarn install
yarn dev
```

## Migrar dados do Fantasia

### Atalho (layout hub)

```bash
cd repos/escudo-mestre-shadowdarkrpg-webapp
yarn migrate:from-fantasia
```

Usa por padrão `../shadowdarkrpg-fantasia/`. Override:

```bash
FANTASIA_VAULT=/caminho/para/shadowdarkrpg-fantasia yarn migrate:from-fantasia
```

### Comandos explícitos

```bash
yarn migrate:regras-shadowdark -- ../shadowdarkrpg-fantasia/Referências/shadowdark/Escudo\ do\ Mestre\ Shadowdark.md --update
yarn migrate:ameacas-shadowdark
yarn migrate:tabelas-shadowdark
yarn migrate:catalogo-itens-magicos-shadowdark
```

## Fluxo de trabalho

1. Editar MD no Fantasia (`Referências/shadowdark/`, `Tabelas/`, `Catálogos/`)
2. Executar `yarn migrate:from-fantasia` (ou comandos individuais)
3. `yarn test:run` e `yarn dev` para validar
4. Build com `GITHUB_PAGES=1` e deploy (GitHub Pages)

**Não há sync automático** — alterações no vault não aparecem no PWA até migrar e fazer build/deploy.

## Modo solo (sem hub)

```bash
FANTASIA_VAULT=/caminho/para/shadowdarkrpg-fantasia yarn migrate:from-fantasia
```

## Referências

- Hub: [ttrpg README](https://github.com/FernandoManoelAlmeida/ttrpg/blob/master/README.md)
- Fantasia AGENTS: [`shadowdarkrpg-fantasia/AGENTS.md`](https://github.com/FernandoManoelAlmeida/shadowdarkrpg-fantasia/blob/master/AGENTS.md)
- Escudo AGENTS: [`AGENTS.md`](../../AGENTS.md) neste repo
- [Dados e migrações](dados-e-migracoes.md)
