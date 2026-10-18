import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  PageHeader,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
} from '../../../../components';
import type { AppStackParamList } from '../../../../types/navigation';
import { useTrainingResource } from '../../hooks/useTrainingResource';
import { trainingService } from '../../services/training.service';
import type { TrainingFeedback } from '../../types/training';
import * as S from './styles';

type Props = NativeStackScreenProps<AppStackParamList, 'Training'>;

export function TrainingScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const load = useCallback(
    () => trainingService.getProduct(productId),
    [productId],
  );
  const { data, isLoading, error, refresh } = useTrainingResource(load);
  const [stage, setStage] = useState<'intro' | 'question' | 'result'>('intro');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<TrainingFeedback | null>(null);
  const [correct, setCorrect] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const sending = useRef(false);
  const answered = useRef(new Set<string>());
  const alive = useRef(true);
  const submission = useRef<{
    questionId: string;
    selected: number;
    key: string;
  } | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const question = data?.questions[index];

  async function submit() {
    if (
      !question ||
      selected === null ||
      feedback ||
      sending.current ||
      answered.current.has(question.id)
    )
      return;
    sending.current = true;
    setIsSubmitting(true);
    setSubmitError('');
    if (
      submission.current?.questionId !== question.id ||
      submission.current.selected !== selected
    ) {
      // A uniqueness key for retries, not an authentication/security token.
      submission.current = {
        questionId: question.id,
        selected,
        key: `training-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2)}-${Math.random().toString(36).slice(2)}`,
      };
    }
    try {
      const result = await trainingService.answer(question.id, {
        selectedOptionIndex: selected,
        version: question.version,
        submissionKey: submission.current.key,
      });
      if (!alive.current) return;
      answered.current.add(question.id);
      setFeedback(result);
      if (result.isCorrect) setCorrect(count => count + 1);
    } catch (cause) {
      if (!alive.current) return;
      const status = (cause as { response?: { status?: number } })?.response
        ?.status;
      setSubmitError(
        status === 409 || status === 404
          ? 'O treinamento mudou ou foi desativado. Volte e abra novamente.'
          : 'Não foi possível enviar. Confira a conexão e tente novamente.',
      );
    } finally {
      sending.current = false;
      if (alive.current) setIsSubmitting(false);
    }
  }

  function next() {
    if (!feedback) return;
    setFeedback(null);
    setSelected(null);
    submission.current = null;
    setSubmitError('');
    if (index + 1 === data?.questions.length) {
      setStage('result');
      refresh();
    } else setIndex(index + 1);
  }

  function repeat() {
    answered.current.clear();
    setIndex(0);
    setCorrect(0);
    setSelected(null);
    setFeedback(null);
    submission.current = null;
    setSubmitError('');
    setStage('intro');
    refresh();
  }

  function body() {
    if (stage === 'result')
      return (
        <S.Stack>
          <SectionTitle
            title="Treinamento concluído"
            subtitle={`Nesta rodada: ${correct} de ${index + 1} acertos.`}
          />
          {isLoading ? (
            <ActivityIndicator accessibilityLabel="Atualizando progresso" />
          ) : error || !data ? (
            <S.Stack>
              <S.ErrorText accessibilityRole="alert">
                Não foi possível atualizar seu progresso. O resultado desta
                rodada está preservado.
              </S.ErrorText>
              <PrimaryButton onPress={refresh}>
                Atualizar progresso
              </PrimaryButton>
            </S.Stack>
          ) : (
            <S.Stack>
              <S.Copy>
                Progresso atual: {data.progress.correct}/{data.progress.total}{' '}
                corretas ({data.progress.percent}%).
              </S.Copy>
              <S.Copy>
                O progresso considera sua resposta mais recente em cada
                pergunta.
              </S.Copy>
            </S.Stack>
          )}
          <PrimaryButton onPress={repeat}>Repetir treinamento</PrimaryButton>
          <PrimaryButton onPress={() => navigation.goBack()}>
            Voltar ao produto
          </PrimaryButton>
        </S.Stack>
      );
    if (isLoading)
      return <ActivityIndicator accessibilityLabel="Carregando treinamento" />;
    if (error || !data)
      return (
        <S.Stack>
          <SectionTitle
            title="Não foi possível carregar o treinamento."
            subtitle="Confira a conexão e tente novamente."
          />
          <PrimaryButton onPress={refresh}>Tentar novamente</PrimaryButton>
        </S.Stack>
      );
    if (!data.questions.length)
      return (
        <SectionTitle
          title="Ainda não há perguntas publicadas."
          subtitle="Consulte o guia deste produto e volte mais tarde."
        />
      );
    if (stage === 'intro')
      return (
        <S.Stack>
          <SectionTitle
            title={data.product.name}
            subtitle={`${data.questions.length} perguntas rápidas. Leia o guia antes de começar.`}
          />
          <S.Copy>
            Seu progresso: {data.progress.correct}/{data.progress.total}{' '}
            respostas mais recentes corretas.
          </S.Copy>
          <PrimaryButton onPress={() => setStage('question')}>
            Começar treinamento
          </PrimaryButton>
        </S.Stack>
      );
    if (!question)
      return (
        <SectionTitle
          title="O treinamento foi atualizado."
          subtitle="Volte e abra novamente."
        />
      );
    return (
      <S.Stack>
        <SectionTitle
          title={`Pergunta ${index + 1} de ${data.questions.length}`}
          subtitle={question.prompt}
        />
        {question.options.map((option, optionIndex) => (
          <S.Option
            key={`${question.id}-${optionIndex}`}
            accessibilityRole="radio"
            accessibilityLabel={option}
            accessibilityState={{
              checked: selected === optionIndex,
              disabled: isSubmitting || !!feedback,
            }}
            $selected={selected === optionIndex}
            disabled={isSubmitting || !!feedback}
            onPress={() => {
              if (!sending.current && !feedback) setSelected(optionIndex);
            }}
          >
            <S.Copy>{option}</S.Copy>
          </S.Option>
        ))}
        {submitError ? (
          <S.ErrorText accessibilityRole="alert">{submitError}</S.ErrorText>
        ) : null}
        {feedback ? (
          <S.Stack>
            <SectionTitle
              title={
                feedback.isCorrect
                  ? 'Resposta correta!'
                  : 'Vamos aprender com essa resposta'
              }
            />
            <S.Copy>
              Resposta: {question.options[feedback.correctOptionIndex]}
            </S.Copy>
            <S.Copy>{feedback.explanation}</S.Copy>
            {feedback.sourceReference ? (
              <S.Copy>Fonte: {feedback.sourceReference}</S.Copy>
            ) : null}
            <PrimaryButton onPress={next}>
              {index + 1 === data.questions.length
                ? 'Ver resultado'
                : 'Próxima pergunta'}
            </PrimaryButton>
          </S.Stack>
        ) : (
          <PrimaryButton
            onPress={submit}
            disabled={selected === null || isSubmitting}
            loading={isSubmitting}
          >
            Enviar resposta
          </PrimaryButton>
        )}
      </S.Stack>
    );
  }

  return (
    <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
      <ScreenContainer scrollable>
        <S.Content>
          <BackButton onPress={() => navigation.goBack()} />
          <PageHeader title="Treinamento rápido" />
          <SurfaceCard>{body()}</SurfaceCard>
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
