# Dados e migrações — Escudo Shadowdark

Mapa **fonte MD (vault Fantasia)** → **script** → **JSON no PWA**.

Vault canónico: `repos/shadowdarkrpg-fantasia/Referências/Shadowdark/` (resolver também `shadowdark` minúsculo via `scripts/vault-paths.js`).

## Ordem recomendada

1. Extrair ou editar MD no Fantasia (livro / Cursed Scrolls).
2. `cd repos/escudo-mestre-shadowdarkrpg-webapp && yarn migrate:from-fantasia`
3. `yarn validate:data` (opcional isolado; o orquestrador já chama `--strict` no fim)
4. `yarn test:run`

## Pipelines

| Saída | Script | Fonte MD |
|-------|--------|----------|
| `public/data/escudo-shadowdark.json` | `migrate-regras-shadowdark.js` | `Escudo do Mestre Shadowdark.md` |
| `public/data/ameacas.json` | `migrate-ameacas-shadowdark.js` | `Ameaças/Bestiário*.md` + avulsas |
| (validação) | `validate-migrated-data.js` | IDs de geradores, 7 fichas Gith públicas, glossário homebrew |
| `public/data/tabelas/*.json` | `migrate-tabelas-shadowdark.js` | `Tabelas/**/*.md` (frontmatter `id`, `rolagem`; remove JSON órfãos; `--strict`) |
| `public/data/catalogo/itens-magicos.json` | `migrate-catalogo-itens-magicos-shadowdark.js` | `Catálogos/Itens Mágicos.md` |
| `public/data/catalogo/magias.json` | `migrate-catalogo-magias-shadowdark.js` | `Catálogos/Grimório.md` |

### Extração do livro (vault)

| Script | Destino |
|--------|---------|
| `extract-tabelas-livro-shadowdark.js` | `Tabelas/` (encontros, rumores, lojas, …) |
| `extract-pnj-livro-shadowdark.js` | `Tabelas/pnjs/` |
| `extract-itens-magicos-livro-shadowdark.js` | `Catálogos/Itens Mágicos.md` (+ `--append-cursed-scroll` por ficheiro CS) |
| `extract-magias-shadowdark.js` / `yarn extract:magias-shadowdark` | `Catálogos/Grimório.md` (Livro `# Magias` + listas de grau, Astraldark `## Magias astrais`, 6 Cursed Scrolls) |
| `extract-tesouros-livro-shadowdark.js` | `Tabelas/tesouros/tesouros-0-3.md` … `tesouros-10-mais.md` (d100) |

Heurística de rolagem partilhada: `scripts/infer-rolagem.js` (usada no extract e no runtime via `lib/rollTable.ts` → `inferRolagemFromTable`).

## Rolagem por tabela (referência)

Conferir sempre no **Livro de Regras pt-BR** antes de alterar `rolagem` no frontmatter.

| ID | Rolagem | Notas |
|----|---------|--------|
| `reacao` | `2d6 + MOD CAR` | Faixas na 1ª coluna; UI soma MOD CAR |
| `rumores-taverna` | `d100` | Faixas `01`, `82–83`, `00` (= 100) |
| `algo-acontece` | `d100` | Idem rumores |
| `xp-tesouro` | `d4` | Uma linha por qualidade (1–4) |
| `armadilhas`, `perigos-ambientais` | `d12` | Livro |
| `teste-encontro` | `d6` | Só consulta em `/regras/tabelas`; **não** usado no assistente `/geradores/encontros` |
| `distancia-inicial-encontro`, `atividade-criaturas` | `d6`, `2d6` | Só após resultado classificado como **criatura** (`lib/encounterFollowUp.ts`) |
| `tesouros-0-3` … `tesouros-10-mais` | `d100` | Loot desprotegido / entrada «tesouro» na tabela de encontro |
| `encontro-*` (biomas) | `d100` | Tabelas de encontro por ambiente |
| `pnj-*`, `rival-*` | `d12`–`2d6` | Ver frontmatter em `Tabelas/pnjs/` |
| `solodark-oraculo` | `d20` | SoloDark (1–9 Não, 10 Reviravolta, 11–20 Sim); Home do Escudo |
| `solodark-oraculo-detalhe` | `d6` | Legado Astraldark (não usado no widget; reviravolta → `algo-acontece`) |

## Motor de rolagem (app)

`lib/rollTable.ts`: `parseDiceFormula`, faixas (`parseRangeCell`), `rollOnTable(table, { modifier })`. Tabelas percentis e reação usam **lookup por faixa**, não `valor - 1`.

## Cursed Scrolls

Ficheiros em `Livros de Regras/cursed-scrolls/Cursed Scroll N - … pt-BR.md`. Itens mágicos: append no extract de catálogo com `origem` = nome do ficheiro. Tabelas/monstros: extrair para vault quando necessário; depois migrate.

## Ameaças homebrew (distribuição pública)

- Ficheiros avulsos com vários `###` por NV (ex. `Githyanki Githzerai.md`) geram **uma entrada por bloco** com linha `CA …`; o rodapé de atribuição (último `---` curto com link WotC) é removido sem cortar separadores internos do documento.
- `origem: homebrew` passa por `scripts/astraldark-public-glossary.js` (glossário Matri alinhado ao Astraldark público) em nome, flavor, tipo, traços e `id`.
- Na UI: listagem e ficha detalhe não mostram `tipo` (como verbetes oficiais do livro); o campo permanece no JSON só para busca. Traços usam markdown (`TraitMarkdown`).
- Termos proibidos após glossário fazem falhar `yarn validate:data --strict`.

## Filtros na UI (listas e geradores)

Estado dos filtros sincroniza com a **query string** da rota (`?q=…`, `ord=nome:asc`, etc.) via `router.replace`, para restaurar ao voltar do detalhe ou do histórico do browser. Busca (`q`) usa debounce ~300 ms na URL.

Ordem no `FilterPanel`: busca → filtros (grid 2 colunas quando fizer sentido) → ordenação; **Limpar filtros** ao lado da ordenação no bestiário e grimório; hub de regras e itens mágicos não exibem o botão (a URL continua sincronizada). Glossário e geradores mantêm limpar em linha própria. Hook: `hooks/useListFiltersInUrl.ts`; helpers: `lib/listFilterQuery.ts`.

## Testes

- `lib/rollTable.test.ts` — reação, d100, inferência
- `tests/scripts.test.ts` — índice de tabelas, `buildRollRows`, Gith ×7, glossário
- `tests/ameacas-lib.test.ts` — `tipoParaListagem`
- `tests/trait-markdown.test.tsx` — traços sem `**` visível
