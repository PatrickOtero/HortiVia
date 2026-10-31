import React from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { AppStackParamList } from '../../../../types/navigation';
import { useTheme } from '../../../../hooks/useTheme';
import { useAuth } from '../../../auth/hooks/useAuth';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminFormSection } from '../../components/AdminFormSection';
import { useAdminProductForm } from '../../hooks/useAdminProductForm';
import {
  ADMIN_LOAD_DATA_ERROR_MESSAGE,
  ADMIN_RETRY_MESSAGE,
} from '../../utils/adminFeedback';
import { goBackFromAdmin } from '../../utils/adminNavigation';
import { ProductFormFields } from './components/ProductFormFields';
import { ProductMainImageField } from './components/ProductMainImageField';
import * as S from './styles';

type AdminProductFormScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminProductForm'
>;

export function AdminProductFormScreen({
  navigation,
  route,
}: AdminProductFormScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const form = useAdminProductForm({
    initialProductId: route.params?.productId,
  });

  if (user?.role !== 'ADMIN' || form.hasAccessDeniedError) {
    return <AdminAccessDenied onGoBack={() => goBackFromAdmin(navigation)} />;
  }

  function showSavedFeedback(wasEditing: boolean, imageUploaded: boolean) {
    Alert.alert(
      wasEditing ? 'Produto atualizado.' : 'Produto salvo.',
      imageUploaded ? 'Imagem atualizada.' : undefined,
      [{ text: 'OK', onPress: () => goBackFromAdmin(navigation) }],
    );
  }

  async function handleSave() {
    const result = await form.handleSubmit();
    if (result?.status === 'saved') {
      showSavedFeedback(result.wasEditing, result.imageUploaded);
    } else if (result?.status === 'image-upload-failed') {
      Alert.alert(
        result.wasEditing ? 'Produto atualizado.' : 'Produto salvo.',
        'Não foi possível enviar a imagem.',
      );
    }
  }

  if (form.isLoading) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>
                  {form.isEditing ? 'Editar produto' : 'Novo produto'}
                </S.HeaderTitle>
                <S.HeaderSubtitle>
                  Revise as informações mostradas no app.
                </S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>
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

  if (form.screenError && form.isEditing && !form.formValues.name) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>Editar produto</S.HeaderTitle>
                <S.HeaderSubtitle>
                  Revise as informações mostradas no app.
                </S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>
            <EmptyStateCard
              title={ADMIN_LOAD_DATA_ERROR_MESSAGE}
              description={ADMIN_RETRY_MESSAGE}
            >
              <S.Actions>
                <PrimaryButton onPress={() => form.reloadProduct()}>
                  Tentar novamente
                </PrimaryButton>
                <SecondaryButton onPress={() => goBackFromAdmin(navigation)}>
                  Voltar
                </SecondaryButton>
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
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>
                  {form.isEditing ? 'Editar produto' : 'Novo produto'}
                </S.HeaderTitle>
                <S.HeaderSubtitle>
                  Preencha os dados que aparecem no app.
                </S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            <SurfaceCard>
              <S.FormStack>
                <AdminFormSection
                  title="Dados principais"
                  description="Nome, categoria e resumo que aparecem no app."
                >
                  <ProductFormFields
                    section="primary"
                    values={form.formValues}
                    errors={form.formErrors}
                    onChange={(field, value) => form.updateField(field, value)}
                    onCategoryChange={category =>
                      form.updateField('category', category)
                    }
                  />
                  <ProductMainImageField
                    productId={form.currentProductId}
                    previewImageUrl={form.previewImageUrl}
                    shouldShowImage={form.shouldShowImage}
                    isSaving={form.isSaving}
                    isUploading={form.isUploadingImage}
                    hasSelectedImage={Boolean(form.selectedImageFile)}
                    successMessage={form.imageSuccessMessage}
                    errorMessage={form.imageErrorMessage}
                    saveBeforeUploadMessage={form.saveProductBeforeImageMessage}
                    onSelect={() => form.handleSelectImage()}
                    onUpload={() => form.handleUploadImage()}
                    onImageLoadError={() => form.setHasImageLoadError(true)}
                  />
                </AdminFormSection>
                <AdminFormSection
                  title="Informações complementares"
                  description="Use uma linha por item. Em nutrientes, use o formato nome: valor."
                >
                  <ProductFormFields
                    section="details"
                    values={form.formValues}
                    errors={form.formErrors}
                    onChange={(field, value) => form.updateField(field, value)}
                  />
                </AdminFormSection>
                {form.screenError ? (
                  <S.ErrorText>{form.screenError}</S.ErrorText>
                ) : null}
                <S.Actions>
                  {form.currentProductId ? (
                    <SecondaryButton
                      onPress={() =>
                        navigation.navigate('AdminProductVisualContent', {
                          productId: form.currentProductId!,
                        })
                      }
                      disabled={form.isSaving || form.isUploadingImage}
                    >
                      Conteúdo visual
                    </SecondaryButton>
                  ) : null}
                  <PrimaryButton
                    onPress={() => handleSave()}
                    loading={form.isSaving}
                    disabled={form.isUploadingImage}
                  >
                    {form.isEditing ? 'Salvar alterações' : 'Salvar produto'}
                  </PrimaryButton>
                  <SecondaryButton
                    onPress={() => goBackFromAdmin(navigation)}
                    disabled={form.isSaving || form.isUploadingImage}
                  >
                    Cancelar
                  </SecondaryButton>
                </S.Actions>
              </S.FormStack>
            </SurfaceCard>
          </S.Content>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
