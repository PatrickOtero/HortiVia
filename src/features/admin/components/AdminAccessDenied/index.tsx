import React from 'react';
import {
  EmptyStateCard,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
} from '../../../../components';
import { ADMIN_ACCESS_DENIED_MESSAGE } from '../../utils/adminFeedback';
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
            title={ADMIN_ACCESS_DENIED_MESSAGE}
            description="Volte para continuar usando o app."
          >
            <PrimaryButton onPress={onGoBack}>Voltar</PrimaryButton>
          </EmptyStateCard>
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
