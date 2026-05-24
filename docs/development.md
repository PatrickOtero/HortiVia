# Desenvolvimento local

## Aplicativo mobile

Instalação:

```bash
npm install
```

Configuração da API:

- ajuste `API_BASE_URL` em `src/config/apiConfig.ts`
- use a URL remota correta para testes de release
- evite `localhost` e IP local em builds distribuídos

Execução em Android:

```bash
npm start
npm run android
```

Validação:

```bash
npm run lint
npm run typecheck
npm test
```

Build Android:

```bash
cd android
gradlew.bat assembleRelease
gradlew.bat bundleRelease
```

Artefatos:

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

Assinatura:

- `HORTIVIA_RELEASE_STORE_FILE`
- `HORTIVIA_RELEASE_STORE_PASSWORD`
- `HORTIVIA_RELEASE_KEY_ALIAS`
- `HORTIVIA_RELEASE_KEY_PASSWORD`

Se essas propriedades não forem fornecidas, o build de release usa assinatura de debug para testes internos controlados.

## Backend

As instruções técnicas da API estão em https://github.com/PatrickOtero/HortiVia-API/blob/main/docs/backend-setup.md.
