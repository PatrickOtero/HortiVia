import React, { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Avatar,
  BackButton,
  PageHeader,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
  UserBadge,
} from '../../../../components';
import type { AppStackParamList } from '../../../../types/navigation';
import { useTrainingResource } from '../../hooks/useTrainingResource';
import { trainingService } from '../../services/training.service';
import type { TrainingRankingEntry } from '../../types/training';
import * as S from './styles';

export function TrainingRankingScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'TrainingRanking'>) {
  const { data, error, isLoading, refresh } = useTrainingResource(
    trainingService.ranking,
    { loadOnMount: false },
  );
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  function renderEntry(entry: TrainingRankingEntry, isOwn = false) {
    return (
      <SurfaceCard key={entry.user.id}>
        <S.Entry
          accessibilityRole="button"
          accessibilityLabel={`Abrir perfil de ${entry.user.name}`}
          onPress={() =>
            navigation.navigate('UserProfile', { userId: entry.user.id })
          }
        >
          <S.Identity>
            <Avatar
              label={entry.user.name}
              imageUrl={entry.user.avatarUrl}
              size={48}
            />
            <S.Copy>
              <S.IdentityNameRow>
                <S.Name>
                  {entry.position}º · {entry.user.name}
                </S.Name>
                <UserBadge badge={entry.user.specialBadge} />
              </S.IdentityNameRow>
              {isOwn ? <S.Text>Sua colocação</S.Text> : null}
            </S.Copy>
          </S.Identity>
          <S.Text>
            Loja: {entry.user.store || 'Não informada'} · Função:{' '}
            {entry.user.jobTitle || 'Não informada'}
          </S.Text>
          <S.Text>
            {entry.progress.correct}/{entry.progress.total} corretas ·{' '}
            {entry.progress.percent}% de aproveitamento
          </S.Text>
        </S.Entry>
      </SurfaceCard>
    );
  }
  return (
    <SafeScreen>
      <ScreenContainer scrollable>
        <S.Content>
          <BackButton onPress={() => navigation.goBack()} />
          <PageHeader
            title="Ranking de aprendizado"
            subtitle="Acertos na resposta mais recente de cada pergunta publicada. Empates compartilham a colocação."
          />
          {isLoading ? (
            <ActivityIndicator accessibilityLabel="Carregando ranking" />
          ) : null}
          {error ? (
            <SurfaceCard>
              <SectionTitle title="Não foi possível carregar o ranking." />
              <PrimaryButton onPress={refresh}>Tentar novamente</PrimaryButton>
            </SurfaceCard>
          ) : null}
          {!isLoading && data ? (
            <>
              <S.Text>
                {data.participants} participantes · Aproveitamento sobre todas
                as perguntas publicadas de produtos ativos.
              </S.Text>
              {data.currentUser ? (
                renderEntry(data.currentUser, true)
              ) : (
                <S.Text>
                  Responda um treinamento para participar do ranking.
                </S.Text>
              )}
              <SectionTitle title="10 primeiros participantes" />
              {data.top.length ? (
                data.top.map(entry => renderEntry(entry))
              ) : (
                <S.Text>Ainda não há participantes.</S.Text>
              )}
            </>
          ) : null}
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
