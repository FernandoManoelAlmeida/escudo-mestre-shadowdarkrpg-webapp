import { assetUrl } from "@/lib/basePath";

/** URLs absolutas para registo do SW (GitHub Pages e subpaths). */
export function getPwaServiceWorkerUrls(origin: string) {
  const scopeUrl = new URL(assetUrl("/"), origin).href;
  const swScriptUrl = new URL(assetUrl("/sw.js"), origin).href;
  return { scopeUrl, swScriptUrl };
}

export function isPwaDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEBUG_PWA === "1";
}
