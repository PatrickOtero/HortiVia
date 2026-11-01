# HortiVia — Homologação Android e prontidão operacional

**Data da verificação:** 1º de novembro de 2026
**Frontend:** `chore/android-homologation-readiness`, base `develop` em `fbbfff8f9a15edc47c74f2c3e280c395204fc053`
**Backend:** `chore/api-homologation-readiness`, base `develop` em `433a2ef93e73c7314ebc1319eda1b475ed4006e6`

## Parecer

**Não apto para piloto operacional ainda.** O APK homolog foi compilado e distinguido visualmente do aplicativo principal. A API responde ao health check, mas o isolamento do banco e do R2 não foi comprovado; a rota `/health` não consulta PostgreSQL. Também falta instalar e percorrer os fluxos em um aparelho cuja finalidade de teste esteja confirmada. Não foi feita escrita remota, migration remota ou operação no R2.

## Ambientes e segurança

| Variante | Configuração observada | Estado |
|---|---|---|
| Android `debug` | `HORTIVIA_API_ENVIRONMENT=development`; a URL centralizada em `src/config/apiConfig.ts` é HTTPS | Inspecionado; build Android debug não foi solicitado |
| Android `homolog` | `HORTIVIA_API_ENVIRONMENT=homolog`; resolve para `https://p01--oterofficia-backend--rfp2dvf84z2n.code.run`; tráfego HTTP em claro desativado | Validado no código e no APK local |
| Android `release` | `HORTIVIA_API_ENVIRONMENT=production`; resolve para a URL de produção presente na configuração central | Inspecionado; nenhum build ou acesso de produção realizado |

`homolog` usa `applicationId` `com.frutinavigator.homolog`, nome visível **HortiVia Homolog**, versão `0.1.0-homolog` e assinatura de debug. Pode coexistir com o aplicativo principal; esta assinatura é somente para teste, não é a assinatura oficial de distribuição. A variante inclui `assets/index.android.bundle` e não precisa de Metro nem de `adb reverse`.

**Isolamento da API/banco/R2: BLOQUEADO — ISOLAMENTO NÃO COMPROVADO.** A configuração do app aponta para o serviço HTTPS acima, mas não há acesso verificável às configurações do provedor que demonstre qual banco e bucket a instância usa ou que esses recursos sejam distintos de produção. O nome de uma URL, serviço ou banco não prova isolamento. Não foi lido conteúdo de produtos/artigos e não foram testadas rotas de escrita.

Foi feita somente a leitura `GET /health`: **HTTP 200**, corpo `{"status":"ok","app":"HortiVia API"}`. O controller chama um método que apenas retorna estado estático do processo; a resposta não comprova conectividade PostgreSQL, migrations, bucket R2 ou isolamento.

## APK local

- Build: `.\gradlew.bat --no-daemon :app:assembleHomolog` em `android` — **APROVADO**, `BUILD SUCCESSFUL`.
- Arquivo: `C:\dev\Frutinavigator\FrutiNavigator\android\app\build\outputs\apk\homolog\app-homolog.apk`.
- Tamanho: **27.549.461 bytes**.
- SHA-256: `27c8a2774be1b5e394bec5c8e70a78839416caaa172e27eabb5584fa0be7f167`.
- Identidade verificada com Android Build Tools: `com.frutinavigator.homolog`, código `1`, versão `0.1.0-homolog`, rótulo `HortiVia Homolog`.
- Assinatura verificada: certificado `Android Debug`; APK não é uma release de produção assinada oficialmente.
- Bundle verificado no APK e no diretório gerado: `android/app/build/generated/assets/react/homolog/index.android.bundle` (**2.377.140 bytes**).
- Configuração nativa gerada contém `HORTIVIA_API_ENVIRONMENT = "homolog"`; manifest merged contém `usesCleartextTraffic="false"`.

