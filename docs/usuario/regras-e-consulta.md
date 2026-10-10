# Regras e consulta

## Fluxo típico

1. **Índice** (`/regras`) — lista todas as secções do escudo com identificadores (§). Há **campo de busca** para filtrar por título ou texto do índice.
2. **Links rápidos** no topo podem levar directamente a destinos frequentes (glossário, tabelas, etc., conforme configurado na app).
3. **Secção** (`/regras/[sectionId]`) — conteúdo dividido em **subsecções** com título e texto em Markdown (negrito, listas, links internos quando existirem).
4. **Fórmulas** — algumas subsecções listam fórmulas de dados ou regras em formato textual.
5. **Tabelas** — quando existir referência a uma tabela, aparece um acordeão **“Ver tabela”**; ao expandir, vê-se a tabela formatada (responsiva em ecrã pequeno).

## Glossário (`/regras/glossario`)

- Lista de **termos** (siglas ou nomes curtos) com descrição.
- Use a **busca** para encontrar um termo rapidamente durante o jogo.

## Tabelas (`/regras/tabelas`)

- Página dedicada a **consultar tabelas** (DT, resistências, etc.) sem percorrer cada secção.
- Útil quando o mestre precisa só do valor tabulado.

## Dados e actualização

Todo o conteúdo de regras vem do ficheiro `escudo-mestre-casa.json` (em produção, servido como ficheiro estático). Se algo estiver desactualizado em relação à sua mesa, a correcção é feita no **repositório** do projecto (ver [Dados e migrações](../desenvolvimento/dados-e-migracoes.md)).

## Documentação relacionada

- [Visão geral](visao-geral.md)
- [Navegação e acessibilidade](navegacao-e-acessibilidade.md)
- [Rolagens](rolagens.md) — para aplicar na prática fórmulas que leu nas regras
