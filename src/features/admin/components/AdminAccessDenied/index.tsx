import React from 'react';
import {
  EmptyStateCard,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
} from '../../../../components';
import * as S from './styles';

type AdminAccessDeniedProps = {
  onGoBack: () => void;
};

export function AdminAccessDenied({ onGoBack }: AdminAccessDeniedProps) {
  return (
    <SafeScreen>
      <ScreenContainer scrollable>
        <S.Content>
          <EmptyStateCard
            title="Voce nao tem permissao para acessar esta area."
            description="Volte para continuar usando o app."
          >
            <PrimaryButton onPress={onGoBack}>Voltar</PrimaryButton>
          </EmptyStateCard>
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