O APK local pode ser instalado com `adb install -r "C:\dev\Frutinavigator\FrutiNavigator\android\app\build\outputs\apk\homolog\app-homolog.apk"`, após confirmar que o dispositivo e os dados/sessão nele são de QA. Não executei esse comando: há um Samsung SM-M236B visível no ADB por conexão de rede, mas não foi possível comprovar que o dispositivo e sua sessão pertencem ao ambiente de teste. Nenhum app foi removido nem alterado.

## Workflow para gerar e baixar o APK

Foi adicionado `.github/workflows/android-homolog.yml`. Em Pull Requests para `develop`, ele usa Node 22 e JDK 17, `npm ci`, lint, typecheck, Jest e `:app:assembleHomolog`, e verifica o bundle/APK. Em `workflow_dispatch`, também gera SHA-256 e manifesto, e publica APK + `manifest.json` como artifact por 14 dias. Actions estão fixadas em SHAs; as permissões do token são somente `contents: read`. Não há credenciais nem etapa de deploy/loja.

**Limitação de disponibilidade do botão manual:** a branch padrão do repositório é `main`. O GitHub exige que o YAML já exista na branch padrão para aceitar `workflow_dispatch`; esta etapa proíbe alterar `main`. Portanto, o PR pode validar a compilação Android, mas o botão manual e o artifact baixável só ficam disponíveis após uma mudança futura autorizada que disponibilize o workflow em `main`. Não foi criado artifact remoto; não existe link de download GitHub nesta etapa.

## Migration e backend

A migration `20261031000000_presigned_upload_tracking` é aditiva: cria enums e a tabela de intenções, índices únicos/consultas e FK para usuário; não atualiza conteúdo preexistente. A CI PostgreSQL 16 existente executa `prisma migrate deploy` em banco vazio e repete a operação, verificando o histórico. O CI do PR #12 já registrou sucesso com aplicação e reaplicação, além dos testes de integração PostgreSQL obrigatórios (run [41263867490](https://github.com/PatrickOtero/HortiVia-API/actions/runs/41263867490)). Isso comprova o comportamento em PostgreSQL descartável, não o estado do banco remoto.

O Docker local não está disponível nesta máquina, por isso a migration não foi repetida localmente nesta etapa. Não foram executadas migration, seed ou reconciliação no Northflank, Supabase ou qualquer banco remoto. Antes de homologar: identificar no painel a configuração real do serviço, provar que banco e bucket são QA separados, confirmar backup, versão implantada e migration pendente, e aprovar explicitamente a operação no alvo identificado. Interromper se alvo, backup ou histórico de migration forem ambíguos ou se houver drift.

## Validação executada

