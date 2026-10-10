# Ameaças

## Lista (`/ameacas`)

### Busca

- Campo **“Buscar por nome, VD, características…”** filtra o texto **em vários campos** da ficha (nome, valor de desafio, texto de características, etc.).

### Ordenação

Botões de ordenação (rótulos na interface):

- **Nome (A → Z)** ou **Nome (Z → A)** — alterna ao voltar a premir o mesmo grupo.
- **VD (maior → menor)** ou **VD (menor → maior)** — ordena pelo valor de desafio.

### Filtro por características

- Lista **multi-selecção** de características derivadas dos dados (ex.: tipos de tags que existem nas fichas).
- Pode limpar a selecção com o botão de limpar no painel.
- Combine **busca textual** + **características** para afinar a lista.

### Resultado

- Cada ameaça aparece como um **cartão** clicável que leva à ficha detalhada.
- Se não houver resultados, a lista fica vazia (ajuste filtros ou busca).

## Ficha (`/ameacas/[id]`)

- Abre a ficha completa da ameaça com o mesmo `id` usado na lista.
- Se o `id` não existir no ficheiro de dados, verá uma mensagem de **não encontrada**.

## Erros de carregamento

Se o JSON de ameaças falhar a carregar (rede, ficheiro em falta no deploy), a página mostra uma mensagem de erro amigável.

## Documentação relacionada

- [Visão geral](visao-geral.md)
- [Dados e migrações](../desenvolvimento/dados-e-migracoes.md) — como actualizar `ameacas.json`
