# AGENTS.md — Escudo do Mestre Shadowdark (PWA)

Fonte única para agentes neste webapp. Stubs (`CLAUDE.md`, `GEMINI.md`, `TRAE.md`) apontam para cá.

> **Hub TTRPG:** filho em `repos/escudo-mestre-shadowdarkrpg-webapp/`. Contexto global: [`../../AGENTS.md`](../../AGENTS.md). Fonte MD: [`../shadowdarkrpg-fantasia/Referências/shadowdark/`](../shadowdarkrpg-fantasia/Referências/shadowdark/).

---

## 1. Visão

- PWA **mobile-first** — regras, bestiário, geradores de mesa, catálogo de itens; sem backend/login
- Dados em `public/data/` (`escudo-shadowdark.json`, `ameacas.json`, `tabelas/`, `catalogo/`)
- Fonte Markdown no vault Fantasia — **sem sync automático**
- Stack: Next.js 16, React 19, Yarn, styled-components, Vitest, PWA (`@ducanh2912/next-pwa`)
- Paleta OSR P&B + acentos em [`lib/theme.ts`](lib/theme.ts)
- Idioma: **português brasileiro**

**Produção (GitHub Pages):** `https://ferandomanoelalmeida.github.io/escudo-mestre-shadowdarkrpg-webapp/`

---

## 2. Roteamento — intenção → acção

| Objetivo | Acção | Skill |
|----------|-------|-------|
| Actualizar JSON a partir do Fantasia | `yarn migrate:from-fantasia` | `escudo-shadowdark-migrate-fantasia` |
| Dev local, testes, lint | `yarn install`, `yarn dev`, `yarn test:run`, `yarn lint` | `escudo-shadowdark-dev` |
| GitHub Pages, PWA, cache SW | push `master` ou `GITHUB_PAGES=1 yarn build` | `escudo-shadowdark-deploy` |
| Hotfix em JSON | `public/data/*.json` + testes | `escudo-shadowdark-data` |
| Páginas, BottomNav, tema, toaster de rolagens em traços | `app/`, `components/`, `lib/dice.ts` | `escudo-shadowdark-features` |
| Geradores `/geradores/*`, tabelas MD | `app/geradores/`, `lib/rollTable.ts` | `escudo-shadowdark-geradores` |
| Uso na mesa (jogador/MJ) | Não alterar código | `docs/usuario/` |

### Regras operacionais

- **Yarn** (não npm)
- Editar conteúdo **no Fantasia**, migrar aqui
- PWA desactivado em `yarn dev`
- `yarn test:run` após alterar dados ou lógica
- Glossário do Escudo: núcleo Shadowdark; sem termos Astraldark no PWA
- Só commits quando o utilizador pedir

---

## 3. Mapa de código

| Área | Path |
|------|------|
| Rotas | `app/` — `/`, `/regras`, `/ameacas`, `/geradores`, `/geradores/encontros`, `/arcanos` (+ `/arcanos/itens`, `/arcanos/grimorio`, `/arcanos/grimorio/[id]`); redirect `/itens-magicos` → `/arcanos` |
| Regras | `lib/escudo.ts` → `escudo-shadowdark.json` |
| Criaturas | `lib/ameacas.ts` |
| Rolagens | `lib/dice.ts`, `lib/rollTable.ts` |
| Layout | `components/layout/` — `BottomNav`, `QuickRollBar` |
| Dados | `public/data/` |
| Migrações | `scripts/migrate-*-shadowdark.js`, `migrate-from-fantasia.js` |

---

## 4. Fluxo Fantasia → PWA

1. Editar MD em `shadowdarkrpg-fantasia/Referências/shadowdark/`
2. `yarn migrate:from-fantasia`
3. `yarn test:run` → `yarn dev`
4. `GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/escudo-mestre-shadowdarkrpg-webapp yarn build` → deploy

```bash
yarn migrate:from-fantasia
# ou individual:
yarn migrate:regras-shadowdark -- ../shadowdarkrpg-fantasia/Referências/shadowdark/Escudo\ do\ Mestre\ Shadowdark.md --update
yarn migrate:ameacas-shadowdark
yarn migrate:tabelas-shadowdark
yarn migrate:catalogo-itens-magicos-shadowdark
yarn migrate:catalogo-magias-shadowdark
yarn extract:magias-shadowdark
```

Override vault: `FANTASIA_VAULT=/caminho/para/shadowdarkrpg-fantasia`

Docs: [`docs/desenvolvimento/integracao-hub-ttrpg.md`](docs/desenvolvimento/integracao-hub-ttrpg.md)

---

## 5. Guardrails

- Não misturar convenções OPRPG nem scripts `*-oprpg`
- Não commitar `repos/` no hub pai
- Não editar JSON sem schema de `lib/escudo.ts` / `lib/ameacas.ts`
- Geradores: rolagem **efémera** — não persistir resultados no PWA

---

## 6. Skills (canónicas neste repo)

Proxies no hub: [`.cursor/skills/escudo-shadowdark/`](../../.cursor/skills/escudo-shadowdark/) (+ symlinks flat `escudo-shadowdark-*`).

| Skill | Pasta |
|-------|--------|
| `escudo-shadowdark-migrate-fantasia` | `.cursor/skills/escudo-shadowdark-migrate-fantasia/` |
| `escudo-shadowdark-dev` | `.cursor/skills/escudo-shadowdark-dev/` |
| `escudo-shadowdark-deploy` | `.cursor/skills/escudo-shadowdark-deploy/` |
| `escudo-shadowdark-data` | `.cursor/skills/escudo-shadowdark-data/` |
| `escudo-shadowdark-features` | `.cursor/skills/escudo-shadowdark-features/` |
| `escudo-shadowdark-geradores` | `.cursor/skills/escudo-shadowdark-geradores/` |
