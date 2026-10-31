import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  EmptyStateCard,
  FilterChip,
  InputField,
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
import { AdminArticlePreview } from '../../components/AdminArticlePreview';
import { ArticleBlockManager } from '../../components/ArticleBlockManager';
import { AdminFormSection } from '../../components/AdminFormSection';
import {
  ADMIN_LOAD_DATA_ERROR_MESSAGE,
  ADMIN_RETRY_MESSAGE,
} from '../../utils/adminFeedback';
import { goBackFromAdmin } from '../../utils/adminNavigation';
import {
  ADMIN_ARTICLE_CATEGORY_OPTIONS,
  parseTags,
} from '../../utils/adminContent';
import { useAdminArticleForm } from '../../hooks/useAdminArticleForm';
import * as S from './styles';

type AdminArticleFormScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminArticleForm'
>;

export function AdminArticleFormScreen({
  navigation,
  route,
}: AdminArticleFormScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const form = useAdminArticleForm({
    initialArticleId: route.params?.articleId,
    onArticleSaved: articleId => navigation.setParams({ articleId }),
  });
  const {
    currentArticleId,
    isEditing,
    formValues,
    formErrors,
    screenError,
    isLoading,
    isSaving,
    articleBlocks,
    selectedImageFile,
    isUploadingImage,
    imageSuccessMessage,
    imageErrorMessage,
    hasAccessDeniedError,
    previewImageUrl,
    shouldShowImage,
    saveArticleBeforeImageMessage,
    updateField,
    handleSelectImage,
    handleUploadImage,
    handleSubmit,
    setHasImageLoadError,
    updateArticleBlock,
    addArticleBlock,
    removeArticleBlock,
  } = form;

  if (user?.role !== 'ADMIN' || hasAccessDeniedError) {
    return <AdminAccessDenied onGoBack={() => goBackFromAdmin(navigation)} />;
  }

  if (isLoading) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>{isEditing ? 'Editar artigo' : 'Novo artigo'}</S.HeaderTitle>
                <S.HeaderSubtitle>Revise o conteúdo que será exibido no feed.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>
            <SurfaceCard>
              <S.StatusContent>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <SectionTitle
                  title="Carregando artigo"
                  subtitle="Aguarde um instante."
                />
              </S.StatusContent>
            </SurfaceCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  if (screenError && isEditing && formValues.title.length === 0) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>Editar artigo</S.HeaderTitle>
                <S.HeaderSubtitle>Revise o conteúdo que será exibido no feed.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>
            <EmptyStateCard
              title={ADMIN_LOAD_DATA_ERROR_MESSAGE}
              description={ADMIN_RETRY_MESSAGE}
            >
              <S.Actions>
                <PrimaryButton
                  onPress={() =>
                    navigation.replace('AdminArticleForm', {
                      articleId: currentArticleId ?? undefined,
                    })
                  }
                >
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
                <S.HeaderTitle>{isEditing ? 'Editar artigo' : 'Novo artigo'}</S.HeaderTitle>
                <S.HeaderSubtitle>Prepare o conteúdo que será exibido no feed.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            <SurfaceCard>
              <S.FormStack>
                <AdminFormSection
                  title="Dados principais"
                  description="Título, resumo e categoria da leitura."
                >
                  <InputField
                    label="Título"
                    value={formValues.title}
                    onChangeText={value => updateField('title', value)}
                    helperText={formErrors.title}
                  />
                  <InputField
                    label="Resumo"
                    value={formValues.summary}
                    onChangeText={value => updateField('summary', value)}
                    helperText={formErrors.summary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  <S.CategoryGroup>
                    <S.CategoryLabel>Categoria</S.CategoryLabel>
                    <S.ChipRow>
                      {ADMIN_ARTICLE_CATEGORY_OPTIONS.map(option => (
                        <FilterChip
                          key={option.value}
                          label={option.label}
                          active={formValues.category === option.value}
                          onPress={() => updateField('category', option.value)}
                        />
                      ))}
                    </S.ChipRow>
                    {formErrors.category ? (
                      <S.ErrorText>{formErrors.category}</S.ErrorText>
                    ) : null}
                  </S.CategoryGroup>

                  <S.ImageCard>
                    <S.ImagePreviewFrame>
                      {shouldShowImage ? (
                        <S.ImagePreview
                          source={{ uri: previewImageUrl ?? undefined }}
                          resizeMode="cover"
                          onError={() => setHasImageLoadError(true)}
                        />
                      ) : (
                        <S.ImageFallback>
                          <S.ImageFallbackBadge>
                            <S.ImageFallbackBadgeText>HortiVia</S.ImageFallbackBadgeText>
                          </S.ImageFallbackBadge>
                          <S.ImageFallbackTitle>Imagem do artigo</S.ImageFallbackTitle>
                          <S.ImageFallbackDescription>
                            Adicione uma imagem para acompanhar a leitura.
                          </S.ImageFallbackDescription>
                        </S.ImageFallback>
                      )}
                    </S.ImagePreviewFrame>

                    <S.ImageMeta>
                      <S.ImageMetaTitle>Imagem do artigo</S.ImageMetaTitle>
                      <S.ImageMetaDescription>
                        {currentArticleId
                          ? 'Escolha uma nova imagem e envie quando estiver pronta.'
                          : 'Escolha uma imagem agora e envie depois de salvar.'}
                      </S.ImageMetaDescription>
                    </S.ImageMeta>

                    <S.ImageActions>
                      <SecondaryButton
                        fullWidth={false}
                        onPress={handleSelectImage}
                        disabled={isSaving || isUploadingImage}
                      >
                        Alterar imagem
                      </SecondaryButton>
                      <PrimaryButton
                        fullWidth={false}
                        onPress={handleUploadImage}
                        loading={isUploadingImage}
                        disabled={!selectedImageFile || !currentArticleId || isSaving}
                      >
                        Enviar imagem
                      </PrimaryButton>
                    </S.ImageActions>

                    {!currentArticleId && selectedImageFile ? (
                      <S.ImageMetaDescription>
                        {saveArticleBeforeImageMessage}
                      </S.ImageMetaDescription>
                    ) : null}
                    {imageSuccessMessage ? (
                      <S.SuccessText>{imageSuccessMessage}</S.SuccessText>
                    ) : null}
                    {imageErrorMessage ? (
                      <S.ErrorText>{imageErrorMessage}</S.ErrorText>
                    ) : null}
                  </S.ImageCard>

                  <InputField
                    label="Tags"
                    value={formValues.tags}
                    onChangeText={value => updateField('tags', value)}
                    helperText="Separe as tags por vírgula."
                  />

                  <S.ToggleRow>
                    <S.ToggleCopy>
                      <S.ToggleTitle>Publicado</S.ToggleTitle>
                      <S.ToggleDescription>
                        Escolha se a leitura deve aparecer no app.
                      </S.ToggleDescription>
                    </S.ToggleCopy>
                    <Switch
                      value={formValues.isPublished}
                      onValueChange={value => updateField('isPublished', value)}
                      trackColor={{
                        false: theme.colors.borderStrong,
                        true: theme.colors.primary,
                      }}
                      thumbColor={theme.colors.surface}
                    />
                  </S.ToggleRow>
                </AdminFormSection>

                <AdminFormSection
                  title="Conteúdo"
                  description="Escreva o texto completo da leitura."
                >
                  <InputField
                    label="Conteúdo"
                    value={formValues.content}
                    onChangeText={value => updateField('content', value)}
                    helperText={formErrors.content}
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                  />
                </AdminFormSection>

                <AdminFormSection
                  title="Blocos do artigo"
                  description={
                    currentArticleId
                      ? 'Crie e organize os blocos que estruturam a leitura no app.'
                      : 'Salve o artigo para adicionar blocos.'
                  }
                >
                  {!currentArticleId ? (
                    <EmptyStateCard
                      title="Salve o artigo para adicionar blocos."
                      description="Depois disso, voce podera criar, editar, ordenar e adicionar imagens dentro de cada bloco."
                    />
                  ) : (
                    <ArticleBlockManager
                      articleId={currentArticleId}
                      blocks={articleBlocks}
                      onCreateBlock={addArticleBlock}
                      onUpdateBlock={updateArticleBlock}
                      onDeleteBlock={removeArticleBlock}
                    />
                  )}
                </AdminFormSection>

                <AdminArticlePreview
                  title={formValues.title}
                  summary={formValues.summary}
                  content={formValues.content}
                  category={formValues.category}
                  imageUrl={previewImageUrl}
                  tags={parseTags(formValues.tags)}
                  blocks={articleBlocks}
                  authorName={user?.name}
                  isPublished={formValues.isPublished}
                />

                {screenError ? <S.ErrorText>{screenError}</S.ErrorText> : null}

                <S.Actions>
                  <PrimaryButton
                    onPress={handleSubmit}
                    loading={isSaving}
                    disabled={isUploadingImage}
                  >
                    {formValues.isPublished
                      ? isEditing
                        ? 'Salvar alterações publicadas'
                        : 'Salvar e publicar'
                      : isEditing
                        ? 'Salvar alterações como rascunho'
                        : 'Salvar rascunho'}
                  </PrimaryButton>
                  <SecondaryButton
                    onPress={() => goBackFromAdmin(navigation)}
                    disabled={isSaving || isUploadingImage}
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
