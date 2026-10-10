# Design system — Escudo Shadowdark

Paridade estrutural com o Escudo OPRPG (mesmos componentes de layout, BottomNav, cartões, tipografia Inter). **Cores** em [`lib/theme.ts`](../../lib/theme.ts):

- Fundo/superfície: preto OSR (`#0a0a0a`, `#141414`)
- Texto: cinza claro; muted `#9a9a9a`
- Acento primário (navegação, títulos): `#d54d4d`
- Botão de rolagem: vermelho escuro `#8b2635`
- Badges criatura: `badgeOficial` (dourado), `badgeHomebrew` (lavanda `#9b6b8e`)
- Sucesso/erro em resultados de rolagem: verde/vermelho (`success`, `danger`)

PWA: [`lib/pwaColors.ts`](../../lib/pwaColors.ts) alinhado ao `theme.colors.surface` / `background`.

Não reutilizar ciano/identidade visual OPRPG neste repo.
