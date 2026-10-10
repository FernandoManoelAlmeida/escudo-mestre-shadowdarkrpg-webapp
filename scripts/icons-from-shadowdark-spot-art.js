/**
 * Gera pwa-icon-source.png, logo WebP e favicon a partir de
 * public/icons/src/shadowdark-spot-art.svg (Spot Art Shadowdark).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const BG = { r: 14, g: 20, b: 25, alpha: 1 };
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "icons", "src", "shadowdark-spot-art.svg");

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error("SVG ausente:", svgPath);
    process.exit(1);
  }
  const svg = fs.readFileSync(svgPath);

  const pwaSource = path.join(root, "public", "icons", "pwa-icon-source.png");
  await sharp(svg, { density: 300 })
    .resize(512, 512, { fit: "contain", background: BG })
    .png()
    .toFile(pwaSource);
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
    await sharp(pwaSource)
      .resize(size, size, { fit: "contain", background: BG })
      .webp({ quality: 90, effort: 6 })
      .toFile(out);
    console.log("OK", out);
  }

  for (const size of [192, 512]) {
    const out = path.join(root, "public", "icons", `icon-${size}.png`);
    await sharp(pwaSource)
      .resize(size, size, { fit: "contain", background: BG })
      .png()
      .toFile(out);
    console.log("OK", out);
  }

  const favicon = path.join(root, "app", "favicon.ico");
  await sharp(pwaSource)
    .resize(48, 48, { fit: "contain", background: BG })
    .png()
    .toFile(favicon.replace(/\.ico$/, ".png"));
  const favPng = favicon.replace(/\.ico$/, ".png");
  if (fs.existsSync(favicon)) fs.unlinkSync(favicon);
  fs.renameSync(favPng, favicon);
  console.log("OK", favicon);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
