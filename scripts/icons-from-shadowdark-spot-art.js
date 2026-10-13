/**
 * Gera pwa-icon-source.png, logo WebP e favicon a partir de
 * public/icons/src/shadowdark-spot-art.svg (Spot Art Shadowdark).
 * Ícones PWA: fundo preto, máscara circular (launcher redondo).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const BLACK = { r: 0, g: 0, b: 0, alpha: 1 };
/** Arte ocupa ~64% do diâmetro (margem dentro do círculo). */
const ART_INSET = 0.18;

const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "icons", "src", "shadowdark-spot-art.svg");

function circleMaskSvg(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`,
  );
}

/**
 * @param {Buffer} svg
 * @param {number} size
 * @returns {Promise<Buffer>}
 */
async function roundIconPng(svg, size) {
  const artPx = Math.round(size * (1 - ART_INSET * 2));
  const art = await sharp(svg, { density: 300 })
    .resize(artPx, artPx, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const plate = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BLACK,
    },
  })
    .composite([{ input: art, gravity: "center" }])
    .png()
    .toBuffer();

  return sharp(plate)
    .composite([{ input: circleMaskSvg(size), blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error("SVG ausente:", svgPath);
    process.exit(1);
  }
  const svg = fs.readFileSync(svgPath);

  const pwaSource = path.join(root, "public", "icons", "pwa-icon-source.png");
  const source512 = await roundIconPng(svg, 512);
  fs.writeFileSync(pwaSource, source512);
  console.log("OK", pwaSource);

  const logoWebp = path.join(root, "public", "logo-shadowdark-spot-art.webp");
  await sharp(svg, { density: 300 })
    .resize(700, 400, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 92, effort: 6 })
    .toFile(logoWebp);
  console.log("OK", logoWebp);

  const webpSizes = [
    [192, path.join(root, "public", "icons", "icon-192.webp")],
    [512, path.join(root, "public", "icons", "icon-512.webp")],
    [50, path.join(root, "public", "icons", "header-icon.webp")],
  ];
  for (const [size, out] of webpSizes) {
    const png = await roundIconPng(svg, size);
    await sharp(png).webp({ quality: 90, effort: 6 }).toFile(out);
    console.log("OK", out);
  }

  for (const size of [192, 512]) {
    const out = path.join(root, "public", "icons", `icon-${size}.png`);
    const png = await roundIconPng(svg, size);
    fs.writeFileSync(out, png);
    console.log("OK", out);
  }

  const favicon = path.join(root, "app", "favicon.ico");
  const favPng = favicon.replace(/\.ico$/, ".png");
  const fav48 = await roundIconPng(svg, 48);
  fs.writeFileSync(favPng, fav48);
  if (fs.existsSync(favicon)) fs.unlinkSync(favicon);
  fs.renameSync(favPng, favicon);
  console.log("OK", favicon);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
