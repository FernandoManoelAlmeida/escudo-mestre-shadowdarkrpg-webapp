# Rolagens

Existem **dois sítios** para rolar dados:

1. **Página Rolagens** — `/rolagens` (testes estruturados e rolagem livre com detalhe na página).
2. **Barra no cabeçalho** — rolagem **livre** por fórmula; o resultado aparece num **toast** (notificação).

A lógica de dados está em `lib/dice.ts` no código-fonte; abaixo resume o comportamento visível na interface.

## Rolagem livre

- Formato: `XdY` ou `XdY+mod` / `XdY-mod` (espaços são ignorados).
- Exemplos válidos: `d20`, `2d20+5`, `4d8+8`, `-2d20` (para múltiplos d20, valor negativo de contagem usa a regra “use o pior” entre os d20).
- **Lados permitidos** para Y: **3, 4, 6, 8, 10, 12, 20, 100**. Outros valores são rejeitados na barra rápida e na página.
- Se a fórmula for inválida, a página mostra uma mensagem de ajuda.

## Teste de atributo (`/rolagens`)

- Escolha **atributo** de 0 a 5.
- **Atributo 1–5:** rola **N d20** (N = valor do atributo) e usa o **maior** resultado.
- **Atributo 0:** rola **2d20** e usa o **pior** (menor).
- **DT (opcional):** se preencher um número, a interface indica **Sucesso** ou **Falha** comparando o total com a DT.

## Teste de perícia (`/rolagens`)

- **Atributo** base (0–5), com a mesma regra de “melhor d20” ou “pior d20” no caso 0.
- **Bônus** por grau de treinamento:
  - Destreinado (+0)
  - Treinado (+5)
  - Veterano (+10)
  - Expert (+15)
- O total mostrado é **melhor d20 + bônus** (ou pior + bônus com atributo 0).
- **DT opcional** igual ao teste de atributo.

## Toasts (barra rápida)

Ao rolar pelo cabeçalho, o resultado surge num toast. O d20 “escolhido” (melhor ou pior) pode ser destacado visualmente quando aplicável.

## Documentação relacionada

- [Navegação e acessibilidade](navegacao-e-acessibilidade.md)
- [PWA e offline](pwa-e-offline.md) — rolagens são locais ao navegador
