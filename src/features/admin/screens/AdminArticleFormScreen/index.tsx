import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
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
import {
  IMAGE_LIBRARY_OPTIONS,
  normalizeImageUploadFile,
  validateImageUploadFile,
  type ImageUploadFile,
} from '../../../../utils/images/imagePicker';
import { useTheme } from '../../../../hooks/useTheme';
import { useAuth } from '../../../auth/hooks/useAuth';
import { articlesService } from '../../../articles/services/articles.service';
import type {
  ArticleCategory,
  CreateArticlePayload,
} from '../../../articles/types/article';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminFormSection } from '../../components/AdminFormSection';
import {
  ADMIN_LOAD_DATA_ERROR_MESSAGE,
  ADMIN_RETRY_MESSAGE,
  getSafeAdminImageErrorMessage,
  isAdminAccessDeniedError,
} from '../../utils/adminFeedback';
import { goBackFromAdmin } from '../../utils/adminNavigation';
import {
  ADMIN_ARTICLE_CATEGORY_OPTIONS,
  formatTags,
  parseTags,
} from '../../utils/adminContent';
import * as S from './styles';

type AdminArticleFormScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminArticleForm'
>;

type ArticleFormValues = {
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory | null;
  imageUrl: string;
  tags: string;
  isPublished: boolean;
};

type ArticleFormErrors = Partial<
  Record<'title' | 'summary' | 'content' | 'category', string>
>;

const MAX_ARTICLE_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const ARTICLE_IMAGE_FALLBACK_FILE_NAME = 'article-image.jpg';
const ARTICLE_IMAGE_INVALID_MESSAGE = 'Escolha uma imagem válida.';
const ARTICLE_IMAGE_TOO_LARGE_MESSAGE = 'A imagem deve ter no máximo 5 MB.';
const ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE = 'Não foi possível enviar a imagem.';
const ARTICLE_IMAGE_SUCCESS_MESSAGE = 'Imagem atualizada.';
const SAVE_ARTICLE_BEFORE_IMAGE_MESSAGE =
  'Salve o artigo antes de enviar a imagem.';

const INITIAL_FORM_VALUES: ArticleFormValues = {
  title: '',
  summary: '',
  content: '',
  category: null,
  imageUrl: '',
  tags: '',
  isPublished: true,
};

function validateForm(values: ArticleFormValues): ArticleFormErrors {
  const errors: ArticleFormErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Informe o título do artigo.';
  }

  if (!values.summary.trim()) {
    errors.summary = 'Informe o resumo do artigo.';
  }

  if (!values.content.trim()) {
    errors.content = 'Escreva o conteúdo do artigo.';
  }

  if (!values.category) {
    errors.category = 'Selecione uma categoria.';
  }

  return errors;
}

