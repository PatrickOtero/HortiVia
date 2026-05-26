import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  TextButton,
} from '../../../../components';
import { useTheme } from '../../../../hooks/useTheme';
import { toApiError } from '../../../../services/api/apiError';
import { AppStackParamList } from '../../../../types/navigation';
import {
  IMAGE_LIBRARY_OPTIONS,
  normalizeImageUploadFile,
  validateImageUploadFile,
  type ImageUploadFile,
} from '../../../../utils/images/imagePicker';
import { useAuth } from '../../../auth/hooks/useAuth';
import {
  getEditableProductImages,
  getLegacyProductImage,
} from '../../../products/mappers/product.mapper';
import { productsService } from '../../../products/services/products.service';
import type {
  ProductDetail,
  ProductGuideImage,
  ProductGuideSection,
  ProductImageKind,
} from '../../../products/types/product';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminFormSection } from '../../components/AdminFormSection';
import {
  ADMIN_LOAD_DATA_ERROR_MESSAGE,
  ADMIN_REMOVE_ERROR_MESSAGE,
  ADMIN_RETRY_MESSAGE,
  getSafeAdminImageErrorMessage,
  getSafeAdminSaveErrorMessage,
  isAdminAccessDeniedError,
} from '../../utils/adminFeedback';
import { goBackFromAdmin } from '../../utils/adminNavigation';
import {
  getInitialGuideSectionFormValuesFromItem,
  getInitialImageFormValuesFromItem,
  getProductGuideSectionKindValueLabel,
  getProductImageKindLabel,
  INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES,
  INITIAL_PRODUCT_IMAGE_FORM_VALUES,
  PRODUCT_GUIDE_SECTION_KIND_OPTIONS,
  PRODUCT_IMAGE_KIND_OPTIONS,
  toCreateProductGuideSectionPayload,
  toCreateProductImagePayload,
  toUpdateProductGuideSectionPayload,
  toUpdateProductImagePayload,
  validateProductGuideSectionForm,
  validateProductImageForm,
  type ProductGuideSectionFormErrors,
  type ProductGuideSectionFormValues,
  type ProductImageFormErrors,
  type ProductImageFormValues,
} from '../../utils/adminVisualContent';
import * as S from './styles';

type AdminProductVisualContentScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminProductVisualContent'
>;

type EditorMode = 'create' | 'edit';

type ImageEditorState =
  | {
      mode: EditorMode;
      imageId?: string;
    }
  | null;

type SectionEditorState =
  | {
      mode: EditorMode;
      sectionId?: string;
    }
  | null;

const MAX_VISUAL_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const VISUAL_IMAGE_INVALID_MESSAGE = 'Escolha uma imagem válida.';
const VISUAL_IMAGE_TOO_LARGE_MESSAGE = 'A imagem deve ter no máximo 5 MB.';
const VISUAL_IMAGE_UPLOAD_ERROR_MESSAGE = 'Não foi possível enviar a imagem.';

type PreviewCardProps = {
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  badgeLabel?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
};

function PreviewCard({
  imageUrl,
  title,
  subtitle,
  badgeLabel,
  onEdit,
  onDelete,
  isDeleting = false,
}: PreviewCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(imageUrl) && !hasImageError;

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <S.ItemCard>
      <S.ItemRow>
        <S.PreviewFrame>
          {shouldShowImage ? (
            <S.PreviewImage
              source={{ uri: imageUrl ?? undefined }}
              resizeMode="cover"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <S.PreviewFallback>
              <S.PreviewFallbackBadge>
                <S.PreviewFallbackBadgeText>HortiVia</S.PreviewFallbackBadgeText>
              </S.PreviewFallbackBadge>
              <S.PreviewFallbackText>Sem imagem</S.PreviewFallbackText>
            </S.PreviewFallback>
          )}
        </S.PreviewFrame>

        <S.ItemCopy>
          <S.ItemTitle>{title}</S.ItemTitle>
          {badgeLabel ? <S.ItemMeta>{badgeLabel}</S.ItemMeta> : null}
          {subtitle ? <S.ItemSubtitle>{subtitle}</S.ItemSubtitle> : null}
        </S.ItemCopy>
      </S.ItemRow>

      {onEdit || onDelete ? (
        <S.ItemActions>
          {onEdit ? (
            <SecondaryButton fullWidth={false} onPress={onEdit}>
              Editar
            </SecondaryButton>
          ) : null}
          {onDelete ? (
            <TextButton
              fullWidth={false}
              onPress={onDelete}
              loading={isDeleting}
              disabled={isDeleting}
            >
              Excluir
            </TextButton>
          ) : null}
        </S.ItemActions>
      ) : null}
    </S.ItemCard>
  );
}

