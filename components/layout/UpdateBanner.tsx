"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { assetUrl } from "@/lib/basePath";

const APP_VERSION_KEY = "app-version";

const Bar = styled.div`
  position: fixed;
  top: calc(var(--header-height, 124px) + ${({ theme }) => theme.spacing.xs});
  left: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderHighlight};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 99;
`;

const Text = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`;

const Button = styled.button`
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  min-height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: 600;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

interface VersionJson {
  buildId?: string;
  generatedAt?: string;
}

export default function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV === "development"
    )
      return;

    /** Query string evita resposta do precache/runtime do SW (fetch `no-store` não contorna o SW). */
    const versionFetchUrl = () =>
      `${assetUrl("/version.json")}?t=${Date.now()}`;

    const checkVersion = async () => {
      try {
        const res = await fetch(versionFetchUrl(), { cache: "no-store" });
        if (!res.ok) return;
        const data: VersionJson = await res.json();
        const serverBuildId = data.buildId ?? data.generatedAt ?? null;
        if (serverBuildId == null) return;

        const stored = localStorage.getItem(APP_VERSION_KEY);
        if (stored === null) {
          localStorage.setItem(APP_VERSION_KEY, serverBuildId);
          setShowBanner(false);
          return;
        }
        if (stored !== serverBuildId) {
          setShowBanner(true);
        } else {
          setShowBanner(false);
        }
      } catch {
        // ignore
      }
    };

    /** URLs absolutas evitam resolução errada do script em subpaths (ex.: GitHub Pages). */
    const scopeUrl = new URL(assetUrl("/"), window.location.origin).href;
    const swScriptUrl = new URL(assetUrl("/sw.js"), window.location.origin)
      .href;

    void navigator.serviceWorker
      .register(swScriptUrl, { scope: scopeUrl })
      .then(async (reg) => {
        try {
          await reg.update();
        } catch {
          /* Falha ao verificar atualização (404, rede): evita Uncaught; SW existente pode continuar. */
        }
        await checkVersion();
      })
      .catch(() => {
        /* sw.js em falta ou contexto não seguro — não quebrar a app */
        void checkVersion();
      });

    /**
     * Não usar `controllerchange` para abrir o banner: dispara ao registar/ativar o SW
     * (incluindo após reload), o que faz a mensagem voltar mesmo com a versão já alinhada.
     * A comparação com `version.json` + localStorage é a fonte de verdade.
     */
    const intervalId = setInterval(checkVersion, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleReload = async () => {
    try {
      if ("caches" in window && window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* ignora — ainda tentamos desregistar o SW */
    }
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) await reg.unregister();
    localStorage.removeItem(APP_VERSION_KEY);
    window.location.reload();
  };

  if (!showBanner) return null;

  return (
    <Bar role="dialog" aria-live="polite" aria-label="Atualização disponível">
      <Text>Nova versão disponível. Recarregue para atualizar.</Text>
      <Button type="button" onClick={handleReload}>
        Recarregar
      </Button>
    </Bar>
  );
}
