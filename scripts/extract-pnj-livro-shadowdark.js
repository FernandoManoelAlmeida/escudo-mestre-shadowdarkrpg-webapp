#!/usr/bin/env node
/** Extrai tabelas PNJ / rivais do Livro para Referências/Shadowdark/Tabelas/pnjs/ */
const fs = require("fs");
const path = require("path");

const { inferRolagemFromTable } = require("./infer-rolagem");

function writeTable(outPath, meta, headers, rows) {
  const rolagem = meta.rolagem || inferRolagemFromTable(headers, rows);
  const lines = [
    "---",
    `id: ${meta.id}`,
    `titulo: ${meta.titulo}`,
    `categoria: ${meta.categoria}`,
    `subcategoria: ${meta.subcategoria || "geral"}`,
    `rolagem: ${rolagem}`,
    "---",
    "",
    `# ${meta.titulo}`,
    "",
    "## Tabela",
    "",
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
    "",
  ];
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
}

function main() {
  const [livroPath, outDir] = process.argv.slice(2);
  if (!livroPath || !outDir) {
    console.error("Uso: node extract-pnj-livro-shadowdark.js <livro.md> <Tabelas/pnjs/>");
    process.exit(1);
  }
  const root = path.resolve(outDir);

  writeTable(path.join(root, "pnj-ancestralidade.md"), {
    id: "pnj-ancestralidade",
    titulo: "Ancestralidade do PNJ",
    categoria: "pnjs",
    subcategoria: "ancestralidade",
    rolagem: "d12",
  }, ["d12", "Ancestralidade"], [
    ["1–4", "Humano"],
    ["5–6", "Elfo"],
    ["7–8", "Anão"],
    ["9–10", "Halfling"],
    ["11", "Meio-orc"],
    ["12", "Goblin"],
  ]);

  writeTable(path.join(root, "pnj-idade.md"), {
    id: "pnj-idade",
    titulo: "Idade do PNJ",
    categoria: "pnjs",
    subcategoria: "idade",
    rolagem: "d8",
  }, ["d8", "Idade"], [
    ["1", "Adolescente"],
    ["2", "Jovem adulto"],
    ["3–4", "Adulto"],
    ["5–6", "Meia-idade"],
    ["7", "Idoso"],
    ["8", "Ancião"],
  ]);

  writeTable(path.join(root, "pnj-riqueza.md"), {
    id: "pnj-riqueza",
    titulo: "Riqueza do PNJ",
    categoria: "pnjs",
    subcategoria: "riqueza",
    rolagem: "d6",
  }, ["d6", "Riqueza"], [
    ["1", "Pobre"],
    ["2–3", "Padrão"],
    ["4–5", "Rico"],
    ["6", "Extravagante"],
  ]);

  writeTable(path.join(root, "pnj-caracteristicas.md"), {
    id: "pnj-caracteristicas",
    titulo: "Características do PNJ",
    categoria: "pnjs",
    subcategoria: "caracteristicas",
    rolagem: "d20",
  }, ["d20", "Aparência", "Trejeito", "Segredo"], [
    ["1", "Careca", "Cospe muito", "Oculta fugitivos"],
    ["2", "Robusto", "Sempre comendo", "Adora filhotes"],
    ["3", "Muito alto", "Se move rápido", "Incendiário"],
    ["4", "Marca de beleza", "Truques com cartas", "Em um culto religioso"],
    ["5", "Caolho", "Reza em voz alta", "É meio-demônio"],
    ["6", "Musculoso", "Apologético", "Furta sem precisar"],
    ["7", "Cicatriz no rosto", "Deixa coisas caírem", "Medo de tempestades"],
    ["8", "Esbelto", "Faz juramentos", "Guelras funcionais"],
    ["9", "Queixo fendido", "Sotaque raro", "É contrabandista"],
    ["10", "Frágil", "Se assusta facilmente", "É um lobisomem"],
    ["11", "Sobrancelhas grossas", "Esquecido", "Cheira mentiras"],
    ["12", "Tatuado", "Fala baixo", "Expulso de família rica"],
    ["13", "Seis dedos", "Fala alto", "Amigo do príncipe"],
    ["14", "Muito baixo", "Arrogante", "Explorador aposentado"],
    ["15", "Nariz grande", "Fuma cachimbo", "Basilisco mascote"],
    ["16", "Grisalho", "Impulsivo", "Identidade falsa"],
    ["17", "Chapéu largo", "Tem tremores", "Apaixonado pelo garçom"],
    ["18", "Dente de ouro", "Se move devagar", "Saiu da Guilda dos Ladrões"],
    ["19", "Cabelos trançados", "Escreve em um diário", "Foi aprendiz de um mago"],
    ["20", "Sua muito", "Faz trocadilhos", "Grande débito em apostas"],
  ]);

  writeTable(path.join(root, "pnj-nome-ancestralidade.md"), {
    id: "pnj-nome-ancestralidade",
    titulo: "Nome do PNJ por ancestralidade",
    categoria: "pnjs",
    subcategoria: "nome",
    rolagem: "d20",
  }, ["d20", "Anão", "Elfo", "Goblin", "Halfling", "Humano", "Orc"], [
    ["1", "Hera", "Sarenia", "Kog", "Myrtle", "Hesta", "Troga"],
    ["2", "Torin", "Ravos", "Dibbs", "Robby", "Matteo", "Boraal"],
    ["3", "Ginny", "Imeria", "Fronk", "Nora", "Rosalin", "Urgana"],
    ["4", "Gant", "Farond", "Irv", "Percy", "Endric", "Zoraal"],
    ["5", "Olga", "Isolden", "Squag", "Daisy", "Kiara", "Scalga"],
    ["6", "Dendor", "Kieren", "Mort", "Jolly", "Yao", "Krell"],
    ["7", "Ygrid", "Mirenel", "Vig", "Evelyn", "Corina", "Voraga"],
    ["8", "Pike", "Riarden", "Sticks", "Horace", "Rowan", "Morak"],
    ["9", "Sarda", "Allindra", "Gorb", "Willie", "Hariko", "Draga"],
    ["10", "Brigg", "Arlomas", "Yogg", "Gertie", "Ikam", "Sorak"],
    ["11", "Zorli", "Sylara", "Plok", "Peri", "Mariel", "Varga"],
    ["12", "Yorin", "Tyr", "Zrak", "Carlsby", "Jin", "Ulgar"],
    ["13", "Jorgena", "Rinariel", "Dent", "Nyx", "Hana", "Jala"],
    ["14", "Trogin", "Saramir", "Krik", "Kellan", "Lios", "Kresh"],
    ["15", "Riga", "Vedana", "Mizzo", "Fern", "Indra", "Zana"],
    ["16", "Barton", "Elindos", "Bort", "Harlow", "Remy", "Torvash"],
    ["17", "Katrina", "Ophelia", "Nabo", "Moira", "Nura", "Rokara"],
    ["18", "Egrim", "Cydaros", "Hink", "Sage", "Vakesh", "Gartak"],
    ["19", "Elsa", "Tiramel", "Bree", "Reenie", "Una", "Iskana"],
    ["20", "Orgo", "Varond", "Kreeb", "Wendry", "Nabilo", "Ziraak"],
  ]);

  writeTable(path.join(root, "pnj-ocupacao.md"), {
    id: "pnj-ocupacao",
    titulo: "Ocupação do PNJ",
    categoria: "pnjs",
    subcategoria: "ocupacao",
    rolagem: "d6",
  }, ["d6", "Anão", "Elfo", "Goblin", "Halfling", "Humano", "Orc"], [
    ["1", "Coveiro", "Carpinteiro", "Erudito", "Ferreiro", "Mercador", "Bruto"],
    ["2", "Coletor", "Fazendeiro", "Garçom", "Pedinte", "Guarda", "Xamã"],
    ["3", "Padeiro", "Cozinheiro", "Marinheiro", "Açougueiro", "Escriba", "Caçador"],
    ["4", "Chaveiro", "Sapateiro", "Frade", "Mercador", "Ferreiro", "Guerreiro"],
    ["5", "Minerador", "Caçador", "Ladrão", "Cozinheiro", "Clérigo", "Sacerdote"],
    ["6", "Ferreiro", "Mago", "Alquimista", "Ladrão", "Nobre", "Chefe"],
  ]);

  writeTable(path.join(root, "rival-nivel.md"), {
    id: "rival-nivel",
    titulo: "Nível dos exploradores rivais",
    categoria: "pnjs",
    subcategoria: "rivais",
    rolagem: "d6",
  }, ["d6", "Nível"], [
    ["1", "1"],
    ["2", "2"],
    ["3", "3"],
    ["4", "4"],
    ["5", "5"],
    ["6", "6"],
  ]);

  writeTable(path.join(root, "rival-renome.md"), {
    id: "rival-renome",
    titulo: "Renome do grupo rival",
    categoria: "pnjs",
    subcategoria: "rivais",
    rolagem: "d6",
  }, ["d6", "Renome"], [
    ["1", "Desconhecido"],
    ["2–3", "Conhecido localmente"],
    ["4–5", "Bem reconhecido"],
    ["6", "Extremamente famoso"],
  ]);

  writeTable(path.join(root, "rival-segredo.md"), {
    id: "rival-segredo",
    titulo: "Segredo do grupo rival",
    categoria: "pnjs",
    subcategoria: "rivais",
    rolagem: "2d6",
  }, ["2d6", "Segredo"], [
    ["2", "Traiu um juramento"],
    ["3–4", "Roubou/forjou identidades"],
    ["5–6", "Deve à Guilda dos Ladrões"],
    ["7–8", "Mapa de um grande tesouro"],
    ["9–11", "Sofrendo de uma maldição"],
    ["12", "Tem um patrono poderoso"],
  ]);

  console.log("PNJ tables written to", root);
}

if (require.main === module) main();
