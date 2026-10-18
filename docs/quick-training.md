# Treinamento rápido — aplicativo

Fluxo: detalhe do produto → **Treinar conhecimento** → introdução → uma pergunta por vez → correção educativa → resultado → repetir. A ação só aparece quando a API retorna perguntas publicadas. A Biblioteca oferece **Meu aprendizado → Ver meu progresso**, com progresso atual por produto e acesso ao treinamento.

A área **Ajustes → Gerenciar conteúdo → Treinamentos** permite ao administrador selecionar um produto, criar/editar perguntas, escolher a alternativa correta, informar explicação/referência, ordenar e publicar/desativar. São exigidas três alternativas; a quarta é opcional. Rascunhos do seed estão identificados como demonstração e precisam de revisão editorial.

Não há perguntas nem resultados fictícios no código de produção. Todos vêm de `trainingService`, usando o apiClient e o token/sessão existentes. Gabarito e explicação aparecem somente após o POST de resposta. Carregamento, ausência de conteúdo, falha de conexão, erro de envio e treinamento alterado/inativo têm estados próprios.

O resultado local da rodada permanece visível enquanto o progresso atualizado é consultado e também se essa consulta falhar. Nesse caso, há uma ação de recuperação; o progresso não é apresentado como confirmado até uma consulta bem-sucedida. A tela de progresso carrega uma vez ao receber o foco inicial e atualiza ao voltar de um treinamento, descartando respostas de requisições obsoletas.

Publicar uma pergunta exige referência no guia não vazia após trim, com até 2000 caracteres, tanto no formulário quanto na API. Rascunhos podem continuar sem referência. A revisão não publica automaticamente nenhum dos 33 rascunhos.

Durante o envio, alternativas e botão ficam bloqueados; uma trava síncrona também protege contra dois toques no mesmo frame. Reenvio após perda de resposta conserva a chave de idempotência; repetição intencional usa outra chave. O resultado mostra a rodada atual e recarrega o progresso persistido no servidor. Sair da sessão desmonta a navegação autenticada, sem armazenar progresso de outro usuário em cache global.

## Contratos e integração

Novas rotas do app: `Training { productId }`, `TrainingProgress`, `AdminTrainingProducts`, `AdminTrainingQuestions { productId }`. As quatro abas e rotas anteriores permanecem.

Os endpoints estão centralizados em `src/config/apiConfig.ts`; modelos em `src/features/training/types/training.ts`. A URL base de produção foi preservada. O módulo exige a API com a migração de treinamento aplicada e conteúdo revisado/publicado. Uma API antiga retorna indisponibilidade; o app não substitui conteúdo por exemplos.

Documentação do servidor, payloads, banco isolado e seed: `docs/quick-training.md` no repositório `PatrickOtero/HortiVia-API`. O seed prepara 33 perguntas de demonstração não publicadas para os 11 produtos existentes, sem sobrescrever edições posteriores.

## Testes

```powershell
npm ci
npm run lint
npm run typecheck
npm test -- --runInBand
Set-Location android
.\gradlew.bat :app:assembleDebug :app:assembleRelease --console=plain --max-workers=2
```

Os testes novos exercitam as telas/controles reais, transições dos routers, ação no detalhe do produto, acesso pela Biblioteca, seleção, feedback, resultado/repetição, progresso, estados vazios, erros e duplicação de envio. Testes administrativos cobrem bloqueio de usuário comum, validação, edição/publicação e falha ao salvar. Os testes anteriores são preservados.

O teste live é opcional para a rotina sem servidor. Para executá-lo, prepare e inicie `test/start-training-demo.ts` no backend conforme a documentação daquele repositório e informe o mesmo arquivo:

```powershell
$env:TRAINING_DEMO_FIXTURE_FILE=Join-Path $env:TEMP 'hortivia-training-demo.json'
npm test -- --runInBand
```

Ele usa a tela real com Axios contra Nest/PostgreSQL locais. Sem a fixture, somente esse teste de integração fica explicitamente pendente; as suítes unitárias continuam. Não use token, conta ou API de produção. Na validação desta etapa a fixture foi fornecida e o teste foi executado.

Para teste manual Android com a API completa local na porta 3000, mantenha a mudança de URL apenas no ambiente de desenvolvimento: centralize-a em apiConfig, use `http://localhost:3000` no debug e `adb reverse tcp:3000 tcp:3000` no aparelho conectado. Use banco e conta locais autorizados. O release bloqueia HTTP em texto claro; mantenha HTTPS para distribuição. Não publique APK contendo configuração local.

O APK release mantém o fallback de assinatura de debug existente. É artefato de validação, não uma versão oficialmente assinada para publicação.
