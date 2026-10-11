import type { OrdenarSentido, SortOrderValue } from "@/lib/sortOrder";

export function encodeSortOrder(por: string, sentido: OrdenarSentido): string {
  return `${por}:${sentido}`;
}

export function decodeSortOrder(
  raw: string | null | undefined,
  fallback: SortOrderValue,
): SortOrderValue {
  if (!raw?.trim()) return fallback;
  const idx = raw.indexOf(":");
  if (idx < 0) return fallback;
  const por = raw.slice(0, idx);
  const sentido = raw.slice(idx + 1);
  if (sentido === "asc" || sentido === "desc") {
    return { por, sentido };
  }
  return fallback;
}

export function joinCsv(items: string[]): string {
  return items.filter(Boolean).join(",");
}

export function splitCsv(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseFilterValuesFromSearchParams(
  defaults: Record<string, string>,
  searchParams: URLSearchParams,
): Record<string, string> {
  const out = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const v = searchParams.get(key);
    if (v !== null) out[key] = v;
  }
  return out;
}

export function hasActiveFilters(
  defaults: Record<string, string>,
  current: Record<string, string>,
): boolean {
  for (const key of Object.keys(defaults)) {
    if ((current[key] ?? "") !== (defaults[key] ?? "")) return true;
  }
  return false;
}

export function buildQueryString(
  values: Record<string, string>,
  defaults: Record<string, string>,
): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(defaults)) {
    const v = values[key] ?? "";
    const def = defaults[key] ?? "";
    if (v && v !== def) params.set(key, v);
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
