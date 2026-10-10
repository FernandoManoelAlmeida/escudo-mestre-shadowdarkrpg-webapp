const fs = require("fs");
const path = require("path");

/** Resolve path no vault Fantasia (shadowdark vs Shadowdark). */
function resolveVaultPath(vaultRoot, ...segments) {
  const lower = path.join(vaultRoot, ...segments);
  if (fs.existsSync(lower)) return lower;

  const parts = [...segments];
  if (parts[0] === "Referências" && parts[1] === "shadowdark") {
    parts[1] = "Shadowdark";
    const cap = path.join(vaultRoot, ...parts);
    if (fs.existsSync(cap)) return cap;
  }
  return lower;
}

function shadowdarkRoot(vaultRoot) {
  const cap = path.join(vaultRoot, "Referências", "Shadowdark");
  const low = path.join(vaultRoot, "Referências", "shadowdark");
  if (fs.existsSync(cap)) return cap;
  if (fs.existsSync(low)) return low;
  return cap;
}

module.exports = { resolveVaultPath, shadowdarkRoot };