| Verificação | Resultado | Evidência/limitação |
|---|---|---|
| Frontend `npm ci` | APROVADO | Instalou lockfile; npm reportou 46 avisos (7 low, 39 moderate), sem alteração de dependências |
| `npm run lint` | APROVADO | Exit code 0 |
| `npm run typecheck` | APROVADO | Exit code 0 |
| `npm test -- --runInBand` | APROVADO COM LIMITE | 416 testes passaram; 1 teste e 1 suíte foram skipped, já existentes; nenhum skip novo foi adicionado |
| `:app:assembleHomolog` | APROVADO | APK, bundle, applicationId, label, versão, assinatura de debug e cleartext policy verificados |
| API `GET /health` | APROVADO (somente processo) | HTTP 200; não testa o banco |
| Isolamento remoto de banco/R2 | BLOQUEADO | Configuração do provedor não acessível/verificável; nenhuma operação com escrita executada |
| Migration em PostgreSQL descartável | APROVADO EM CI ANTERIOR | CI backend do PR #12 aplicou e reaplicou migrations em PostgreSQL 16; teste local bloqueado por Docker indisponível |
| Instalação e uso manual no Android | PENDENTE | ADB detecta Samsung SM-M236B, mas finalidade/conta de QA não confirmadas; nenhuma instalação feita |
| CI Android do PR | APROVADO | Run [41332067510](https://github.com/PatrickOtero/HortiVia/actions/runs/41332067510): lint, typecheck, Jest, `assembleHomolog` e verificação do APK/bundle passaram; upload foi pulado no evento PR |
| Workflow manual/artifact GitHub | BLOQUEADO | `workflow_dispatch` requer arquivo em `main`, branch padrão que não pode ser alterada nesta tarefa |
| GitGuardian | APROVADO | Check do commit final: [124924062569](https://github.com/PatrickOtero/HortiVia/runs/124924062569) |

Build apresentou avisos de APIs/dependências Android deprecated e aviso do Gradle sobre compatibilidade futura com Gradle 10. Não impediram a compilação e não foram alterados nesta etapa.

A primeira execução do workflow Android falhou porque o wrapper `gradlew` não tem bit executável no Git (`Permission denied` em Linux). A chamada foi corrigida para `bash ./gradlew`; o run seguinte acima passou. A CI geral do commit final passou no run [41332067606](https://github.com/PatrickOtero/HortiVia/actions/runs/41332067606).

## Ficha para homologação por funcionários

Executar somente depois de comprovar o isolamento e disponibilizar contas/dispositivos QA. Para cada linha, registrar resultado observado, conclusão, gravidade e evidência sem incluir senha, token, e-mail pessoal ou informação de cliente.

| Área / objetivo | Passos e resultado esperado | Estado atual / evidência |
|---|---|---|
| Instalação e início | Instalar em QA sem remover o app principal; abrir sem Metro; ver nome `HortiVia Homolog` | PENDENTE — aparelho QA não confirmado |
| Autenticação | Cadastro, confirmação, login, logout, recuperação, sessão persistida/expirada e reinício | PENDENTE manual; automatizado parcialmente coberto pelos testes frontend |
| Catálogo no setor | Localizar produto, pesquisar, filtrar, abrir detalhe e voltar; confirmar guias e imagens | PENDENTE manual |
| Artigos | Listar e abrir artigo; percorrer blocos, imagens, autor, selo; testar comentário/reação/salvo | PENDENTE manual |
| Treinamento | Responder opções corretas/incorretas; conferir feedback, progresso, ranking e repetição | PENDENTE manual |
| Administração | Confirmar acesso admin e bloqueio de usuário comum; testar criação/edição apenas com conteúdo sintético | BLOQUEADO até isolamento comprovado e autorização explícita de escrita |
| Rede instável | Alternar Wi-Fi/dados; testar offline, lentidão, timeout e API indisponível; confirmar mensagem e retry | PENDENTE manual |
| Sessão/erros | Verificar HTTP 401/403/500 e retomada após segundo plano/reinício | PENDENTE manual; alguns cenários automatizados |
| Uso de loja | Repetir consulta rápida de escolha, deterioração, conservação e imagens com pouco tempo | PENDENTE com funcionários QA/autorizados |

Registrar para cada execução: objetivo, passos, resultado esperado, resultado observado, conclusão, gravidade (P0–P3) e evidência sanitizada.

## Pendências antes do piloto

1. Comprovar no provedor o isolamento real de banco e R2 da instância de desenvolvimento/homologação; não basta o hostname nem `/health`.
2. Confirmar backup e aplicar a migration no banco de homologação somente após autorização específica para o alvo verificado.
3. Autorizar separadamente a disponibilização do workflow em `main`; só então executar `workflow_dispatch`, compartilhar o artifact e seu checksum com os participantes.
4. Confirmar que o Samsung conectado é dispositivo de QA e que qualquer conta/dado nele é de teste; instalar sem desinstalar apps e executar a ficha funcional.
5. Conferir Actions/GitGuardian no PR depois de aberto. O PR não libera migration, operação no bucket nem deploy.

Até encerrar essas pendências, classificação operacional: **não apto para piloto com funcionários**. Build e testes automatizados aprovados não equivalem a homologação funcional ou prova de isolamento.
