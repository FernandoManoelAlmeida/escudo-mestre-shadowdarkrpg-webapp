#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  extractAntecedentesGuia,
  extractAntecedentesTableAfterMarker,
  toAntecedenteCatalogMd,
} = require("./catalogo-personagem-lib");

function readArg(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? path.resolve(args[i + 1]) : null;
}

function main() {
  const args = process.argv.slice(2);
  const guiaPath = readArg(args, "--guia");
  const cs1Path = readArg(args, "--cs1");
  const cs3Path = readArg(args, "--cs3");
  const astraldarkPath = readArg(args, "--astraldark");
  const outMd = readArg(args, "--out");

  if (!guiaPath || !cs1Path || !cs3Path || !astraldarkPath || !outMd) {
    console.error(
      "Uso: node extract-antecedentes-shadowdark.js --guia <Guia.md> --cs1 <CS1.md> --cs3 <CS3.md> --astraldark <Astraldark.md> --out <Antecedentes.md>",
    );
    process.exit(1);
  }

  let entradas = [];

  const guia = fs.readFileSync(guiaPath, "utf8");
  const fromGuia = extractAntecedentesGuia(guia, {
    idPrefix: "livro",
    origem: "Guia de Jogo Rapido pt-BR.md",
    fonte: "livro",
    lista: "Livro de Regras (d20)",
    rolagem: "d20",
  });
  entradas = entradas.concat(fromGuia);
  console.log("Guia:", fromGuia.length);

  const cs1 = fs.readFileSync(cs1Path, "utf8");
  const fromCs1 = extractAntecedentesTableAfterMarker(
    cs1,
    /###\s+ANTECEDENTE DIABÓLICO/i,
    {
      idPrefix: "diabolicos",
      origem: "Cursed Scroll 1 - Diabruras pt-BR.md",
      fonte: "cursed-scroll",
      lista: "Antecedentes diabólicos",
      rolagem: "d20",
      secondaryMarker: /# Antecedentes Diabólicos/i,
    },
  );
  entradas = entradas.concat(fromCs1);
  console.log("CS1:", fromCs1.length);

  const cs3 = fs.readFileSync(cs3Path, "utf8");
  const fromCs3 = extractAntecedentesTableAfterMarker(
    cs3,
    /###\s+ANTECEDENTE NÓRDICO/i,
    {
      idPrefix: "nordicos",
      origem: "Cursed Scroll 3 - Sol da Meia-Noite pt-BR.md",
      fonte: "cursed-scroll",
      lista: "Antecedentes nórdicos",
      rolagem: "d20",
      secondaryMarker: /# Antecedentes Nórdicos/i,
    },
  );
  entradas = entradas.concat(fromCs3);
  console.log("CS3:", fromCs3.length);

  const astral = fs.readFileSync(astraldarkPath, "utf8");
  const fromAstral = extractAntecedentesTableAfterMarker(
    astral,
    /###\s+Antecedentes a bordo \(d8\)/i,
    {
      idPrefix: "astral",
      origem: "Astraldark pt-BR.md",
      fonte: "astraldark",
      lista: "Antecedentes a bordo (d8)",
      rolagem: "d8",
      defaultDescricao: "Antecedente de personagem a bordo de uma nave astral.",
    },
  );
  entradas = entradas.concat(fromAstral);
  console.log("Astraldark:", fromAstral.length);

  const md = toAntecedenteCatalogMd(
    "Catálogo — Antecedentes",
    "Fonte: Livro (Guia) + Cursed Scroll 1 e 3 + Astraldark. Converse com o MJ para Vantagem situacional.",
    entradas,
  );
  fs.mkdirSync(path.dirname(outMd), { recursive: true });
  fs.writeFileSync(outMd, md, "utf8");
  console.log("Total:", entradas.length, "→", outMd);
}

if (require.main === module) main();