function buildSectionPreview(section: ProductGuideSection) {
  const lines = [section.body ?? '', ...(section.bullets ?? [])].filter(Boolean);

  return lines.join(' ').slice(0, 120);
}

export function AdminProductVisualContentScreen({
  navigation,
  route,
}: AdminProductVisualContentScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const productId = route.params.productId;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [screenError, setScreenError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [hasAccessDeniedError, setHasAccessDeniedError] = useState(false);
  const [imageEditor, setImageEditor] = useState<ImageEditorState>(null);
  const [sectionEditor, setSectionEditor] = useState<SectionEditorState>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<ImageUploadFile | null>(
    null,
  );
  const [selectedSectionImageFile, setSelectedSectionImageFile] =
    useState<ImageUploadFile | null>(null);
  const [imageFormValues, setImageFormValues] = useState<ProductImageFormValues>(
    INITIAL_PRODUCT_IMAGE_FORM_VALUES,
  );
  const [imageFormErrors, setImageFormErrors] = useState<ProductImageFormErrors>({});
  const [sectionFormValues, setSectionFormValues] =
    useState<ProductGuideSectionFormValues>(
      INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES,
    );
  const [sectionFormErrors, setSectionFormErrors] =
    useState<ProductGuideSectionFormErrors>({});
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setScreenError('');

    try {
      const nextProduct = await productsService.getProductById(productId);
      setProduct(nextProduct);
      setHasAccessDeniedError(false);
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return;
      }

      toApiError(error);
      setScreenError('Não foi possível carregar o conteúdo visual.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const editableImages = useMemo(
    () => getEditableProductImages(product?.mainImages ?? []),
    [product?.mainImages],
  );
  const legacyImage = useMemo(
    () => getLegacyProductImage(product?.mainImages ?? []),
    [product?.mainImages],
  );
  const guideSections = useMemo(
    () => product?.guideSections ?? [],
    [product?.guideSections],
  );
  const editingImage = useMemo(
    () =>
      imageEditor?.mode === 'edit' && imageEditor.imageId
        ? editableImages.find(image => image.id === imageEditor.imageId) ?? null
        : null,
    [editableImages, imageEditor],
  );
  const editingSection = useMemo(
    () =>
      sectionEditor?.mode === 'edit' && sectionEditor.sectionId
        ? guideSections.find(section => section.id === sectionEditor.sectionId) ?? null
        : null,
    [guideSections, sectionEditor],
  );

  if (user?.role !== 'ADMIN' || hasAccessDeniedError) {
    return <AdminAccessDenied onGoBack={() => goBackFromAdmin(navigation)} />;
  }

  function resetImageEditor() {
    setImageEditor(null);
    setImageFormValues(INITIAL_PRODUCT_IMAGE_FORM_VALUES);
    setImageFormErrors({});
    setSelectedImageFile(null);
  }

  function resetSectionEditor() {
    setSectionEditor(null);
    setSectionFormValues(INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES);
    setSectionFormErrors({});
    setSelectedSectionImageFile(null);
  }

  function updateImageField<K extends keyof ProductImageFormValues>(
    field: K,
    value: ProductImageFormValues[K],
  ) {
    setImageFormValues(current => ({
      ...current,
      [field]: value,
    }));

    setImageFormErrors(current => ({
      ...current,
      [field]: undefined,
    }));
  }

  function updateSectionField<K extends keyof ProductGuideSectionFormValues>(
    field: K,
    value: ProductGuideSectionFormValues[K],
  ) {
    setSectionFormValues(current => ({
      ...current,
      [field]: value,
    }));

    setSectionFormErrors(current => ({
      ...current,
      [field]: undefined,
    }));
  }

  function startCreateImage() {
    resetSectionEditor();
    setFeedbackMessage('');
    setImageEditor({ mode: 'create' });
    setImageFormValues(INITIAL_PRODUCT_IMAGE_FORM_VALUES);
    setSelectedImageFile(null);
  }

  function startEditImage(image: ProductGuideImage) {
    resetSectionEditor();
    setFeedbackMessage('');
    setImageEditor({ mode: 'edit', imageId: image.id });
    setImageFormValues(getInitialImageFormValuesFromItem(image));
    setImageFormErrors({});
    setSelectedImageFile(null);
  }

  function startCreateSection() {
    resetImageEditor();
    setFeedbackMessage('');
    setSectionEditor({ mode: 'create' });
    setSectionFormValues(INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES);
    setSelectedSectionImageFile(null);
  }

  function startEditSection(section: ProductGuideSection) {
    resetImageEditor();
    setFeedbackMessage('');
    setSectionEditor({ mode: 'edit', sectionId: section.id });
    setSectionFormValues(getInitialGuideSectionFormValuesFromItem(section));
    setSectionFormErrors({});
    setSelectedSectionImageFile(null);
  }

  async function handleSelectGalleryImage() {
    try {
      const pickerResponse = await launchImageLibrary(IMAGE_LIBRARY_OPTIONS);

      if (pickerResponse.didCancel) {
        return;
      }

      if (pickerResponse.errorCode || pickerResponse.errorMessage) {
        setScreenError(VISUAL_IMAGE_UPLOAD_ERROR_MESSAGE);
        return;
      }

      const selectedAsset = pickerResponse.assets?.[0];

      if (!selectedAsset) {
        setScreenError(VISUAL_IMAGE_INVALID_MESSAGE);
        return;
      }

      const nextImageFile = normalizeImageUploadFile(
        selectedAsset,
        'product-gallery-image.jpg',
      );

      if (!nextImageFile) {
        setScreenError(VISUAL_IMAGE_INVALID_MESSAGE);
        return;
      }

      const validationMessage = validateImageUploadFile(nextImageFile, {
        invalidMessage: VISUAL_IMAGE_INVALID_MESSAGE,
        maxSizeInBytes: MAX_VISUAL_IMAGE_FILE_SIZE,
        tooLargeMessage: VISUAL_IMAGE_TOO_LARGE_MESSAGE,
      });

      if (validationMessage) {
        setScreenError(validationMessage);
        return;
      }

      setSelectedImageFile(nextImageFile);
      setScreenError('');
    } catch {
      setScreenError(VISUAL_IMAGE_UPLOAD_ERROR_MESSAGE);
    }
  }

  async function handleSelectSectionImage() {
    try {
      const pickerResponse = await launchImageLibrary(IMAGE_LIBRARY_OPTIONS);

      if (pickerResponse.didCancel) {
        return;
      }

      if (pickerResponse.errorCode || pickerResponse.errorMessage) {
        setScreenError(VISUAL_IMAGE_UPLOAD_ERROR_MESSAGE);
        return;
      }

      const selectedAsset = pickerResponse.assets?.[0];

      if (!selectedAsset) {
        setScreenError(VISUAL_IMAGE_INVALID_MESSAGE);
        return;
      }

      const nextImageFile = normalizeImageUploadFile(
        selectedAsset,
        'product-guide-section.jpg',
      );

      if (!nextImageFile) {
        setScreenError(VISUAL_IMAGE_INVALID_MESSAGE);
        return;
      }

      const validationMessage = validateImageUploadFile(nextImageFile, {
        invalidMessage: VISUAL_IMAGE_INVALID_MESSAGE,
        maxSizeInBytes: MAX_VISUAL_IMAGE_FILE_SIZE,
        tooLargeMessage: VISUAL_IMAGE_TOO_LARGE_MESSAGE,
      });

      if (validationMessage) {
        setScreenError(validationMessage);
        return;
      }

      setSelectedSectionImageFile(nextImageFile);
      setScreenError('');
    } catch {
      setScreenError(VISUAL_IMAGE_UPLOAD_ERROR_MESSAGE);
    }
  }

  async function uploadSelectedGuideSectionImage(sectionId: string) {
    if (!selectedSectionImageFile) {
      return true;
    }

    try {
      await productsService.uploadProductGuideSectionImage(
        productId,
        sectionId,
        selectedSectionImageFile,
      );

      return true;
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return false;
      }

      setScreenError(
        getSafeAdminImageErrorMessage(error, {
          invalidMessage: VISUAL_IMAGE_INVALID_MESSAGE,
          tooLargeMessage: VISUAL_IMAGE_TOO_LARGE_MESSAGE,
          uploadMessage:
            'A seção foi salva, mas não foi possível enviar a imagem.',
        }),
      );
      await loadProduct();

      return false;
    }
  }

  async function handleSaveImage() {
    const errors = validateProductImageForm(imageFormValues);

    if (Object.keys(errors).length > 0) {
      setImageFormErrors(errors);
      return;
    }

    if (imageEditor?.mode === 'create' && !selectedImageFile) {
      setScreenError('Escolha uma imagem antes de salvar.');
      return;
    }

    setIsSavingImage(true);
    setScreenError('');

    try {
      if (imageEditor?.mode === 'edit' && imageEditor.imageId) {
        if (selectedImageFile) {
          await productsService.replaceProductImageFile(
            productId,
            imageEditor.imageId,
            selectedImageFile,
            toUpdateProductImagePayload(imageFormValues),
          );
        } else {
          await productsService.updateProductImage(
            productId,
            imageEditor.imageId,
            toUpdateProductImagePayload(imageFormValues),
          );
        }
        setFeedbackMessage('Imagem atualizada.');
      } else {
        await productsService.createProductImageWithUpload(
          productId,
          selectedImageFile!,
          toCreateProductImagePayload(imageFormValues),
        );
        setFeedbackMessage('Imagem adicionada.');
      }

      resetImageEditor();
      await loadProduct();
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return;
      }

      toApiError(error);
      setScreenError(getSafeAdminSaveErrorMessage(error));
    } finally {
      setIsSavingImage(false);
    }
  }

  async function handleSaveSection() {
    const errors = validateProductGuideSectionForm(sectionFormValues);

    if (Object.keys(errors).length > 0) {
      setSectionFormErrors(errors);
      return;
    }

    setIsSavingSection(true);
    setScreenError('');

    try {
      let savedSectionId = sectionEditor?.sectionId ?? null;

      if (sectionEditor?.mode === 'edit' && sectionEditor.sectionId) {
        const updatedSection = await productsService.updateProductGuideSection(
          productId,
          sectionEditor.sectionId,
          toUpdateProductGuideSectionPayload(sectionFormValues),
        );
        savedSectionId = updatedSection.id;
        setFeedbackMessage('Seção atualizada.');
      } else {
        const createdSection = await productsService.createProductGuideSection(
          productId,
          toCreateProductGuideSectionPayload(sectionFormValues),
        );
        savedSectionId = createdSection.id;
        setFeedbackMessage('Seção adicionada.');
      }

      if (selectedSectionImageFile && savedSectionId) {
        const imageUploaded = await uploadSelectedGuideSectionImage(savedSectionId);

        if (!imageUploaded) {
          return;
        }
      }

      resetSectionEditor();
      await loadProduct();
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return;
      }

      toApiError(error);
      setScreenError(getSafeAdminSaveErrorMessage(error));
    } finally {
      setIsSavingSection(false);
    }
  }

  async function handleRemoveSectionImage() {
    if (!editingSection) {
      return;
    }

    setIsSavingSection(true);
    setScreenError('');

    try {
      await productsService.removeProductGuideSectionImage(
        productId,
        editingSection.id,
      );
      setSelectedSectionImageFile(null);
      setFeedbackMessage('Seção atualizada.');
      await loadProduct();
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return;
      }

      toApiError(error);
      setScreenError(ADMIN_REMOVE_ERROR_MESSAGE);
    } finally {
      setIsSavingSection(false);
    }
  }

  function confirmDeleteImage(image: ProductGuideImage) {
    Alert.alert(
      'Remover este item?',
      'Esta ação não altera o produto, apenas remove este conteúdo visual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingImageId(image.id);
            setScreenError('');

            try {
              await productsService.deleteProductImage(productId, image.id);
              setFeedbackMessage('Imagem removida.');
              await loadProduct();
            } catch (error) {
              if (isAdminAccessDeniedError(error)) {
                setHasAccessDeniedError(true);
                return;
              }

              toApiError(error);
              setScreenError(ADMIN_REMOVE_ERROR_MESSAGE);
            } finally {
              setDeletingImageId(null);
            }
          },
        },
      ],
    );
  }

  function confirmDeleteSection(section: ProductGuideSection) {
    Alert.alert(
      'Remover este item?',
      'Esta ação não altera o produto, apenas remove este conteúdo visual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingSectionId(section.id);
            setScreenError('');

            try {
              await productsService.deleteProductGuideSection(productId, section.id);
              setFeedbackMessage('Seção removida.');
              await loadProduct();
            } catch (error) {
              if (isAdminAccessDeniedError(error)) {
                setHasAccessDeniedError(true);
                return;
              }

              toApiError(error);
              setScreenError(ADMIN_REMOVE_ERROR_MESSAGE);
            } finally {
              setDeletingSectionId(null);
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>Conteúdo visual</S.HeaderTitle>
                <S.HeaderSubtitle>Aguarde um instante.</S.HeaderSubtitle>
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

  if (!product) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>Conteúdo visual</S.HeaderTitle>
                <S.HeaderSubtitle>Revise o material deste produto.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            <EmptyStateCard
              title={screenError || ADMIN_LOAD_DATA_ERROR_MESSAGE}
              description={ADMIN_RETRY_MESSAGE}
            >
              <S.Actions>
                <PrimaryButton onPress={loadProduct}>Tentar novamente</PrimaryButton>
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
                <S.HeaderTitle>Conteúdo visual</S.HeaderTitle>
                <S.HeaderSubtitle>{product.name}</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            <SurfaceCard>
              <S.PanelContent>
                <SectionTitle
                  title="Conteúdo visual"
                  subtitle="Revise as imagens e as orientações práticas deste produto."
                />
                {feedbackMessage ? <S.SuccessText>{feedbackMessage}</S.SuccessText> : null}
                {screenError ? <S.ErrorText>{screenError}</S.ErrorText> : null}
              </S.PanelContent>
            </SurfaceCard>

            <SurfaceCard>
              <S.FormStack>
                <AdminFormSection
                  title="Galeria do produto"
                  description="Use imagens que ajudem o usuário a reconhecer o produto em diferentes situações."
                >
                  {legacyImage ? (
                    <PreviewCard
                      title="Imagem atual do produto"
                      subtitle="Ela ainda vem da imagem principal do cadastro."
                      imageUrl={legacyImage.imageUrl}
                      badgeLabel="Imagem principal"
                    />
                  ) : null}

                  {editableImages.length === 0 ? (
                    <EmptyStateCard
                      title="Nenhuma imagem cadastrada."
                      description="Adicione imagens para enriquecer a visualização deste produto."
                    >
                      <PrimaryButton onPress={startCreateImage}>
                        Adicionar imagem
                      </PrimaryButton>
                    </EmptyStateCard>
                  ) : (
                    <S.Stack>
                      {editableImages.map(image => (
                        <PreviewCard
                          key={image.id}
                          title={getProductImageKindLabel(
                            (image.kind as ProductImageKind) ?? 'OTHER',
                          )}
                          subtitle={
                            [
                              image.caption,
                              typeof image.sortOrder === 'number'
                                ? `Ordem ${image.sortOrder}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(' • ') || 'Sem legenda'
                          }
                          badgeLabel={image.isPrimary ? 'Imagem principal' : null}
                          imageUrl={image.imageUrl}
                          onEdit={() => startEditImage(image)}
                          onDelete={() => confirmDeleteImage(image)}
                          isDeleting={deletingImageId === image.id}
                        />
                      ))}
                    </S.Stack>
                  )}

                  {imageEditor ? (
                    <S.EditorCard>
                      <S.EditorHeader>
                        <S.EditorTitle>
                          {imageEditor.mode === 'edit'
                            ? 'Editar imagem'
                            : 'Nova imagem'}
                        </S.EditorTitle>
                      </S.EditorHeader>

                      <PreviewCard
                        title="Prévia da imagem"
                        subtitle={
                          selectedImageFile
                            ? 'Arquivo selecionado para envio.'
                            : editingImage?.imageUrl
                              ? 'Imagem atual cadastrada.'
                              : 'Escolha uma imagem para enviar.'
                        }
                        imageUrl={selectedImageFile?.uri ?? editingImage?.imageUrl}
                      />

                      <S.Actions>
                        <SecondaryButton
                          onPress={handleSelectGalleryImage}
                          disabled={isSavingImage}
                        >
                          Escolher imagem
                        </SecondaryButton>
                      </S.Actions>

                      <S.FieldGroup>
                        <S.FieldLabel>Tipo da imagem</S.FieldLabel>
                        <S.ChipRow>
                          {PRODUCT_IMAGE_KIND_OPTIONS.map(option => (
                            <FilterChip
                              key={option.value}
                              label={option.label}
                              active={imageFormValues.kind === option.value}
                              onPress={() => updateImageField('kind', option.value)}
                            />
                          ))}
                        </S.ChipRow>
                        {imageFormErrors.kind ? (
                          <S.ErrorText>{imageFormErrors.kind}</S.ErrorText>
                        ) : null}
                      </S.FieldGroup>

                      <InputField
                        label="Texto alternativo"
                        value={imageFormValues.alt}
                        onChangeText={value => updateImageField('alt', value)}
                      />
                      <InputField
                        label="Legenda"
                        value={imageFormValues.caption}
                        onChangeText={value => updateImageField('caption', value)}
                      />
                      <InputField
                        label="Ordem"
                        value={imageFormValues.sortOrder}
                        onChangeText={value => updateImageField('sortOrder', value)}
                        keyboardType="number-pad"
                        helperText={imageFormErrors.sortOrder}
                      />

                      <S.FieldGroup>
                        <S.FieldLabel>Imagem principal</S.FieldLabel>
                        <S.ChipRow>
                          <FilterChip
                            label="Sim"
                            active={imageFormValues.isPrimary}
                            onPress={() => updateImageField('isPrimary', true)}
                          />
                          <FilterChip
                            label="Não"
                            active={!imageFormValues.isPrimary}
                            onPress={() => updateImageField('isPrimary', false)}
                          />
                        </S.ChipRow>
                      </S.FieldGroup>

                      <S.Actions>
                        <PrimaryButton
                          onPress={handleSaveImage}
                          loading={isSavingImage}
                          disabled={isSavingSection}
                        >
                          Salvar
                        </PrimaryButton>
                        <SecondaryButton
                          onPress={resetImageEditor}
                          disabled={isSavingImage}
                        >
                          Cancelar
                        </SecondaryButton>
                      </S.Actions>
                    </S.EditorCard>
                  ) : (
                    <SecondaryButton onPress={startCreateImage}>
                      Adicionar imagem
                    </SecondaryButton>
                  )}
                </AdminFormSection>
              </S.FormStack>
            </SurfaceCard>

            <SurfaceCard>
              <S.FormStack>
                <AdminFormSection
                  title="Seções do guia"
                  description="Crie orientações práticas como escolha, conservação e aproveitamento."
                >
                  {guideSections.length === 0 ? (
                    <EmptyStateCard
                      title="Nenhuma seção cadastrada."
                      description="Adicione orientações práticas para completar este guia."
                    >
                      <PrimaryButton onPress={startCreateSection}>
                        Adicionar seção
                      </PrimaryButton>
                    </EmptyStateCard>
                  ) : (
                    <S.Stack>
                      {guideSections.map(section => (
                        <PreviewCard
                          key={section.id}
                          title={section.title}
                          subtitle={
                            [
                              buildSectionPreview(section),
                              typeof section.sortOrder === 'number'
                                ? `Ordem ${section.sortOrder}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(' • ')
                          }
                          badgeLabel={getProductGuideSectionKindValueLabel(
                            ({
                              choose: 'CHOOSE',
                              observe: 'OBSERVE',
                              store: 'STORE',
                              use: 'USE',
                              quickFacts: 'QUICK_FACTS',
                              other: 'OTHER',
                            } as const)[section.kind],
                          )}
                          imageUrl={section.imageUrl}
                          onEdit={() => startEditSection(section)}
                          onDelete={() => confirmDeleteSection(section)}
                          isDeleting={deletingSectionId === section.id}
                        />
                      ))}
                    </S.Stack>
                  )}

                  {sectionEditor ? (
                    <S.EditorCard>
                      <S.EditorHeader>
                        <S.EditorTitle>
                          {sectionEditor.mode === 'edit'
                            ? 'Editar seção'
                            : 'Nova seção'}
                        </S.EditorTitle>
                      </S.EditorHeader>

                      <S.FieldGroup>
                        <S.FieldLabel>Tipo da seção</S.FieldLabel>
                        <S.ChipRow>
                          {PRODUCT_GUIDE_SECTION_KIND_OPTIONS.map(option => (
                            <FilterChip
                              key={option.value}
                              label={option.label}
                              active={sectionFormValues.kind === option.value}
                              onPress={() => updateSectionField('kind', option.value)}
                            />
                          ))}
                        </S.ChipRow>
                        {sectionFormErrors.kind ? (
                          <S.ErrorText>{sectionFormErrors.kind}</S.ErrorText>
                        ) : null}
                      </S.FieldGroup>

                      <InputField
                        label="Título"
                        value={sectionFormValues.title}
                        onChangeText={value => updateSectionField('title', value)}
                        helperText={sectionFormErrors.title}
                      />

                      <InputField
                        label="Texto principal"
                        value={sectionFormValues.body}
                        onChangeText={value => updateSectionField('body', value)}
                        helperText={sectionFormErrors.body}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                      />

                      <PreviewCard
                        title="Imagem da seção"
                        subtitle={
                          selectedSectionImageFile
                            ? 'Arquivo selecionado para envio.'
                            : editingSection?.imageUrl
                              ? 'Imagem atual cadastrada.'
                              : 'Esta seção ainda não tem imagem.'
                        }
                        imageUrl={
                          selectedSectionImageFile?.uri ?? editingSection?.imageUrl
                        }
                      />

                      <S.Actions>
                        <SecondaryButton
                          onPress={handleSelectSectionImage}
                          disabled={isSavingSection}
                        >
                          Escolher imagem
                        </SecondaryButton>
                        {editingSection?.imageUrl ? (
                          <TextButton
                            fullWidth={false}
                            onPress={handleRemoveSectionImage}
                            loading={isSavingSection}
                            disabled={isSavingSection}
                          >
                            Remover imagem
                          </TextButton>
                        ) : null}
                      </S.Actions>

                      <InputField
                        label="Texto alternativo da imagem"
                        value={sectionFormValues.imageAlt}
                        onChangeText={value => updateSectionField('imageAlt', value)}
                      />
                      <InputField
                        label="Legenda da imagem"
                        value={sectionFormValues.imageCaption}
                        onChangeText={value =>
                          updateSectionField('imageCaption', value)
                        }
                      />
                      <InputField
                        label="Pontos principais"
                        value={sectionFormValues.bullets}
                        onChangeText={value => updateSectionField('bullets', value)}
                        helperText="Use um item por linha, separados por vírgula, ou cole um array JSON."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                      <InputField
                        label="Sinais ideais"
                        value={sectionFormValues.idealPoints}
                        onChangeText={value =>
                          updateSectionField('idealPoints', value)
                        }
                        helperText="Use um item por linha, separados por vírgula, ou cole um array JSON."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                      <InputField
                        label="Sinais de atenção"
                        value={sectionFormValues.avoidPoints}
                        onChangeText={value =>
                          updateSectionField('avoidPoints', value)
                        }
                        multiline
                        helperText="Use um item por linha, separados por vírgula, ou cole um array JSON."
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                      <InputField
                        label="Ordem"
                        value={sectionFormValues.sortOrder}
                        onChangeText={value => updateSectionField('sortOrder', value)}
                        keyboardType="number-pad"
                        helperText={sectionFormErrors.sortOrder}
                      />

                      <S.Actions>
                        <PrimaryButton
                          onPress={handleSaveSection}
                          loading={isSavingSection}
                          disabled={isSavingImage}
                        >
                          Salvar
                        </PrimaryButton>
                        <SecondaryButton
                          onPress={resetSectionEditor}
                          disabled={isSavingSection}
                        >
                          Cancelar
                        </SecondaryButton>
                      </S.Actions>
                    </S.EditorCard>
                  ) : (
                    <SecondaryButton onPress={startCreateSection}>
                      Adicionar seção
                    </SecondaryButton>
                  )}
                </AdminFormSection>
              </S.FormStack>
            </SurfaceCard>
          </S.Content>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
