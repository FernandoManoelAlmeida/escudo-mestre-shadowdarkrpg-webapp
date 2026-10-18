---
name: escudo-shadowdark-copyright-free
description: >-
  Ao introduzir conteúdo novo no Escudo Shadowdark (JSON, migrate Fantasia, UI,
  arte, rotas, catálogo, bestiário, grimório, itens), consultar a FAQ da
  Shadowdark RPG Third-Party License e aplicar GATE/KEEP via
  NEXT_PUBLIC_COPYRIGHT_FREE / copyrightFreeFilter / rotas. Usar também quando
  o pedido mencionar COPYRIGHT_FREE, TPL, Cursed Scroll ou licença TAL.
---

# escudo-shadowdark-copyright-free

Checklist obrigatório **antes** de gravar conteúdo novo neste webapp.

## 1. Consultar a FAQ

Abrir e usar como critério:

[FAQ on The Shadowdark RPG Third-Party License](https://www.thearcanelibrary.com/blogs/shadowdark-blog/faq-on-the-shadowdark-rpg-third-party-license)

Não é aconselhamento jurídico; resume a FAQ para o inventário do app. A flag **não** substitui licença especial TAL para GM helpers / VTT.

## 2. Classificar KEEP vs GATE

Com `NEXT_PUBLIC_COPYRIGHT_FREE=1`, só fica visível o KEEP. Com flag off, GATE também aparece (build de mesa).

| KEEP | GATE |
|------|------|
| Monstro / magia / item mágico do **core** (livro) | Cursed Scroll (reprint verbatim) |
| Astraldark / homebrew / UI própria | Classes, ancestralidades, antecedentes do livro |
| Ícones do app (home / header / PWA 192·512) | Tabelas de rolagem do livro |
| Logo Creator Kit na home **só** com flag on | Prosa de regras fora de monstro·magia·item |
| Bloco `#licenca` com atribuição (flag on) | Tokens You See This |
| | Logo Spot Art grande (`ShadowdarkSpotArtLogo`) |
| | DiceIcon Game-icons (fallback texto `dN`) |

Wordmark «Shadowdark Mastershield» = build com GATE visível (flag off).

## 3. Aplicar no código

Não basta documentar — ligar ao pipeline existente:

| Camada | Onde |
|--------|------|
| Flag | `lib/copyrightFree.ts` → `isCopyrightFree()` |
| Filtros de dados | `lib/copyrightFreeFilter.ts` + loaders (`getAmeacas`, `getMagias`, `getClasses` / ancestralidades / antecedentes, itens, `getTabelasIndex`, `getEscudo`) |
| Rotas vazias | `lib/copyrightFreeRoutes.ts` + `CopyrightFreeRouteGate` / `GeradoresRouteGate` / `CatalogoPersonagemRouteGate` |
| Nav | `BottomNav` (omitir Geradores se gated); QuickLinks em `/regras` |
| Arte | `CopyrightedAsset`, `isCopyrightFree()`; tokens em `ameacas-tokens.json` só com flag off |

## 4. Tipo de conteúdo novo

Se o filtro actual **não** cobrir o caso:

1. Estender `copyrightFreeFilter` (e loaders).
2. Se a página ficar sem entradas: actualizar `copyrightFreeRoutes` + gate + esconder links.
3. Testes unitários / UI da flag e do filtro.
4. `yarn test:run`.

Sidecar que sobrevive a migrate: `public/data/ameacas-tokens.json` (Community Tokens primário + You See This fallback; regenerar com `yarn rebuild:ameacas-tokens`; não embutir URL em `ameacas.json`).

## 5. Verificação

```bash
NEXT_PUBLIC_COPYRIGHT_FREE=1 yarn dev   # ou testes com env stub
yarn test:run
```

Confirmar: conteúdo GATE ausente com flag `1`; KEEP (core + obra própria) visível; rotas vazias redireccionam / links ocultos.

## 6. Relação com outras skills

- `escudo-shadowdark-migrate-fantasia` / `escudo-shadowdark-data`: após introduzir dados, **correr esta skill** se houver categorias novas ou origem CS/livro/homebrew.
- `escudo-shadowdark-features`: novas rotas/UI — classificar arte e links sob TPL.

Contexto AGENTS: secção COPYRIGHT_FREE em `AGENTS.md` deste repo.
