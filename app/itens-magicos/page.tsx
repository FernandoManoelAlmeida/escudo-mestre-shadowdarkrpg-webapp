"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Compatibilidade: URL antiga → hub Arcanos (export estático não usa redirects do Next). */
export default function ItensMagicosRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/arcanos");
  }, [router]);
  return <p style={{ padding: 24 }}>Redirecionando para Arcanos…</p>;
}
