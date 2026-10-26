# Desenvolvimento

## Aplicativo mobile

Instale as dependências com `npm install`.

### URLs da API

- `debug` usa a API remota de desenvolvimento: `https://p01--oterofficia-backend--rfp2dvf84z2n.code.run`.
- `homolog` usa a mesma API remota de desenvolvimento: `https://p01--oterofficia-backend--rfp2dvf84z2n.code.run`.
- `release` usa exclusivamente a API de produção: `https://p01--frutinavigator--h2j28jgg9qgs.code.run`.

As três URLs estão centralizadas em `src/config/apiConfig.ts`. O módulo nativo Android informa somente o identificador da variante (`development`, `homolog` ou `production`). Não passe URLs por propriedades Gradle.

Para iniciar o app Android em debug:

```bash
npm start
npm run android
```

Para validar o código:

```bash
npm run lint
npm run typecheck
npm test
```

## Builds Android

Na pasta `android`, gere os builds com:

```powershell
.\gradlew.bat assembleHomolog
.\gradlew.bat assembleRelease
.\gradlew.bat bundleRelease
```

O APK de homologação fica em `android/app/build/outputs/apk/homolog/app-homolog.apk`. A variante `homolog` usa assinatura de debug para instalação controlada e não deve ser tratada como release de produção.

Artefatos de produção:

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Assinatura de release

Configure estas propriedades Gradle para assinar oficialmente o build de produção:

- `HORTIVIA_RELEASE_STORE_FILE`
- `HORTIVIA_RELEASE_STORE_PASSWORD`
- `HORTIVIA_RELEASE_KEY_ALIAS`
- `HORTIVIA_RELEASE_KEY_PASSWORD`

Sem essas propriedades, `release` usa assinatura de debug para testes internos controlados.

## Backend

As instruções técnicas da API estão em https://github.com/PatrickOtero/HortiVia-API/blob/main/docs/backend-setup.md.
