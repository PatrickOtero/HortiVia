import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  InputField,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
  TextButton,
} from '../../../../components';
import type { AppStackParamList } from '../../../../types/navigation';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTrainingResource } from '../../../training/hooks/useTrainingResource';
import { trainingService } from '../../../training/services/training.service';
import type {
  AdminTrainingQuestion,
  SaveTrainingQuestion,
} from '../../../training/types/training';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminFormSection } from '../../components/AdminFormSection';
import * as S from './styles';

type Props = NativeStackScreenProps<
  AppStackParamList,
  'AdminTrainingQuestions'
>;
type Form = {
  id?: string;
  version?: number;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  sourceReference: string;
  sortOrder: string;
  isPublished: boolean;
};
const emptyForm = (): Form => ({
  prompt: '',
  options: ['', '', '', ''],
  correctOptionIndex: 0,
  explanation: '',
  sourceReference: '',
  sortOrder: '0',
  isPublished: false,
});

export function validateQuestionForm(form: Form): string | null {
  const options = form.options
    .slice(0, form.options[3].trim() ? 4 : 3)
    .map(option => option.trim());
  if (
    form.prompt.trim().length < 5 ||
    form.explanation.trim().length < 5 ||
    options.some(option => !option)
  ) {
    return 'Preencha o enunciado, três alternativas e a explicação.';
  }
  if (
    new Set(options.map(option => option.toLocaleLowerCase('pt-BR'))).size !==
    options.length
  )
    return 'As alternativas devem ser diferentes.';
  if (form.correctOptionIndex >= options.length)
    return 'Escolha uma alternativa correta preenchida.';
  if (!/^\d+$/.test(form.sortOrder) || Number(form.sortOrder) > 10000)
    return 'Informe uma ordem entre 0 e 10000.';
  if (form.isPublished && !form.sourceReference.trim())
    return 'Informe uma referência no guia para publicar a pergunta.';
  if (form.sourceReference.trim().length > 2000)
    return 'A referência no guia deve ter no máximo 2000 caracteres.';
  return null;
}

export function AdminTrainingQuestionsScreen(props: Props) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN')
    return <AdminAccessDenied onGoBack={() => props.navigation.goBack()} />;
  return <QuestionEditor {...props} />;
}