export function AdminArticleFormScreen({
  navigation,
  route,
}: AdminArticleFormScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(
    route.params?.articleId ?? null,
  );
  const isEditing = Boolean(currentArticleId);
  const [formValues, setFormValues] = useState<ArticleFormValues>(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<ArticleFormErrors>({});
  const [screenError, setScreenError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<ImageUploadFile | null>(
    null,
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageSuccessMessage, setImageSuccessMessage] = useState('');
  const [imageErrorMessage, setImageErrorMessage] = useState('');
  const [hasImageLoadError, setHasImageLoadError] = useState(false);
  const [hasAccessDeniedError, setHasAccessDeniedError] = useState(false);

  useEffect(() => {
    setCurrentArticleId(route.params?.articleId ?? null);
  }, [route.params?.articleId]);

  useEffect(() => {
    if (!currentArticleId) {
      setIsLoading(false);
      return;
    }

    const nextArticleId = currentArticleId;
    let isMounted = true;

    async function loadArticle() {
      setIsLoading(true);
      setScreenError('');

      try {
        const article = await articlesService.getArticleById(nextArticleId);

        if (!isMounted) {
          return;
        }

        setFormValues({
          title: article.title,
          summary: article.summary,
          content: article.content,
          category: article.category,
          imageUrl: article.imageUrl ?? '',
          tags: formatTags(article.tags),
          isPublished: Boolean(article.publishedAt),
        });
        setRemoteImageUrl(article.imageUrl ?? null);
        setSelectedImageFile(null);
        setImageErrorMessage('');
        setImageSuccessMessage('');
        setHasAccessDeniedError(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isAdminAccessDeniedError(error)) {
          setHasAccessDeniedError(true);
          setScreenError('');
          return;
        }

        setScreenError(ADMIN_LOAD_DATA_ERROR_MESSAGE);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      isMounted = false;
    };
  }, [currentArticleId]);

  useEffect(() => {
    setHasImageLoadError(false);
  }, [remoteImageUrl, selectedImageFile?.uri]);

  const submitLabel = useMemo(
    () => (isEditing ? 'Salvar alterações' : 'Salvar artigo'),
    [isEditing],
  );

  const previewImageUrl = selectedImageFile?.uri ?? remoteImageUrl;
  const shouldShowImage = Boolean(previewImageUrl) && !hasImageLoadError;

  if (user?.role !== 'ADMIN' || hasAccessDeniedError) {
    return <AdminAccessDenied onGoBack={() => goBackFromAdmin(navigation)} />;
  }

  function clearImageFeedback() {
    setImageErrorMessage('');
    setImageSuccessMessage('');
  }

  function updateField<K extends keyof ArticleFormValues>(
    field: K,
    value: ArticleFormValues[K],
  ) {
    setFormValues(current => ({
      ...current,
      [field]: value,
    }));

    setFormErrors(current => ({
      ...current,
      [field]: undefined,
    }));

    if (screenError) {
      setScreenError('');
    }
  }

  async function handleSelectImage() {
    if (isUploadingImage) {
      return;
    }

    clearImageFeedback();

    try {
      const pickerResponse = await launchImageLibrary(IMAGE_LIBRARY_OPTIONS);

      if (pickerResponse.didCancel) {
        return;
      }

      if (pickerResponse.errorCode || pickerResponse.errorMessage) {
        setImageErrorMessage(ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE);
        return;
      }

      const selectedAsset = pickerResponse.assets?.[0];

      if (!selectedAsset) {
        setImageErrorMessage(ARTICLE_IMAGE_INVALID_MESSAGE);
        return;
      }

      const nextImageFile = normalizeImageUploadFile(
        selectedAsset,
        ARTICLE_IMAGE_FALLBACK_FILE_NAME,
      );

      if (!nextImageFile) {
        setImageErrorMessage(ARTICLE_IMAGE_INVALID_MESSAGE);
        return;
      }

      const validationMessage = validateImageUploadFile(nextImageFile, {
        invalidMessage: ARTICLE_IMAGE_INVALID_MESSAGE,
        maxSizeInBytes: MAX_ARTICLE_IMAGE_FILE_SIZE,
        tooLargeMessage: ARTICLE_IMAGE_TOO_LARGE_MESSAGE,
      });

      if (validationMessage) {
        setImageErrorMessage(validationMessage);
        return;
      }

      setSelectedImageFile(nextImageFile);
      setHasImageLoadError(false);
    } catch {
      setImageErrorMessage(ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE);
    }
  }

  async function uploadSelectedImage(articleId: string) {
    if (!selectedImageFile || isUploadingImage) {
      return false;
    }

    setIsUploadingImage(true);
    setImageErrorMessage('');
    setImageSuccessMessage('');

    try {
      const updatedArticle = await articlesService.uploadArticleImage(
        articleId,
        selectedImageFile,
      );

      setRemoteImageUrl(updatedArticle.imageUrl ?? null);
      setSelectedImageFile(null);
      setHasImageLoadError(false);
      setFormValues(current => ({
        ...current,
        imageUrl: updatedArticle.imageUrl ?? '',
      }));
      setImageSuccessMessage(ARTICLE_IMAGE_SUCCESS_MESSAGE);

      return true;
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return false;
      }

      setImageErrorMessage(
        getSafeAdminImageErrorMessage(error, {
          invalidMessage: ARTICLE_IMAGE_INVALID_MESSAGE,
          tooLargeMessage: ARTICLE_IMAGE_TOO_LARGE_MESSAGE,
          uploadMessage: ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE,
        }),
      );
      return false;
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleUploadImage() {
    if (!currentArticleId) {
      setImageSuccessMessage('');
      setImageErrorMessage(SAVE_ARTICLE_BEFORE_IMAGE_MESSAGE);
      return;
    }

    await uploadSelectedImage(currentArticleId);
  }

  async function handleSubmit() {
    const errors = validateForm(formValues);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: CreateArticlePayload = {
      title: formValues.title,
      summary: formValues.summary,
      content: formValues.content,
      category: formValues.category!,
      imageUrl: formValues.imageUrl,
      tags: parseTags(formValues.tags),
      isPublished: formValues.isPublished,
    };

    const wasEditing = Boolean(currentArticleId);

    setIsSaving(true);
    setScreenError('');

    try {
      const savedArticle = currentArticleId
        ? await articlesService.updateArticle(currentArticleId, payload)
        : await articlesService.createArticle(payload);

      setCurrentArticleId(savedArticle.id);
      setRemoteImageUrl(savedArticle.imageUrl ?? null);
      setFormValues(current => ({
        ...current,
        imageUrl: savedArticle.imageUrl ?? '',
      }));

      if (selectedImageFile) {
        const didUploadImage = await uploadSelectedImage(savedArticle.id);

        if (!didUploadImage) {
          Alert.alert(
            wasEditing ? 'Artigo atualizado.' : 'Artigo salvo.',
            ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE,
          );
          return;
        }
      }

      Alert.alert(
        wasEditing ? 'Artigo atualizado.' : 'Artigo salvo.',
        selectedImageFile ? ARTICLE_IMAGE_SUCCESS_MESSAGE : undefined,
        [
          {
            text: 'OK',
            onPress: () => goBackFromAdmin(navigation),
          },
        ],
      );
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return;
      }

      setScreenError('Não foi possível salvar o artigo.');
    } finally {
      setIsSaving(false);
    }
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
                        {SAVE_ARTICLE_BEFORE_IMAGE_MESSAGE}
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

                {screenError ? <S.ErrorText>{screenError}</S.ErrorText> : null}

                <S.Actions>
                  <PrimaryButton
                    onPress={handleSubmit}
                    loading={isSaving}
                    disabled={isUploadingImage}
                  >
                    {submitLabel}
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
