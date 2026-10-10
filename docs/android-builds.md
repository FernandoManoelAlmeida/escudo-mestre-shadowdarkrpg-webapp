# Build Android (APK)

O projeto suporta duas formas de gerar um APK Android, cada uma com um comando próprio.

## Requisitos comuns

- **Java (JDK)** — obrigatório para o Gradle (build Android). Se aparecer _"Unable to locate a Java Runtime"_:
  - **macOS (Homebrew):** `brew install openjdk@17` e siga a mensagem para vincular (ex.: `sudo ln -sfn $(brew --prefix)/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk`).
  - Ou instale [Android Studio](https://developer.android.com/studio) — ele traz um JDK embutido; o Gradle costuma usá-lo automaticamente.
- **Android SDK** — necessário para compilar o APK (instalado com o Android Studio ou só a [command-line tools](https://developer.android.com/studio#command-tools)).
- **Node.js** — para os scripts do projeto.

## 1. TWA (Trusted Web Activity) — Bubblewrap

Empacota a **PWA publicada em HTTPS** em um APK. O app abre a URL em um WebView de confiança (Chrome).

- **Primeira vez:** `yarn build:android:twa:init`  
  (defina `MANIFEST_URL=https://seu-dominio.com/manifest.json` ou informe quando solicitado.)
- **Gerar APK:** `yarn build:android:twa`

Detalhes em [android-twa/README.md](../android-twa/README.md).

## 2. Capacitor — WebView com export estático

Gera um **export estático** do Next.js e empacota no projeto Android do Capacitor. O app funciona offline com os dados embutidos.

- **Primeira vez:** `yarn build:android:capacitor:init`  
  (cria o projeto Android em `android/` e configura `out/` como `web-dir`.)
- **Gerar APK:** `yarn build:android:capacitor`

Requisitos: os [requisitos comuns](#requisitos-comuns) acima. O build de release usa o keystore configurado no projeto Android (ou o debug por padrão).

## Troubleshooting

### "PKIX path building failed" / "unable to find valid certification path"

O Gradle não consegue baixar a distribuição de `services.gradle.org` porque o Java não confia no certificado SSL. Alternativas:

1. **Usar o JDK do Android Studio** — costuma ter o truststore atualizado. Defina `JAVA_HOME` apontando para o JDK embutido, por exemplo:
   - macOS: `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"` (ou `jre` em versões antigas). Depois rode o build de novo.

2. **Build pelo Android Studio (sem usar o terminal para o Gradle)** — evita o problema no seu ambiente:
   - **Capacitor:** rode `yarn build:android:capacitor` até o passo que falha (o `out/` já estará pronto). Abra a pasta `android/` no Android Studio, depois **File → Sync Project with Gradle Files** e **Build → Build Bundle(s) / APK(s) → Build APK(s)**. O IDE usa o próprio JDK e rede.
   - **TWA:** abra a pasta `android-twa/` no Android Studio e use **Build → Build Bundle(s) / APK(s) → Build APK(s)**. O APK sai em `android-twa/app/build/outputs/apk/`.

3. **Atualizar certificados no OpenJDK (Homebrew):** `brew reinstall ca-certificates` e reiniciar o terminal. Se ainda falhar, reinstale o JDK: `brew reinstall openjdk@17`.

4. **Importar CAs do sistema no Java (macOS):** o Keychain do macOS tem os certificados. Você pode importar os CAs confiáveis no `cacerts` do JDK com `keytool`. Ex.: listar CAs do Keychain e importar no `$JAVA_HOME/lib/security/cacerts`. Há scripts na internet (ex.: “import mac keychain certs into java cacerts”) que automatizam isso.

5. **Rede corporativa / proxy:** pode ser necessário importar o certificado da CA corporativa no truststore do Java (`keytool -importcert ...` no `cacerts` do JDK). Consulte o time de TI ou a documentação do proxy.

6. **Baixar o Gradle manualmente (avançado):** baixe no navegador o zip da distribuição (ex.: [gradle-8.11.1-all.zip](https://services.gradle.org/distributions/gradle-8.11.1-all.zip)) e coloque em `~/.gradle/wrapper/dists/gradle-8.11.1-all/<hash>/`, onde `<hash>` é o diretório que o Gradle cria na primeira tentativa de download (rode o build uma vez para a pasta ser criada; depois coloque o zip nela e rode de novo). A versão exata (8.11.1) pode variar — confira em `android/gradle/wrapper/gradle-wrapper.properties` ou em `android-twa/gradle/wrapper/gradle-wrapper.properties` em `distributionUrl`.
