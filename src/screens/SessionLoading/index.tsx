import React from 'react';
import { ActivityIndicator } from 'react-native';
import { PageHeader, SafeScreen, ScreenContainer } from '../../components';
import { APP_NAME } from '../../config/brand';
import { useTheme } from '../../hooks/useTheme';
import * as S from './styles';

export function SessionLoadingScreen() {
  const { theme } = useTheme();

  return (
    <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
      <ScreenContainer>
        <S.Content>
          <PageHeader
            eyebrow={APP_NAME}
            title="Abrindo sua conta"
            subtitle="Isso leva so um instante."
          />
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
