/**
 * Build com NEXT_PUBLIC_COPYRIGHT_FREE=1: omite conteúdo fora da
 * Shadowdark RPG Third-Party License (FAQ TAL) e arte de terceiros.
 * Com a flag off, esse conteúdo fica visível e a home usa Mastershield.
 */
export function isCopyrightFree(): boolean {
  return process.env.NEXT_PUBLIC_COPYRIGHT_FREE === "1";
}
