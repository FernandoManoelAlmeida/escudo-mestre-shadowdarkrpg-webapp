import { fetchCatalogoJson } from "@/lib/catalogoPersonagem";

export type RegraHomebrew = {
  id: string;
  nome: string;
  descricao: string;
  fonte?: string;
  origem?: string;
};

export async function getRegrasHomebrew(): Promise<RegraHomebrew[]> {
  const data = await fetchCatalogoJson<{ regras: RegraHomebrew[] }>(
    "/data/catalogo/regras-homebrew.json",
  );
  return data?.regras ?? [];
}

export async function getRegraHomebrewById(id: string): Promise<RegraHomebrew | null> {
  const regras = await getRegrasHomebrew();
  return regras.find((r) => r.id === id) ?? null;
}
