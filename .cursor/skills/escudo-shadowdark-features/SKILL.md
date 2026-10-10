---
name: escudo-shadowdark-features
description: >-
  UI/UX do Escudo Shadowdark: rotas, BottomNav, regras, bestiário, tema OSR P&B, OrigemBadge, RollToast em traços.
  Não usar para geradores nem scripts migrate.
---

# escudo-shadowdark-features

- Tema: [`lib/theme.ts`](../../lib/theme.ts) — OSR P&B, sem ciano OPRPG
- Criaturas: `OrigemBadge`, filtros em `/ameacas`
- Rolagens: `rollTesteShadowdark` em [`lib/dice.ts`](../../lib/dice.ts)
- Layout: `components/layout/BottomNav`, `QuickRollBar`

Não misturar tipos OPRPG (VD, defesa, elementos).

Para geradores: `escudo-shadowdark-geradores`. Para JSON: `escudo-shadowdark-migrate-fantasia`.
