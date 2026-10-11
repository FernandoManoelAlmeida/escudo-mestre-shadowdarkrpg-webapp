import { describe, expect, it } from "vitest";
import {
  cleanCatalogoSectionBody,
  normalizeClassTalentSectionTitle,
  repairTalentTableMarkdown,
  splitCatalogoMarkdownSections,
  stripKnownSpellsBlockFromClassSection,
  stripTalentEpigraphs,
} from "../lib/catalogoMarkdown";

describe("cleanCatalogoSectionBody", () => {
  it("remove --- finais sem tocar tabela GFM", () => {
    const body = "texto\n\n---\n\n---";
    expect(cleanCatalogoSectionBody(body)).toBe("texto");
    const table = "| a | b |\n| --- | --- |\n| 1 | 2 |";
    expect(cleanCatalogoSectionBody(table)).toBe(table);
  });
});

describe("repairTalentTableMarkdown", () => {
  it("repara linha bardo sem pipe central", () => {
    const broken = "| 3-6 +1 para Corpo a corpo |\n| 7-9 | ok |";
    const fixed = repairTalentTableMarkdown(broken);
    expect(fixed).toContain("| 3-6 | +1 para Corpo a corpo |");
  });
});

describe("stripKnownSpellsBlockFromClassSection", () => {
  it("corta em MAGIAS DE BRUXA CONHECIDAS", () => {
    const body = "| 12 | fim |\n\n### MAGIAS DE BRUXA CONHECIDAS\n\nlixo";
    expect(stripKnownSpellsBlockFromClassSection(body)).not.toContain("MAGIAS DE BRUXA");
  });
});

describe("normalizeClassTalentSectionTitle", () => {
  it("normaliza talentos de classe exceto Lótus Negra", () => {
    expect(normalizeClassTalentSectionTitle("Talentos de GUERREIRO")).toBe(
      "Talentos",
    );
    expect(normalizeClassTalentSectionTitle("TALENTOS DE CAVALEIRO DE SÃO YDRIS")).toBe(
      "Talentos",
    );
    expect(normalizeClassTalentSectionTitle("Talentos de Lótus Negra")).toBe(
      "Talentos de Lótus Negra",
    );
  });
});

describe("stripTalentEpigraphs", () => {
  it("remove epígrafe antes da tabela em talentos", () => {
    const body = `### “Nenhuma melodia é mais doce do que o assovio de um machado!”

| d12 | Resultado |
| --- | --- |
| 2 | ok |`;
    expect(stripTalentEpigraphs(body).trimStart()).toMatch(/^\| d12 \|/);
  });

  it("não remove subtítulo mecânico em herbalismo", () => {
    const body = `### Remédio herbal

| CD | Efeito |
| --- | --- |
| 12 | cura |`;
    expect(stripTalentEpigraphs(body)).toContain("Remédio herbal");
  });
});

