# Créditos de ícones

## Dados RPG (`public/icons/dice/`)

| Arquivo | Origem | Licença |
|---------|--------|---------|
| `d4.svg`, `d10.svg`, `d12.svg` | [Game-icons.net](https://game-icons.net/) — **Skoll** (`d4`, `d10`, `d12`) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `d100.svg` | Mesmo traço que `d10.svg` (Skoll) — percentil na mesa | CC BY 3.0 (Skoll) |
| `d3.svg` | Game-icons — **Skoll** (`inverted-dice-3`) | CC BY 3.0 |
| `d6.svg` | Game-icons — **Delapouite** (`perspective-dice-six`) + algarismo «6» na face superior (adaptação do Escudo) | CC BY 3.0 |
| `d8.svg`, `d20.svg` | Game-icons — **Delapouite** (`dice-eight-faces-eight`, `dice-twenty-faces-twenty`) | CC BY 3.0 |

Atribuição sugerida: ícones por Skoll e Delapouite via [game-icons.net](https://game-icons.net/), licença CC BY 3.0.

Os SVG usam `fill="currentColor"`; na UI os botões aplicam `filter: brightness(0) invert(1)` para ícones claros sobre o fundo vermelho de rolagem.

Com `NEXT_PUBLIC_COPYRIGHT_FREE=1`, os SVG Game-icons **não** são mostrados (fallback textual `dN` em `DiceIcon`).

## Tipografia do wordmark Mastershield

| Arquivo | Origem | Licença |
|---------|--------|---------|
| `public/fonts/JBLACK.TTF` (+ `JBLACK.TXT`) | [JSL Blackletter](http://www.gate.net/~shipbrk/) — Jeffrey S. Lee | Distribuição livre inalterada com o readme; não incluir em pacote comercial sem permissão do autor |

Usada só no wordmark «Shadowdark Mastershield» (build com `COPYRIGHT_FREE` off).

## Ícones do app (PWA / home)

| Item | Ambos os builds |
|------|-----------------|
| `header-icon`, `home-icon`, `icon-192/512` | KEEP — mesmos assets (`yarn icons:pwa`); tratados como dentro da licença do app |
| Logo Creator Kit | Só na home com `COPYRIGHT_FREE=1` (`third-party-shadowdark-logo-white.png`) |
| Spot Art logo WebP | GATE — oculto com `COPYRIGHT_FREE=1` (`ShadowdarkSpotArtLogo`) |

## Tokens de ameaças

Mapa em `public/data/ameacas-tokens.json` (sobrevive a `yarn migrate:from-fantasia`). Fora da TPL — só na ficha com flag off.

| Prioridade | Origem | Notas |
|------------|--------|--------|
| Primária | [Shadowdark Community Tokens](https://foundryvtt.com/packages/shadowdark-community-tokens) (Delgore) — tokens circulares via jsDelivr do [GitHub](https://github.com/PrototypeESBU/foundryvtt-shadowdark-community-tokens) | Arte do companion ao [Community Content](https://foundryvtt.com/packages/shadowdark-community-content); maioria AI, uso pessoal/não-comercial; ficha com `border-radius: 50%` |
| Fallback | [You see this — Tokens](https://youseethis.blog/tokens/) | Hotlink WordPress onde não há match Community |

Regenerar o sidecar: `node scripts/rebuild-ameacas-tokens.js` (mapa EN→id em `scripts/data/community-tokens-ameaca-map.json`; baseline YST em `scripts/data/ameacas-tokens-yst-fallback.json`).
