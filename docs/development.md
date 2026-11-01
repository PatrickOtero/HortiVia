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

O APK mostra o nome **HortiVia Homolog** e usa o identificador `com.frutinavigator.homolog`, permitindo instalá-lo ao lado do aplicativo principal. Ele se conecta à URL HTTPS de homologação definida em `src/config/apiConfig.ts`, inclui o bundle JavaScript e não depende de Metro nem de `adb reverse`.

### Gerar e baixar pelo GitHub Actions

O workflow compila e publica o APK e `manifest.json` em Pull Requests **originados neste repositório** e direcionados a `develop`. Em PRs de forks, o job não publica artifacts instaláveis. A publicação também funciona em `workflow_dispatch` quando o disparo manual estiver habilitado.

O repositório tem `main` como branch padrão. O GitHub só habilita `workflow_dispatch` quando o arquivo do workflow existe na branch padrão. Como esta etapa não altera `main`, somente o **botão manual** permanece bloqueado. O APK pode ser baixado dos artifacts de runs de PRs internos, sem modificar a branch padrão.

Para baixar de um PR interno: abra o PR, clique no check **Validar e gerar APK de homologação**, acesse a execução no GitHub Actions e localize **Artifacts → `hortivia-homolog-<sha>`**. O `<sha>` de uma execução de PR pode identificar o commit de merge de teste, não o HEAD original da branch. Baixe o ZIP, extraia-o, confira `manifest.json` e SHA-256 e instale o APK somente em dispositivo de QA autorizado. Para execução manual futura: após disponibilizar o workflow na `main` mediante autorização separada, abra **Actions → Gerar APK HortiVia — Homologação → Run workflow** e selecione a branch. A assinatura debug serve somente para testes internos.

O workflow executa lint, TypeScript, Jest e `assembleHomolog`. Não usa segredos, não publica na Google Play e retém o artifact por 14 dias. A verificação do banco remoto e qualquer operação com escrita continuam fora do workflow.

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

### Perfis e aprendizado

O perfil está em Ajustes > Meu perfil e nos nomes/fotos de autores, comentaristas e participantes do ranking. A edição existente permite informar loja, função profissional, telefone, cidade e UF. E-mail e contato/localização ficam restritos ao titular e aos administradores pela API.

O ranking pode ser aberto por Meu aprendizado ou pelo perfil. O percentual mantém o cálculo existente: acertos sobre perguntas publicadas de produtos ativos, considerando a última tentativa da versão atual. Os selos são apenas identificação visual.

Administradores encontram a seleção/remoção de selo no perfil consultado; a ação usa a administração existente em `PATCH /users/:id`. Não há atribuição automática ou alteração de permissões.

Antes de disponibilizar esta versão, a API precisa receber a migração `20261027000000_user_profiles_and_badges` e os endpoints de perfil/ranking. A migração não foi aplicada a ambientes remotos nesta tarefa. Contratos e procedimento: `backend/docs/user-profiles.md`.

As instruções técnicas da API estão em https://github.com/PatrickOtero/HortiVia-API/blob/main/docs/backend-setup.md.