describe("splitCatalogoMarkdownSections — SD2", () => {
  it("guerreiro talentos sem epígrafe e título Talentos", () => {
    const raw = `## Talentos de GUERREIRO

### “Nenhuma melodia é mais doce do que o assovio de um machado!”

| d12 | Resultado |
| --- | --- |
| 12 | fim |`;
    const { sections } = splitCatalogoMarkdownSections(raw, "classe");
    const t = sections.find((s) => s.title === "Talentos");
    expect(t?.body).not.toContain("###");
    expect(t?.body).toMatch(/^\| d12 \|/m);
  });

  it("ladrao talentos completos", () => {
    const raw = `## Talentos de LADRÃO

| d12 | Resultado |
| --- | --- |
| 2 | iniciativa |
| 3–5 | apunhalada |
| 12 | fim |`;
    const { sections } = splitCatalogoMarkdownSections(raw, "classe");
    const t = sections.find((s) => s.title === "Talentos");
    expect(t?.body).toContain("| 12 |");
    expect(t?.body).toContain("apunhalada");
  });

  it("basilisco sem tabela d20", () => {
    const raw = `## Talentos do Guerreiro Basilisco

| d12 | Resultado |
| --- | --- |
| 2 | ovo de basilisco |
| 12 | fim |`;
    const { sections } = splitCatalogoMarkdownSections(raw, "classe");
    const t = sections.find((s) => s.title === "Talentos");
    expect(t?.body).not.toContain("| d20 |");
    expect(t?.body).toContain("ovo");
  });

  it("lutador 2d6 única tabela", () => {
    const raw = `## Talentos

| 2d6 | Resultado |
| --- | --- |
| 2 | ignore dano |
| 12 | fim |`;
    const { sections } = splitCatalogoMarkdownSections(raw, "classe");
    const t = sections.find((s) => s.title === "Talentos");
    expect(t?.body).toContain("| 2d6 |");
    expect(t?.body).not.toContain("| d6 |");
  });

  it("ras-godai mantém Lótus Negra separada", () => {
    const raw = `## Talentos

| 2d6 | Resultado |
| --- | --- |
| 3–6 | lótus |

---

## Talentos de Lótus Negra

| 2d6 | Resultado |
| --- | --- |
| 2 | triplo |`;
    const { sections } = splitCatalogoMarkdownSections(raw, "classe");
    expect(sections.filter((s) => s.title === "Talentos")).toHaveLength(1);
    expect(
      sections.some((s) => s.title === "Talentos de Lótus Negra"),
    ).toBe(true);
  });

  it("warlock patrono unificado (lore + 2d6 no mesmo cartão)", () => {
    const raw = `## Almazzat

Um arquidemônio.

Resultado **2** duplicado = **+1 uso/dia**.

| 2d6 | Efeito |
| --- | --- |
| 2 | vantagem |
| 12 | fim |

## Talentos

| 2d6 | Resultado |
| --- | --- |
| 3–6 | stats |
| 12 | fim |`;
    const { sections } = splitCatalogoMarkdownSections(raw, "classe");
    expect(sections.some((s) => s.title.startsWith("Dádivas"))).toBe(false);
    const patron = sections.find((s) => s.title === "Almazzat");
    expect(patron?.body).toContain("| 2d6 |");
    const tal = sections.find((s) => s.title === "Talentos");
    expect(tal?.body).toContain("| 3–6 |");
  });

  it("talentos corta sufixo após | 12 | (sem sub-tabela d6)", () => {
    const raw = `## Talentos

Ao ganhar um talento de nível, role **2d6** na tabela abaixo.

| 2d6 | Resultado |
| --- | --- |
| 2 | montaria universal |
| 12 | fim |

### Sub-tabela (resultado 2 do 2d6)

| d6 | Resultado |
| --- | --- |
| 2 | legado |`;
    const { sections } = splitCatalogoMarkdownSections(raw, "classe");
    const t = sections.find((s) => s.title === "Talentos");
    expect(t?.body).toContain("| 12 |");
    expect(t?.body).not.toContain("| d6 |");
    expect(t?.body).not.toContain("Sub-tabela");
  });

  it("ydris conjuração com tabela 3 graus", () => {
    const raw = `## Conjuração

Regras.

| Nível | 1º grau | 2º grau | 3º grau |
| --- | --- | --- | --- |
| 3 | 1 | — | — |
| 10 | 3 | 3 | 2 |`;
    const { sections } = splitCatalogoMarkdownSections(raw, "classe");
    const conj = sections.find((s) => /^conjuração$/i.test(s.title));
    expect(conj?.body).toContain("| 3 | 1 | — | — |");
    expect(conj?.body).toContain("| 10 | 3 | 3 | 2 |");
  });
});

describe("splitCatalogoMarkdownSections — mago", () => {
  const magoDesc = `## Conjuração

Regras.

Magias Conhecidas por Grau de Magia

Nível12345

13----

24----

## Talentos de MAGO

| d12 | Resultado |
| --- | --- |
| 2 | item |
| 3–7 | stat |
| 12 | fim |`;

  it("conjuração com tabela GFM reparada", () => {
    const { sections } = splitCatalogoMarkdownSections(magoDesc, "classe");
    const conj = sections.find((s) => /conjuração/i.test(s.title));
    expect(conj?.body).toContain("| Nível | 1º grau |");
    expect(conj?.body).not.toContain("Nível12345");
  });
});
