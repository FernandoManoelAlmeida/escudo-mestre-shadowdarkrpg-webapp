import { describe, it, expect } from "vitest";
import {
  extractClassesFromText,
  extractAncestryLivro,
  parseEntradasFromMd,
  trimAncestryBodyContamination,
} from "../scripts/catalogo-personagem-lib";

describe("catalogo-personagem-lib", () => {
  it("extrai classe com bloco de stats órfão antes do H1", () => {
    const md = `
Armas: adaga.

Armaduras: couro.

Pontos de Vida: 1d4 por nível.

# Classe: Teste

Especial. Habilidade do teste.
`;
    const { entradas, skipped } = extractClassesFromText(md, {
      origem: "test",
      fonte: "livro",
    });
    expect(skipped).toHaveLength(0);
    expect(entradas[0].nome).toBe("Teste");
    expect(entradas[0].descricao).toMatch(/Pontos de Vida: 1d4/);
    expect(entradas[0].descricao).toMatch(/Habilidade do teste/);
  });

  it("rejeita ancestralidade com tabela d12 de classe colada", () => {
    const body = trimAncestryBodyContamination(`
Povo forte.

Poderoso. +1 em ataques.

| d12 | Resultado |
| --- | --- |
| 2 | talento |
`);
    expect(body).not.toMatch(/d12/);
    expect(body.length).toBeGreaterThan(20);
  });

  it("parseia catálogo com delimitador --- entre entradas", () => {
    const md = `# Catálogo

---
## Guerreiro
*Fonte: livro*

Corpo da classe.

### TALENTOS

| d12 | x |
`;
    const { entradas } = parseEntradasFromMd(md, {
      entryDelimiter: "---",
      catalogoKind: "classe",
    });
    expect(entradas).toHaveLength(1);
    expect(entradas[0].nome).toBe("Guerreiro");
    expect(entradas[0].descricao).toMatch(/Talentos/i);
    expect(entradas[0].descricao.length).toBeGreaterThan(40);
  });

  it("extrai Guerreiro com flavor órfão, tabela d12 e sem vazamento do Ladrão", () => {
    const md = `
Gladiadores ensanguentados usando armaduras amassadas, duelistas acrobáticos com espadas de arremesso.

Armas: todas as armas.

Armaduras: todas as armaduras e escudos.

Pontos de Vida: 1d8 por nível.

| d12 | Resultado |
| --- | --- |
| 2 | Ganhe Maestria em Armas em um tipo de arma adicional |
| 12 | Escolha um talento ou distribua +2 pontos entre os seus atributos |

# Classe: Guerreiro

Maestria em Armas. Você recebe +1 em jogadas de ataque e dano.

Bravura. Você tem Vantagem nos testes de Força.

### TALENTOS DE GUERREIRO

### "Nenhuma melodia é mais doce do que o assovio de um machado!"

### Jorbin, guerreiro anão

Assassinos que se esgueiram por telhados, vigaristas sorridentes.

Armas: adaga, arco curto.

Armaduras: armadura de couro.

Pontos de Vida: 1d4 por nível.

Apunhalada Pelas Costas. Dano extra.

| d12 | Resultado |
| --- | --- |
| 3–5 | Sua Apunhalada Pelas Costas causa +1 dado de dano |

# Classe: Ladrão

Ladroagem. Você tem proficiência em habilidades de roubo.
`;
    const { entradas } = extractClassesFromText(md, {
      origem: "livro",
      fonte: "livro",
    });
    const g = entradas.find((e) => e.nome === "Guerreiro");
    expect(g).toBeDefined();
    expect(g!.descricao).toMatch(/Gladiadores ensanguentados/);
    expect(g!.descricao).toMatch(/Maestria em Armas em um tipo de arma adicional/);
    expect(g!.descricao).not.toMatch(/Apunhalada Pelas Costas/);
    expect(g!.descricao).toMatch(/## Talentos/i);
  });

  it("extrai Cavaleiro de São Ydris sem conjuração de bruxa colada", () => {
    const md = `
### TALENTOS DE BRUXA

| d12 | Resultado |
| --- | --- |
| 3–7 | +2 em Carisma |

Cavaleiros amaldiçoados que trilham o caminho de São Ydris, o Profano.

Armas: todas as armas corpo a corpo, besta.

Armaduras: todas as armaduras e escudos.

Pontos de Vida: 1d6 por nível.

Possessão Demoníaca. 3/dia, ganhe um bônus de +1 em suas rolagens de dano.

| d12 | Resultado |
| --- | --- |
| 2 | Seu bônus de Possessão Demoníaca aumenta em 1 ponto. |
| 12 | Escolha um talento ou distribua +2 pontos entre os seus atributos |

# Classe: Cavaleiro de São Ydris

Conjuração. Você pode conjurar as magias de bruxa que você conhece.

### TALENTOS DE CAVALEIRO DE SÃO YDRIS

Magias Conhecidas por Grau de Magia

# Classe: Warlock

Patrono. Escolha um patrono.
`;
    const { entradas } = extractClassesFromText(md, {
      origem: "cs",
      fonte: "cursed-scroll",
    });
    const y = entradas.find((e) => e.nome === "Cavaleiro de São Ydris");
    expect(y).toBeDefined();
    expect(y!.descricao).toMatch(/Cavaleiros amaldiçoados/);
    expect(y!.descricao).toMatch(/Possessão Demoníaca/);
    expect(y!.descricao).not.toMatch(/magias de bruxa que você conhece/i);
    expect(y!.descricao).toMatch(/Possessão Demoníaca aumenta/);
  });

  it("extractAncestryLivro encontra seis oficiais na janela do livro", () => {
    const md = `
# Atributos

## ANÃO
Povo corajoso e robusto, tão resiliente quanto os reinos de pedra nas montanhas.

Você conhece Comum e Anão.

Robusto. +2 PV.

## ELFO
Povo etéreo e gracioso, que venera o conhecimento e a beleza nos bosques antigos.

Visão Aguçada. +1 em ataques à distância.

## GOBLIN
Criaturas verdes e espertas que prosperam em locais escuros e apertados.

Sentidos Apurados. Não pode ser surpreendido.

## HALFLING
Pequenos e alegres habitantes do campo, com personalidades travessas e coração leve.

Furtivo. Uma vez por dia, invisível por 3 rodadas.

## HUMANO
Povo corajoso, adaptável e diverso que aprende de forma rápida e realiza feitos poderosos.

Ambicioso. Rolagem de talento adicional no nível 1.

## MEIO-ORC
Guerreiros imponentes e com presas, implacáveis como os orcs e ousados como os humanos.

Poderoso. +1 em ataques corpo a corpo.

# Classe: Guerreiro
`;
    const { entradas } = extractAncestryLivro(md);
    expect(entradas.map((e) => e.nome)).toEqual([
      "ANÃO",
      "ELFO",
      "GOBLIN",
      "HALFLING",
      "HUMANO",
      "MEIO-ORC",
    ]);
  });
});
