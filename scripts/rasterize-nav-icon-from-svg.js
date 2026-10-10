/**
 * Rasteriza SVG de nav para WebP 512² — glifo branco em fundo transparente
 * (mesma aparência dos ícones antigos na barra, sem depender de filter: invert).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SIZE = 512;

async function svgToWhiteNavWebp(svgPath, outPath) {
  const svg = fs.readFileSync(svgPath);
  const raster = await sharp(svg, { density: 384 })
    .resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = raster;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 10) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  await sharp(data, { raw: info })
    .webp({ quality: 90, effort: 6 })
    .toFile(outPath);
}

async function blackWebpToWhite(inPath, outPath) {
  const { data, info } = await sharp(inPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 10) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  await sharp(data, { raw: info })
    .webp({ quality: 90, effort: 6 })
    .toFile(outPath);
}

async function main() {
  const root = path.join(__dirname, "..", "public", "icons");
  const src = path.join(root, "src");
  const pairs = [
    "itens-magicos-icon",
    "ameacas-icon",
    "geradores-icon",
  ];

  for (const name of pairs) {
    const svgPath = path.join(src, `${name}.svg`);
    const outPath = path.join(root, `${name}.webp`);
    if (!fs.existsSync(svgPath)) {
      console.error("SVG ausente:", svgPath);
      process.exitCode = 1;
      continue;
    }
    await svgToWhiteNavWebp(svgPath, outPath);
    console.log("OK", outPath);
  }

  for (const name of ["regras-icon", "home-icon"]) {
    const inPath = path.join(root, `${name}.webp`);
    const tmp = path.join(root, `${name}.webp.tmp`);
    await blackWebpToWhite(inPath, tmp);
    fs.renameSync(tmp, inPath);
    console.log("OK white", inPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
