---
name: escudo-shadowdark-migrate-fantasia
description: >-
  Migra MD do vault shadowdarkrpg-fantasia para public/data/ do PWA Shadowdark.
  Use após editar Escudo, Bestiário, Tabelas ou Catálogo no Fantasia.
---

# escudo-shadowdark-migrate-fantasia

## Comando principal

```bash
cd repos/escudo-mestre-shadowdarkrpg-webapp
yarn migrate:from-fantasia
```

Vault padrão: `../shadowdarkrpg-fantasia/`. Override: `FANTASIA_VAULT=...`

## Comandos individuais

- `yarn migrate:regras-shadowdark` — `Escudo do Mestre Shadowdark.md` → `escudo-shadowdark.json`
- `yarn migrate:ameacas-shadowdark` — Bestiário + avulsas → `ameacas.json`
- `yarn migrate:tabelas-shadowdark` — `Referências/Shadowdark/Tabelas/**/*.md`
- `yarn migrate:catalogo-itens-magicos-shadowdark` — `Catálogos/Itens Mágicos.md`

## Extrair do livro (antes do migrate)

Paths a partir da raiz do vault Fantasia:

```bash
LIV="Referências/Shadowdark/Livros de Regras/Livro de Regras pt-BR.md"
node scripts/extract-tabelas-livro-shadowdark.js "$LIV" "Referências/Shadowdark/Tabelas"
node scripts/extract-pnj-livro-shadowdark.js "$LIV" "Referências/Shadowdark/Tabelas/pnjs"
node scripts/extract-itens-magicos-livro-shadowdark.js "$LIV" "Referências/Shadowdark/Catálogos/Itens Mágicos.md" \
  --append-cursed-scroll "Referências/Shadowdark/Livros de Regras/cursed-scrolls/Cursed Scroll 1 - Diabruras pt-BR.md"
# repetir --append-cursed-scroll para CS 2–6
```

Executar os `extract-*` com `cwd` = `repos/escudo-mestre-shadowdarkrpg-webapp`; passar paths absolutos ou relativos ao vault.

## Guardrails

- Astraldark no PWA: só glossário **público** (skill `astraldark` no Fantasia)
- Não ingerir `Astraldark privado`
- Sempre `yarn test:run` após migrate
- Novo deploy Pages para utilizadores verem JSON actualizado (cache SW)

## Referências

- [AGENTS.md](../../AGENTS.md) §4
- [docs/desenvolvimento/dados-e-migracoes.md](../../docs/desenvolvimento/dados-e-migracoes.md)
