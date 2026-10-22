# Desenvolvimento local

## Aplicativo mobile

Instalação:

```bash
npm install
```

Configuração da API:

- o build `debug` usa `http://127.0.0.1:3001` por padrão, para execução local com `adb reverse`
- para usar uma API remota de desenvolvimento no `debug`, informe `HORTIVIA_DEBUG_API_URL` como propriedade Gradle; a URL precisa ser HTTPS e diferente da API de produção
- o build `release` continua usando a URL de produção já configurada
- o build Android `homolog` recebe sua URL exclusivamente por `HORTIVIA_HOMOLOG_API_URL`; exige HTTPS, rejeita o host de produção e não tem fallback para produção
- o endpoint remoto de desenvolvimento informado para este ambiente é `https://p01--oterofficia-backend--rfp2dvf84z2n.code.run`
- o aplicativo Android usa um sufixo `.homolog`, permitindo instalar o piloto ao lado da versão normal

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

APK Android de homologação (PowerShell, JDK 17):

```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
cd android
.\gradlew.bat assembleHomolog -PHORTIVIA_HOMOLOG_API_URL=https://p01--oterofficia-backend--rfp2dvf84z2n.code.run
```

O APK sai em `android/app/build/outputs/apk/homolog/app-homolog.apk`. A variante usa assinatura de debug para instalação controlada e não deve ser tratada como release de produção. O build falha se a URL aprovada não for HTTPS ou apontar para produção.

Para executar o app `debug` apontando temporariamente para essa API remota de desenvolvimento, use `-PHORTIVIA_DEBUG_API_URL=https://p01--oterofficia-backend--rfp2dvf84z2n.code.run` ao chamar `installDebug` ou `assembleDebug`. Sem essa propriedade, o app continua usando `127.0.0.1:3001`. O endereço remoto precisa ser HTTPS e não pode ser o host de produção.

## Backend

As instruções técnicas da API estão em https://github.com/PatrickOtero/HortiVia-API/blob/main/docs/backend-setup.md.
