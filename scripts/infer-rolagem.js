function normalizeDash(s) {
  return s.replace(/\u2013|\u2014/g, "-").trim();
}

function parseRangeCell(cell) {
  const raw = normalizeDash(cell);
  if (!raw) return null;
  if (/^\d{2}$/.test(raw) && raw === "00") return { min: 100, max: 100 };
  const plus = raw.match(/^(\d+)\+$/);
  if (plus) return { min: parseInt(plus[1], 10), max: 9999 };
  const range = raw.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    return {
      min: parseInt(range[1], 10),
      max: parseInt(range[2], 10),
    };
  }
  const single = raw.match(/^(\d+)$/);
  if (single) {
    const n = parseInt(single[1], 10);
    return { min: n, max: n };
  }
  return null;
}

function inferRolagemFromTable(headers, rows, explicit) {
  if (explicit && /(\d*)d(\d+)/i.test(explicit)) {
    const m = explicit.match(/(\d*)d(\d+)/i);
    const count = m[1] ? parseInt(m[1], 10) : 1;
    return `${count}d${m[2]}`;
  }
  const h = headers.join(" ").toLowerCase();
  if (h.includes("d100") || h.includes("1d100")) return "d100";

  let maxInCol = 0;
  let hasDoubleDigitRange = false;
  let has00 = false;
  for (const row of rows) {
    const range = parseRangeCell(row[0] ?? "");
    if (!range) continue;
    maxInCol = Math.max(maxInCol, range.max);
    if (range.min >= 20 || range.max >= 20) hasDoubleDigitRange = true;
    if ((row[0] ?? "").trim() === "00") has00 = true;
  }
  if (has00 || maxInCol > 20 || hasDoubleDigitRange) return "d100";

  if (/d20/i.test(h)) return "d20";
  if (/d12/i.test(h)) return "d12";
  if (/d8/i.test(h)) return "d8";
  if (/d6/i.test(h)) return "d6";
  if (/d4/i.test(h)) return "d4";

  const n = rows.length;
  if (n === 4) return "d4";
  if (n <= 6) return "d6";
  if (n <= 8) return "d8";
  if (n <= 12) return "d12";
  return "d20";
}

module.exports = { inferRolagemFromTable, parseRangeCell };
