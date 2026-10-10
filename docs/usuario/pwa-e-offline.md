# PWA e offline

## O que é PWA

A aplicação expõe um **manifest** de aplicação web e, em **produção**, pode registar um **service worker** para cachear recursos. Isso permite **instalar** o site como atalho (ecrã inicial ou janela própria) em Chrome, Edge, Safari (iOS com limitações) e outros.

## Instalar

- **Android / Chrome:** menu do navegador → **Instalar aplicação** ou banner de instalação, conforme o navegador.
- **Desktop Chrome:** ícone de instalação na barra de endereços quando disponível.
- **iOS Safari:** **Partilhar** → **Ecrã Inicial**.

O nome curto e ícones vêm do manifest configurado no projecto.

## Desenvolvimento vs. produção

- Em **`yarn dev`**, o PWA está **desactivado** (evita conflitos de cache durante desenvolvimento).
- Após **`yarn build`** e servir a pasta de saída estática, o comportamento de instalação e cache aplica-se como em produção.

## Cache e dados

- Ficheiros em **`/data/*.json`** são cacheados com estratégia orientada a leitura repetida (detalhes técnicos em [PWA e basePath](../desenvolvimento/pwa-e-basepath.md)).
- **Rolagens** são sempre **locais** ao navegador (não dependem de servidor).

## Nova versão disponível

Em produção, o componente de actualização compara `version.json` no servidor com um valor guardado em `localStorage`.

- Se houver **nova build**, aparece um aviso **“Nova versão disponível. Recarregue para atualizar.”**
- Ao tocar **Recarregar**, a app tenta limpar caches, desregistar o service worker e recarregar a página para servir o bundle novo.

Se algo correr mal após um deploy (por exemplo service worker antigo), consulte a secção de resolução de problemas em [Deploy GitHub Pages](../desenvolvimento/deploy-github-pages.md).

## Documentação relacionada

- [Visão geral](visao-geral.md)
- [PWA e basePath (desenvolvimento)](../desenvolvimento/pwa-e-basepath.md)
