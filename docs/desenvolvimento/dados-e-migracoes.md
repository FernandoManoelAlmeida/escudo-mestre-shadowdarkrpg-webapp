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

## Catálogo — itens mágicos

- **Só fichas de item** (Benefício, Bônus, Maldição ou Personalidade). Tabelas roláveis, classes, PNJs e regras de aventura **não** entram no catálogo — vão para `Tabelas/` ou outro pipeline.
- Heurísticas partilhadas: `scripts/catalogo-itens-magicos-lib.js` (extract, migrate e `validate:data`).
- Regenerar MD no Fantasia (a partir da raiz do Escudo):

```bash
VAULT="../shadowdarkrpg-fantasia"
LIVRO="$VAULT/Referências/Shadowdark/Livros de Regras/Livro de Regras pt-BR.md"
OUT="$VAULT/Referências/Shadowdark/Catálogos/Itens Mágicos.md"
CS="$VAULT/Referências/Shadowdark/Livros de Regras/cursed-scrolls"
node scripts/extract-itens-magicos-livro-shadowdark.js "$LIVRO" "$OUT" \
  --append-cursed-scroll "$CS/Cursed Scroll 1 - Diabruras pt-BR.md" \
  --append-cursed-scroll "$CS/Cursed Scroll 2 - Red Sands pt-BR.md" \
  --append-cursed-scroll "$CS/Cursed Scroll 3 - Sol da Meia-Noite pt-BR.md" \
  --append-cursed-scroll "$CS/Cursed Scroll 4 - River of Night pt-BR.md" \
  --append-cursed-scroll "$CS/Cursed Scroll 5 - Preview pt-BR.md" \
  --append-cursed-scroll "$CS/Cursed Scroll 6 - City of Masks pt-BR.md"
yarn migrate:catalogo-itens-magicos-shadowdark -- "$OUT"
```

- Contagem esperada após migrate: **98** (95 livro + 3 Cursed Scroll). Auditoria: `node scripts/audit-catalogo-itens-magicos.js "$OUT" --json public/data/catalogo/itens-magicos.json --write docs/desenvolvimento/auditoria-itens-magicos.md`

## Catálogo — classes, ancestralidades e regras homebrew

- Lib partilhada: `scripts/catalogo-personagem-lib.js` (extract + migrate). Catálogos no vault usam delimitador `---` + `## Nome` entre entradas (corpos podem ter `##` e `---` internos).
- Migrate de **classes** passa `catalogoKind: "classe"` em `parseEntradasFromMd` (finalização `finalizeClassDescricao` + `normalizeClassDescricao` com seções `##`; ancestralidades continuam com `finalizeAncestryDescricao`).
- Extract de classes (`extractClassesFromText`): mescla flavor, stats e tabela de talentos órfãos antes de `# Classe:`; corta contaminação da classe seguinte só após `###/## Talentos`; `trimNextClassFlavorContamination` não corta flavor da própria classe quando ainda não há seção de talentos.
- `yarn validate:data --strict` exige tabela GFM em `## Talentos` e parágrafo introdutório (≥ 40 caracteres antes do primeiro `##`) em cada classe — ver `assertClassTalentTables` / `assertClassIntroParagraphs` em `catalogo-personagem-lib.js`.
- Glossário público Astraldark no migrate: `scripts/sanitize-catalogo-astraldark.js` + `astraldark-public-glossary.js` (dedupe por `id`; prioridade `astraldark` > `homebrew` > `cursed-scroll` > `livro`).
- Saídas: `public/data/catalogo/classes.json`, `ancestralidades.json`, `regras-homebrew.json` (o migrate de homebrew também atualiza `escudo-shadowdark.json` via `sync-regras-homebrew-escudo.js`, listando a regra em `/regras` como as seções do compêndio — ex. `/regras/multiclasse-simples`).
- Contagens esperadas (`yarn validate:data`): **19** classes (incl. Bárbaro homebrew); **10** ancestralidades (6 livro + 2 Astraldark + Drow/Duergar homebrew após dedupe); **1** regra `multiclasse-simples`.

