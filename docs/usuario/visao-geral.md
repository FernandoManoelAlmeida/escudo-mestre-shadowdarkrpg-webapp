# Visão geral

## O que é

**Escudo do Mestre — Webapp** é uma aplicação **mobile-first** para consultar regras de casa do Escudo do Mestre (Ordem Paranormal RPG), fazer **rolagens** de dados e ver **fichas de ameaças**. O conteúdo de regras e ameaças vem de ficheiros JSON estáticos no repositório; não há servidor de jogo nem conta de utilizador.

## Funcionalidades principais

| Área | Rota | Descrição breve |
|------|------|-----------------|
| Início | `/` | Apresentação, créditos e resumo das regras em uso |
| Regras | `/regras` | Índice com busca e links para secções |
| Secção | `/regras/[id]` | Texto formatado, fórmulas e tabelas por secção |
| Tabelas | `/regras/tabelas` | Consulta centralizada de tabelas |
| Glossário | `/regras/glossario` | Termos com busca |
| Rolagens | `/rolagens` | Rolagem livre, teste de atributo e teste de perícia |
| Ameaças | `/ameacas` | Lista com busca, filtros e ordenação |
| Ficha | `/ameacas/[id]` | Detalhe de uma ameaça |

No **cabeçalho** existe ainda uma **barra de rolagem rápida** (fórmula de dados) disponível em qualquer página; os resultados aparecem como notificações (toasts).

## Requisitos

- **Navegador** recente (Chrome, Firefox, Safari, Edge) com JavaScript activado.
- **Ecrã:** optimizado para telemóvel; funciona também em tablet e desktop.
- **Ligação à Internet** na primeira visita (e para actualizar dados em cache, conforme o service worker). Com PWA instalado, parte do conteúdo pode estar disponível offline após uso anterior (ver [PWA e offline](pwa-e-offline.md)).

## Privacidade e dados

- Não existe login: **não** recolhemos credenciais nesta app.
- Regras e ameaças são **ficheiros públicos** servidos a partir do site (`public/data/` no código-fonte). Qualquer alteração ao jogo na mesa é da responsabilidade do grupo.
- O banner de **nova versão** (em produção) pode usar `localStorage` para guardar o identificador da build vista por si; pode limpar dados do site nas definições do navegador.

## Limitações

- O texto e as fichas reflectem **apenas** o que está nos JSON em `public/data/` (não substitui livros oficiais).
- A app **não** sincroniza rolagens entre jogadores; cada dispositivo rola localmente.

## Documentação relacionada

- [Navegação e acessibilidade](navegacao-e-acessibilidade.md)
- [Regras e consulta](regras-e-consulta.md)
- [Rolagens](rolagens.md)
- [Ameaças](ameacas.md)
- [PWA e offline](pwa-e-offline.md)
