# Navegação e acessibilidade

## Menu inferior (barra de navegação)

Três destinos principais:

- **Regras** — `/regras`
- **Início** — `/`
- **Ameaças** — `/ameacas`

A rota **Rolagens** (`/rolagens`) não tem ícone próprio na barra: aceda pelo endereço, favorito ou link partilhado.

### Comportamento ao tocar no item já activo

Se estiver numa **sub-rota** (por exemplo `/regras/glossario`) e o item da barra correspondente estiver activo, **a primeira vez** que tocar no topo da página pode navegar para a rota “principal” desse separador (por exemplo `/regras`). Se já estiver no topo da página, o toque pode apenas fazer **scroll suave para o início** em vez de navegar — útil para voltar ao topo após leitura longa.

## Cabeçalho

- **Título / identidade** da aplicação.
- **Rolagem rápida:** campo de fórmula (ex.: `2d20+5`) e botão para rolar. Em ecrãs estreitos, pode haver um controlo para **expandir** ou recolher a área de rolagem.
- Resultados da rolagem rápida aparecem como **toasts** no canto (não bloqueiam a página).

## “Pular para o conteúdo”

No início da página existe um link **oculto visualmente** até receber foco pelo teclado (“Pular para o conteúdo”). Ao activá-lo, o foco salta para a região principal (`#main-content`), útil para leitores de ecrã e navegação por `Tab`.

## Rolagens na mesa vs. página Rolagens

| Onde | Uso típico |
|------|------------|
| Cabeçalho (rápido) | Uma fórmula genérica sem sair da página actual |
| `/rolagens` | Testes de atributo/perícia com DT opcional e explicação na página |

## Dicas de uso na mesa

- Fixe **favoritos** para `/regras`, `/rolagens` e `/ameacas` se usar sempre as mesmas rotas.
- Em **PWA** instalado, o ícone abre directamente o `start_url` configurado no manifest (normalmente a início).

## Documentação relacionada

- [Visão geral](visao-geral.md)
- [Rolagens](rolagens.md)
