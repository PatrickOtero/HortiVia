import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  EmptyStateCard,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
  SecondaryButton,
  SectionTitle,
  SurfaceCard,
} from '../../../../components';
import { useAuth } from '../../../auth/hooks/useAuth';
import {
  getEditableProductImages,
  getLegacyProductImage,
} from '../../../products/mappers/product.mapper';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { ProductGuideSectionManager } from '../../components/ProductGuideSectionManager';
import { ProductImageManager } from '../../components/ProductImageManager';
import {
  ADMIN_LOAD_DATA_ERROR_MESSAGE,
  ADMIN_RETRY_MESSAGE,
} from '../../utils/adminFeedback';
import { goBackFromAdmin } from '../../utils/adminNavigation';
import { useAdminProductVisualContent } from '../../hooks/useAdminProductVisualContent';
import { useTheme } from '../../../../hooks/useTheme';
import type { AppStackParamList } from '../../../../types/navigation';
import * as S from './styles';

type AdminProductVisualContentScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminProductVisualContent'
>;

export function AdminProductVisualContentScreen({
  navigation,
  route,
}: AdminProductVisualContentScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const productId = route.params.productId;
  const {
    product,
    isLoading,
    errorMessage,
    hasAccessDeniedError,
    refresh,
    markAccessDenied,
  } = useAdminProductVisualContent(productId);

  const goBack = () => goBackFromAdmin(navigation);

  if (user?.role !== 'ADMIN' || hasAccessDeniedError) {
    return <AdminAccessDenied onGoBack={goBack} />;
  }

  if (isLoading) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <ScreenHeader onGoBack={goBack} subtitle="Aguarde um instante." />
            <SurfaceCard>
              <S.StatusContent>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <SectionTitle
                  title="Carregando produto"
                  subtitle="Aguarde um instante."
                />
              </S.StatusContent>
            </SurfaceCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  if (!product) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <ScreenHeader
              onGoBack={goBack}
              subtitle="Revise o material deste produto."
            />
            <EmptyStateCard
              title={errorMessage || ADMIN_LOAD_DATA_ERROR_MESSAGE}
              description={ADMIN_RETRY_MESSAGE}
            >
              <S.Actions>
                <PrimaryButton onPress={() => refresh()}>
                  Tentar novamente
                </PrimaryButton>
                <SecondaryButton onPress={goBack}>Voltar</SecondaryButton>
              </S.Actions>
            </EmptyStateCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={S.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenContainer scrollable keyboardShouldPersistTaps="handled">
          <S.Content>
            <ScreenHeader onGoBack={goBack} subtitle={product.name} />
            <SurfaceCard>
              <S.StatusContent>
                <SectionTitle
                  title="Conteúdo visual"
                  subtitle="Revise as imagens e as orientações práticas deste produto."
                />
                {errorMessage ? (
                  <S.ErrorText>{errorMessage}</S.ErrorText>
                ) : null}
              </S.StatusContent>
            </SurfaceCard>

            <ProductImageManager
              productId={productId}
              images={getEditableProductImages(product.mainImages)}
              legacyImage={getLegacyProductImage(product.mainImages)}
              onChanged={refresh}
              onAccessDenied={markAccessDenied}
            />
            <ProductGuideSectionManager
              productId={productId}
              sections={product.guideSections}
              onChanged={refresh}
              onAccessDenied={markAccessDenied}
            />
          </S.Content>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

function ScreenHeader({
  onGoBack,
  subtitle,
}: {
  onGoBack: () => void;
  subtitle: string;
}) {
  return (
    <S.HeaderRow>
      <BackButton onPress={onGoBack} />
      <S.HeaderCopy>
        <S.HeaderTitle>Conteúdo visual</S.HeaderTitle>
        <S.HeaderSubtitle>{subtitle}</S.HeaderSubtitle>
      </S.HeaderCopy>
    </S.HeaderRow>
  );
}