```bash
VAULT="../shadowdarkrpg-fantasia"
LIVRO="$VAULT/Referências/Shadowdark/Livros de Regras/Livro de Regras pt-BR.md"
CAT="$VAULT/Referências/Shadowdark/Catálogos"
CS="$VAULT/Referências/Shadowdark/Livros de Regras/cursed-scrolls"
HB="$VAULT/Referências/Shadowdark/Homebrews"
node scripts/extract-classes-shadowdark.js --livro "$LIVRO" --out "$CAT/Classes.md" \
  --homebrews "$HB" \
  $(for f in "$CS"/*.md; do printf -- '--cursed-scroll %q ' "$f"; done)
node scripts/extract-ancestralidades-shadowdark.js \
  --livro "$LIVRO" --out "$CAT/Ancestralidades.md" \
  --astraldark "$VAULT/astraldark" \
  --homebrews "$VAULT/Referências/Shadowdark/Homebrews"
node scripts/extract-regras-homebrew-shadowdark.js \
  "$VAULT/Referências/Shadowdark/Homebrews/Multiclasse simples pt-BR.md" \
  "$CAT/Regras Homebrew.md"
yarn migrate:from-fantasia
```

## Cursed Scrolls

Ficheiros em `Livros de Regras/cursed-scrolls/Cursed Scroll N - … pt-BR.md`. Itens mágicos: `--append-cursed-scroll` no extract acima; cada bloco `###` é filtrado pela lib (não há capítulo `# Itens Mágicos` nos CS). Tabelas/monstros: extrair para vault quando necessário; depois migrate.

## Ameaças homebrew (distribuição pública)

- Ficheiros avulsos com vários `###` por NV (ex. `Githyanki Githzerai.md`) geram **uma entrada por bloco** com linha `CA …`; o rodapé de atribuição (último `---` curto com link WotC) é removido sem cortar separadores internos do documento.
- `origem: homebrew` passa por `scripts/astraldark-public-glossary.js` (glossário Matri alinhado ao Astraldark público) em nome, flavor, tipo, traços e `id`.
- Na UI: listagem e ficha detalhe não mostram `tipo` (como verbetes oficiais do livro); o campo permanece no JSON só para busca. Traços usam markdown (`TraitMarkdown`).
- Termos proibidos após glossário fazem falhar `yarn validate:data --strict`.

## Filtros na UI (listas e geradores)

Estado dos filtros sincroniza com a **query string** da rota (`?q=…`, `ord=nome:asc`, etc.) via `router.replace`, para restaurar ao voltar do detalhe ou do histórico do browser. Busca (`q`) usa debounce ~300 ms na URL.

Ordem no `FilterPanel`: busca → filtros (grid 2 colunas quando fizer sentido) → ordenação; **Limpar filtros** ao lado da ordenação no bestiário e grimório; hub de regras, glossário, itens mágicos, índice de **Tabelas** e hub de **Geradores** usam só busca + ordenação (sem botão limpar; URL com `q` e `ord`). Geradores de mesa (encontros, lojas, módulos) mantêm limpar no painel de rolagem. Hook: `hooks/useListFiltersInUrl.ts`; helpers: `lib/listFilterQuery.ts`.

## Testes

- `lib/rollTable.test.ts` — reação, d100, inferência
- `tests/scripts.test.ts` — índice de tabelas, `buildRollRows`, Gith ×7, glossário
- `tests/catalogo-itens-magicos-lib.test.ts` — heurísticas do catálogo de itens
- `tests/catalogo-personagem-lib.test.ts` — classes/ancestralidades (extract)
- `tests/catalogoClassDescricao.test.ts` — `normalizeClassDescricao`, `catalogoKind: classe`, títulos CS
- `tests/sanitize-catalogo-astraldark.test.ts` — glossário e dedupe
- `tests/tabelas.test.ts` — `formatTabelaTituloExibicao`
- `tests/ameacas-lib.test.ts` — `tipoParaListagem`
- `tests/trait-markdown.test.tsx` — traços sem `**` visível
