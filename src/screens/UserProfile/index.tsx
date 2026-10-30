import React from 'react';
import { ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Avatar,
  BackButton,
  EmptyStateCard,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
  SecondaryButton,
  SectionTitle,
  SurfaceCard,
  UserBadge,
} from '../../components';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { UserBadgeSelector } from '../../features/admin/components/UserBadgeSelector';
import { usePublicProfile } from '../../features/profile/hooks/usePublicProfile';
import type { AppStackParamList } from '../../types/navigation';
import * as S from './styles';

export function UserProfileScreen({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'UserProfile'>) {
  const { user } = useAuth();
  const { data, isLoading, error, refresh } = usePublicProfile(
    route.params.userId,
  );
  const isOwnProfile = user?.id === route.params.userId;
  const canReadPrivate = isOwnProfile || user?.role === 'ADMIN';
  return (
    <SafeScreen>
      <ScreenContainer scrollable>
        <S.Content>
          <BackButton onPress={() => navigation.goBack()} />
          {isLoading ? (
            <ActivityIndicator accessibilityLabel="Carregando perfil" />
          ) : null}
          {error ? (
            <EmptyStateCard
              title="Não foi possível carregar o perfil."
              description="Confira sua conexão e tente novamente."
            >
              <PrimaryButton onPress={refresh}>Tentar novamente</PrimaryButton>
            </EmptyStateCard>
          ) : null}
          {!isLoading && data ? (
            <>
              <SurfaceCard>
                <S.CardContent>
                  <Avatar
                    label={data.name}
                    imageUrl={data.avatarUrl}
                    size={80}
                  />
                  <S.IdentityNameRow>
                    <S.Name accessibilityRole="header">{data.name}</S.Name>
                    <UserBadge badge={data.specialBadge} />
                  </S.IdentityNameRow>
                  <S.Text>Loja: {data.store || 'Não informada'}</S.Text>
                  <S.Text>
                    Função profissional: {data.jobTitle || 'Não informada'}
                  </S.Text>
                  {isOwnProfile ? (
                    <PrimaryButton
                      onPress={() => navigation.navigate('EditProfile')}
                    >
                      Editar meu perfil
                    </PrimaryButton>
                  ) : null}
                </S.CardContent>
              </SurfaceCard>
              {canReadPrivate ? (
                <SurfaceCard>
                  <S.CardContent>
                    <SectionTitle
                      title="Dados privados"
                      subtitle="Visíveis somente a você e aos administradores."
                    />
                    <S.Text>E-mail: {data.email || 'Não informado'}</S.Text>
                    <S.Text>Telefone: {data.phone || 'Não informado'}</S.Text>
                    <S.Text>Cidade: {data.city || 'Não informada'}</S.Text>
                    <S.Text>Estado: {data.state || 'Não informado'}</S.Text>
                  </S.CardContent>
                </SurfaceCard>
              ) : null}
              <SurfaceCard>
                <S.CardContent>
                  <SectionTitle
                    title="Aprendizado"
                    subtitle={
                      data.learning.position
                        ? `${data.learning.position}º lugar no ranking`
                        : 'Ainda sem colocação no ranking'
                    }
                  />
                  <S.Text>
                    {data.learning.summary.correct}/
                    {data.learning.summary.total} perguntas corretas ·{' '}
                    {data.learning.summary.percent}% de aproveitamento
                  </S.Text>
                  <S.Caption>
                    Acertos sobre todas as perguntas publicadas de produtos
                    ativos. Vale a resposta mais recente da versão atual.
                  </S.Caption>
                  <SecondaryButton
                    onPress={() => navigation.navigate('TrainingRanking')}
                  >
                    Ver ranking de aprendizado
                  </SecondaryButton>
                </S.CardContent>
              </SurfaceCard>
              <SectionTitle title="Resultados por produto" />
              {data.learning.products.length === 0 ? (
                <S.Text>Ainda não há treinamentos publicados.</S.Text>
              ) : null}
              {data.learning.products.map(({ product, progress }) => (
                <SurfaceCard key={product.id}>
                  <SectionTitle
                    title={product.name}
                    subtitle={`${progress.correct}/${progress.total} corretas · ${progress.percent}% de aproveitamento`}
                  />
                </SurfaceCard>
              ))}
              {user?.role === 'ADMIN' ? (
                <SurfaceCard>
                  <UserBadgeSelector
                    key={data.id}
                    userId={data.id}
                    badge={data.specialBadge}
                    onSaved={refresh}
                  />
                </SurfaceCard>
              ) : null}
            </>
          ) : null}
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
