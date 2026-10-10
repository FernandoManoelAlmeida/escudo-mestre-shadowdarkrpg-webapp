# Android (opcional)

Este repositório inclui scripts e pastas para empacotar a Web **como aplicação Android** de formas alternativas. Não faz parte do fluxo mínimo de “site em GitHub Pages”.

## Scripts no `package.json`

| Script | Notas |
|--------|--------|
| `build:android:twa:init` | `node scripts/init-twa.js` |
| `build:android:twa` | Bubblewrap na pasta `android-twa/` |
| `build:capacitor` | `BUILD_ANDROID_CAPACITOR=1 next build --webpack` (export; PWA desactivado para este alvo) |
| `build:android:capacitor:init` | Primeiro build Capacitor + `cap init` + `cap add android` |
| `build:android:capacitor` | `cap sync` + `cap build android` |

## Pastas

- `android/` — projecto Android (quando presente no repo).
- `android-twa/` — fluxo TWA com Bubblewrap (`npx @bubblewrap/cli`).

Para detalhes de assinatura, Play Console e requisitos legais de ícone/splash, siga a documentação oficial do **Bubblewrap** / **Capacitor** e as políticas da loja.

## Documentação relacionada

- [Build e testes](build-e-testes.md) — export estático partilhado com Capacitor
- [PWA e basePath](pwa-e-basepath.md)