function QuestionEditor({ navigation, route }: Props) {
  const { productId } = route.params;
  const load = useCallback(
    () => trainingService.adminList(productId),
    [productId],
  );
  const { data, error, isLoading, refresh } = useTrainingResource(load);
  const [form, setForm] = useState<Form | null>(null);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);

  function edit(question?: AdminTrainingQuestion) {
    if (saving.current) return;
    setForm(
      question
        ? {
            ...question,
            options: [
              ...question.options,
              ...Array(4 - question.options.length).fill(''),
            ],
            sourceReference: question.sourceReference ?? '',
            sortOrder: String(question.sortOrder),
          }
        : emptyForm(),
    );
    setMessage('');
    setFormError('');
  }
  function change<K extends keyof Form>(key: K, value: Form[K]) {
    setForm(current => current && { ...current, [key]: value });
  }
  async function save() {
    if (!form || saving.current) return;
    const validation = validateQuestionForm(form);
    if (validation) {
      setFormError(validation);
      return;
    }
    saving.current = true;
    setIsSaving(true);
    setMessage('');
    setFormError('');
    const payload: SaveTrainingQuestion = {
      prompt: form.prompt.trim(),
      options: form.options
        .slice(0, form.options[3].trim() ? 4 : 3)
        .map(option => option.trim()),
      correctOptionIndex: form.correctOptionIndex,
      explanation: form.explanation.trim(),
      sourceReference: form.sourceReference.trim(),
      sortOrder: Number(form.sortOrder),
      isPublished: form.isPublished,
      ...(form.id ? { version: form.version } : {}),
    };
    try {
      await trainingService.save(productId, payload, form.id);
      setForm(null);
      setMessage(
        form.isPublished
          ? 'Pergunta salva e publicada.'
          : 'Pergunta salva como rascunho/inativa.',
      );
      await refresh();
    } catch (cause) {
      const status = (cause as { response?: { status?: number } })?.response
        ?.status;
      setFormError(
        status === 409
          ? 'Outra edição foi salva. Cancele e recarregue a lista antes de editar novamente.'
          : status === 403
          ? 'Sem permissão para salvar perguntas.'
          : 'Não foi possível salvar. Confira os campos e a conexão.',
      );
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }
  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={S.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenContainer scrollable>
          <S.Content>
            <BackButton onPress={() => navigation.goBack()} />
            <SectionTitle
              title={data?.product.name ?? 'Perguntas'}
              subtitle="Rascunhos de demonstração exigem revisão do guia antes de publicar."
            />
            {message ? (
              <S.SuccessText accessibilityRole="alert">{message}</S.SuccessText>
            ) : null}
            {isLoading ? (
              <ActivityIndicator accessibilityLabel="Carregando perguntas" />
            ) : null}
            {error ? (
              <>
                <S.ErrorText>
                  Não foi possível carregar as perguntas.
                </S.ErrorText>
                <PrimaryButton onPress={refresh}>
                  Recarregar perguntas
                </PrimaryButton>
              </>
            ) : null}
            {!form ? (
              <PrimaryButton onPress={() => edit()}>
                Nova pergunta
              </PrimaryButton>
            ) : null}
            {form ? (
              <SurfaceCard>
                <AdminFormSection
                  title={form.id ? 'Editar pergunta' : 'Nova pergunta'}
                >
                  <InputField
                    label="Enunciado"
                    value={form.prompt}
                    maxLength={500}
                    multiline
                    editable={!isSaving}
                    onChangeText={value => change('prompt', value)}
                  />
                  {form.options.map((option, optionIndex) => (
                    <S.Stack key={optionIndex}>
                      <InputField
                        label={`Alternativa ${optionIndex + 1}${
                          optionIndex === 3 ? ' (opcional)' : ''
                        }`}
                        value={option}
                        maxLength={300}
                        multiline
                        editable={!isSaving}
                        onChangeText={value =>
                          change(
                            'options',
                            form.options.map((item, i) =>
                              i === optionIndex ? value : item,
                            ),
                          )
                        }
                      />
                      <TextButton
                        disabled={isSaving}
                        onPress={() =>
                          change('correctOptionIndex', optionIndex)
                        }
                      >
                        {form.correctOptionIndex === optionIndex
                          ? `✓ Alternativa ${optionIndex + 1} correta`
                          : `Marcar alternativa ${
                              optionIndex + 1
                            } como correta`}
                      </TextButton>
                    </S.Stack>
                  ))}
                  <InputField
                    label="Explicação educativa"
                    value={form.explanation}
                    maxLength={2000}
                    multiline
                    editable={!isSaving}
                    onChangeText={value => change('explanation', value)}
                  />
                  <InputField
                    label="Referência no guia"
                    helperText="Obrigatória para publicar; rascunhos podem ficar sem referência."
                    value={form.sourceReference}
                    maxLength={2000}
                    multiline
                    editable={!isSaving}
                    onChangeText={value => change('sourceReference', value)}
                  />
                  <InputField
                    label="Ordem"
                    value={form.sortOrder}
                    keyboardType="number-pad"
                    editable={!isSaving}
                    onChangeText={value => change('sortOrder', value)}
                  />
                  <S.Copy>Publicar após revisar o conteúdo</S.Copy>
                  <Switch
                    accessibilityLabel="Publicar pergunta"
                    value={form.isPublished}
                    disabled={isSaving}
                    onValueChange={value => change('isPublished', value)}
                  />
                  {formError ? (
                    <S.ErrorText accessibilityRole="alert">
                      {formError}
                    </S.ErrorText>
                  ) : null}
                  <PrimaryButton onPress={save} loading={isSaving}>
                    Salvar pergunta
                  </PrimaryButton>
                  <TextButton
                    disabled={isSaving}
                    onPress={() => {
                      setForm(null);
                      setFormError('');
                      refresh();
                    }}
                  >
                    Cancelar
                  </TextButton>
                </AdminFormSection>
              </SurfaceCard>
            ) : null}
            {!isLoading && data?.questions.length === 0 ? (
              <SectionTitle title="Nenhuma pergunta cadastrada." />
            ) : null}
            {data?.questions.map(question => (
              <SurfaceCard key={question.id}>
                <S.Stack>
                  <SectionTitle
                    title={question.prompt}
                    subtitle={`${
                      question.isPublished ? 'Publicada' : 'Rascunho/inativa'
                    }${
                      question.isDemo ? ' · Demonstração, revisar' : ''
                    } · Ordem ${question.sortOrder}`}
                  />
                  <TextButton
                    disabled={isSaving}
                    onPress={() => edit(question)}
                  >
                    Editar pergunta
                  </TextButton>
                </S.Stack>
              </SurfaceCard>
            ))}
          </S.Content>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
