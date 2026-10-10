---
name: escudo-shadowdark-geradores
description: >-
  Geradores de mesa Shadowdark (/geradores/*), lib/geradoresConfig.ts, lib/rollTable.ts
  e MD em Referências/shadowdark/Tabelas/. Rolagem efémera — sem histórico no PWA.
---

# escudo-shadowdark-geradores

## Rotas

| Slug | Conteúdo |
|------|----------|
| `/` (home) | **Oráculo d6** (Astraldark): sim/não; detalhe só em 1 ou 6 |
| `/geradores` | Hub (módulos com dados no índice) |
| `/geradores/encontros` | Cadeia condicional: local → (criatura: distância+atividade; armadilha/tesouro: tabela própria). Reação manual 2d6+MOD CAR. Ver `lib/encounterFollowUp.ts` |
| `/geradores/[modulo]` | `TableGeneratorModule` genérico (`lib/geradoresConfig.ts` → `GERADOR_MODULES`) |
| `/geradores/armadilhas`, `perigos`, `reacao`, `falha-magica`, `xp-tesouro`, `tesouros`, `solodark` | Tabelas por categoria/id (`solodark`: sim/não + detalhe d6) |
| `/geradores/itens-*` | Itens por subcategoria (`armas`, `pocoes`, `magicos-aleatorios`, …) |
| `/geradores/lojas`, `assentamentos`, `pnjs`, `rumores`, `algo-acontece` | Mesa e social |

`/regras/tabelas` é **somente leitura**; links “Rolar na mesa →” usam `geradorHrefForTabela`. “Ver tabela completa” usa `regrasTabelaHref(id)` (`#tabela-{id}` + acordeão aberto).

`/arcanos/itens` — catálogo + link para `/geradores/itens-magicos-aleatorios`.

## Código

- `app/geradores/`, `components/geradores/`
- `lib/rollTable.ts`, `lib/geradoresUi.ts`, `lib/tabelas.ts`, `public/data/tabelas/`
- Vault: `repos/shadowdarkrpg-fantasia/Referências/shadowdark/Tabelas/`
- Encontros do Livro: `node scripts/extract-tabelas-livro-shadowdark.js` → migrate

## Regra

Cada rolagem de tabela é instantânea; não persistir resultados no PWA (toaster só para rolagens de traços/dados na ficha).

Geradores de cadeia **não** rolam portão «aconteceu / não aconteceu» nem sub-passos incoerentes (ex.: atividade/reação para armadilha ou tesouro).

`TableGeneratorModule` usa `lib/geradoresUi.ts` para evitar repetir título/descrição/chip; botão mostra `Rolar (dX)` em vez de linha «Rolagem:».
