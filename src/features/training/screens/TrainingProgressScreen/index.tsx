import React, { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
import * as S from './styles';

export function TrainingProgressScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'TrainingProgress'>) {
  const { data, error, isLoading, refresh } = useTrainingResource(
    trainingService.progress,
    { loadOnMount: false },
  );
  // Focus owns the initial load and refreshes after returning from a training.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
  return (
    <SafeScreen>
      <ScreenContainer scrollable>
        <S.Content>
          <BackButton onPress={() => navigation.goBack()} />
          <PageHeader
            title="Meu aprendizado"
            subtitle="Sua resposta mais recente em cada pergunta define o progresso."
          />
          {isLoading ? (
            <ActivityIndicator accessibilityLabel="Carregando progresso" />
          ) : null}
          {error ? (
            <SurfaceCard>
              <S.CardContent>
                <SectionTitle
                  title="Não foi possível carregar seu progresso."
                  subtitle="Confira a conexão e tente novamente."
                />
                <PrimaryButton onPress={refresh}>
                  Tentar novamente
                </PrimaryButton>
              </S.CardContent>
            </SurfaceCard>
          ) : null}
          {!isLoading && data?.products.length === 0 ? (
            <SectionTitle
              title="Ainda não há treinamentos publicados."
              subtitle="Explore os guias de produtos enquanto isso."
            />
          ) : null}
          {!isLoading &&
            data?.products.map(({ product, progress }) => (
              <SurfaceCard key={product.id}>
                <S.CardContent>
                  <SectionTitle
                    title={product.name}
                    subtitle={`${progress.correct}/${progress.total} corretas · ${progress.answered} respondidas · ${progress.percent}%`}
                  />
                  <PrimaryButton
                    onPress={() =>
                      navigation.navigate('Training', { productId: product.id })
                    }
                  >
                    {progress.answered
                      ? 'Treinar novamente'
                      : 'Começar treinamento'}
                  </PrimaryButton>
                </S.CardContent>
              </SurfaceCard>
            ))}
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
