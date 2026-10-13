---
name: escudo-shadowdark-data
description: >-
  Hotfix em public/data/*.json do Escudo Shadowdark (schemas escudo-shadowdark, ameacas, tabelas, catálogo).
  Preferir migrate a partir do Fantasia.
---

# escudo-shadowdark-data

| Ficheiro | Módulo |
|----------|--------|
| `escudo-shadowdark.json` | `lib/escudo.ts` |
| `ameacas.json` | `lib/ameacas.ts` (Criatura, `origem`) |
| `tabelas/*.json` | `lib/rollTable.ts` |
| `catalogo/itens-magicos.json` | `/arcanos/itens` |
| `catalogo/magias.json` | `/arcanos/grimorio`, `/arcanos/grimorio/[id]` |
| `catalogo/ancestralidades.json` | `/regras/ancestralidades` |
| `catalogo/classes.json` | `/regras/classes` |
| `catalogo/antecedentes.json` | `/regras/antecedentes` (página única, sem detalhe por id) |

Fonte MD: `Referências/shadowdark/Catálogos/Antecedentes.md` — `yarn extract:antecedentes-shadowdark` (paths no script) ou editar MD; `yarn migrate:catalogo-antecedentes-shadowdark`.

Após editar: `yarn test:run`. Fluxo normal: `escudo-shadowdark-migrate-fantasia`.
