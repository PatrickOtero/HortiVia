import React, { useEffect, useMemo, useState } from 'react';
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
import { productsService } from '../../../products/services/products.service';
import type {
  CreateProductPayload,
  ProductCategory,
} from '../../../products/types/product';
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
  ADMIN_PRODUCT_CATEGORY_OPTIONS,
  formatMultilineList,
  formatNutrients,
  parseMultilineList,
  parseNutrients,
} from '../../utils/adminContent';
import * as S from './styles';

type AdminProductFormScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminProductForm'
>;

type ProductFormValues = {
  name: string;
  category: ProductCategory | null;
  shortDescription: string;
  description: string;
  imageUrl: string;
  benefits: string;
  howToChoose: string;
  howToStore: string;
  usageTips: string;
  nutrients: string;
};

type ProductFormErrors = Partial<
  Record<'name' | 'category' | 'shortDescription', string>
>;

const MAX_PRODUCT_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const PRODUCT_IMAGE_FALLBACK_FILE_NAME = 'product-image.jpg';
const PRODUCT_IMAGE_INVALID_MESSAGE = 'Escolha uma imagem válida.';
const PRODUCT_IMAGE_TOO_LARGE_MESSAGE = 'A imagem deve ter no máximo 5 MB.';
const PRODUCT_IMAGE_UPLOAD_ERROR_MESSAGE = 'Não foi possível enviar a imagem.';
const PRODUCT_IMAGE_SUCCESS_MESSAGE = 'Imagem atualizada.';
const SAVE_PRODUCT_BEFORE_IMAGE_MESSAGE =
  'Salve o produto antes de enviar a imagem.';

const INITIAL_FORM_VALUES: ProductFormValues = {
  name: '',
  category: null,
  shortDescription: '',
  description: '',
  imageUrl: '',
  benefits: '',
  howToChoose: '',
  howToStore: '',
  usageTips: '',
  nutrients: '',
};

function validateForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Informe o nome do produto.';
  }

  if (!values.category) {
    errors.category = 'Selecione uma categoria.';
  }

  if (!values.shortDescription.trim()) {
    errors.shortDescription = 'Informe um resumo curto.';
  }

  return errors;
}

export function AdminProductFormScreen({
  navigation,
  route,
}: AdminProductFormScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentProductId, setCurrentProductId] = useState<string | null>(
    route.params?.productId ?? null,
  );
  const isEditing = Boolean(currentProductId);
  const [formValues, setFormValues] = useState<ProductFormValues>(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
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
    setCurrentProductId(route.params?.productId ?? null);
  }, [route.params?.productId]);

  useEffect(() => {
    if (!currentProductId) {
      setIsLoading(false);
      return;
    }

    const nextProductId = currentProductId;
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setScreenError('');

      try {
        const product = await productsService.getProductById(nextProductId);

        if (!isMounted) {
          return;
        }

        setFormValues({
          name: product.name,
          category: product.category,
          shortDescription: product.shortDescription,
          description: product.description ?? '',
          imageUrl: product.imageUrl ?? '',
          benefits: formatMultilineList(product.benefits),
          howToChoose: formatMultilineList(product.howToChoose),
          howToStore: formatMultilineList(product.howToStore),
          usageTips: formatMultilineList(product.usageTips),
          nutrients: formatNutrients(product.nutrients),
        });
        setRemoteImageUrl(product.imageUrl ?? null);
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

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [currentProductId]);

  useEffect(() => {
    setHasImageLoadError(false);
  }, [remoteImageUrl, selectedImageFile?.uri]);

  const submitLabel = useMemo(
    () => (isEditing ? 'Salvar alterações' : 'Salvar produto'),
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

  function updateField<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
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
        setImageErrorMessage(PRODUCT_IMAGE_UPLOAD_ERROR_MESSAGE);
        return;
      }

      const selectedAsset = pickerResponse.assets?.[0];

      if (!selectedAsset) {
        setImageErrorMessage(PRODUCT_IMAGE_INVALID_MESSAGE);
        return;
      }

      const nextImageFile = normalizeImageUploadFile(
        selectedAsset,
        PRODUCT_IMAGE_FALLBACK_FILE_NAME,
      );

      if (!nextImageFile) {
        setImageErrorMessage(PRODUCT_IMAGE_INVALID_MESSAGE);
        return;
      }

      const validationMessage = validateImageUploadFile(nextImageFile, {
        invalidMessage: PRODUCT_IMAGE_INVALID_MESSAGE,
        maxSizeInBytes: MAX_PRODUCT_IMAGE_FILE_SIZE,
        tooLargeMessage: PRODUCT_IMAGE_TOO_LARGE_MESSAGE,
      });

      if (validationMessage) {
        setImageErrorMessage(validationMessage);
        return;
      }

      setSelectedImageFile(nextImageFile);
      setHasImageLoadError(false);
    } catch {
      setImageErrorMessage(PRODUCT_IMAGE_UPLOAD_ERROR_MESSAGE);
    }
  }

  async function uploadSelectedImage(productId: string) {
    if (!selectedImageFile || isUploadingImage) {
      return false;
    }

    setIsUploadingImage(true);
    setImageErrorMessage('');
    setImageSuccessMessage('');

    try {
      const updatedProduct = await productsService.uploadProductImage(
        productId,
        selectedImageFile,
      );

      setRemoteImageUrl(updatedProduct.imageUrl ?? null);
      setSelectedImageFile(null);
      setHasImageLoadError(false);
      setFormValues(current => ({
        ...current,
        imageUrl: updatedProduct.imageUrl ?? '',
      }));
      setImageSuccessMessage(PRODUCT_IMAGE_SUCCESS_MESSAGE);

      return true;
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return false;
      }

      setImageErrorMessage(
        getSafeAdminImageErrorMessage(error, {
          invalidMessage: PRODUCT_IMAGE_INVALID_MESSAGE,
          tooLargeMessage: PRODUCT_IMAGE_TOO_LARGE_MESSAGE,
          uploadMessage: PRODUCT_IMAGE_UPLOAD_ERROR_MESSAGE,
        }),
      );
      return false;
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleUploadImage() {
    if (!currentProductId) {
      setImageSuccessMessage('');
      setImageErrorMessage(SAVE_PRODUCT_BEFORE_IMAGE_MESSAGE);
      return;
    }

    await uploadSelectedImage(currentProductId);
  }

  async function handleSubmit() {
    const errors = validateForm(formValues);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: CreateProductPayload = {
      name: formValues.name,
      category: formValues.category!,
      shortDescription: formValues.shortDescription,
      description: formValues.description,
      imageUrl: formValues.imageUrl,
      benefits: parseMultilineList(formValues.benefits),
      howToChoose: parseMultilineList(formValues.howToChoose),
      howToStore: parseMultilineList(formValues.howToStore),
      usageTips: parseMultilineList(formValues.usageTips),
      nutrients: parseNutrients(formValues.nutrients),
    };

    const wasEditing = Boolean(currentProductId);

    setIsSaving(true);
    setScreenError('');

    try {
      const savedProduct = currentProductId
        ? await productsService.updateProduct(currentProductId, payload)
        : await productsService.createProduct(payload);

      setCurrentProductId(savedProduct.id);
      setRemoteImageUrl(savedProduct.imageUrl ?? null);
      setFormValues(current => ({
        ...current,
        imageUrl: savedProduct.imageUrl ?? '',
      }));

      if (selectedImageFile) {
        const didUploadImage = await uploadSelectedImage(savedProduct.id);

        if (!didUploadImage) {
          Alert.alert(
            wasEditing ? 'Produto atualizado.' : 'Produto salvo.',
            PRODUCT_IMAGE_UPLOAD_ERROR_MESSAGE,
          );
          return;
        }
      }

      Alert.alert(
        wasEditing ? 'Produto atualizado.' : 'Produto salvo.',
        selectedImageFile ? PRODUCT_IMAGE_SUCCESS_MESSAGE : undefined,
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

      setScreenError('Não foi possível salvar o produto.');
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
                <S.HeaderTitle>{isEditing ? 'Editar produto' : 'Novo produto'}</S.HeaderTitle>
                <S.HeaderSubtitle>Revise as informações mostradas no app.</S.HeaderSubtitle>
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

  if (screenError && isEditing && formValues.name.length === 0) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>Editar produto</S.HeaderTitle>
                <S.HeaderSubtitle>Revise as informações mostradas no app.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>
            <EmptyStateCard
              title={ADMIN_LOAD_DATA_ERROR_MESSAGE}
              description={ADMIN_RETRY_MESSAGE}
            >
              <S.Actions>
                <PrimaryButton
                  onPress={() =>
                    navigation.replace('AdminProductForm', {
                      productId: currentProductId ?? undefined,
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
                <S.HeaderTitle>{isEditing ? 'Editar produto' : 'Novo produto'}</S.HeaderTitle>
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
                  <InputField
                    label="Nome"
                    value={formValues.name}
                    onChangeText={value => updateField('name', value)}
                    helperText={formErrors.name}
                  />

                  <S.CategoryGroup>
                    <S.CategoryLabel>Categoria</S.CategoryLabel>
                    <S.ChipRow>
                      {ADMIN_PRODUCT_CATEGORY_OPTIONS.map(option => (
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

                  <InputField
                    label="Descrição curta"
                    value={formValues.shortDescription}
                    onChangeText={value => updateField('shortDescription', value)}
                    helperText={formErrors.shortDescription}
                  />

                  <InputField
                    label="Descrição"
                    value={formValues.description}
                    onChangeText={value => updateField('description', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

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
                          <S.ImageFallbackTitle>Imagem do produto</S.ImageFallbackTitle>
                          <S.ImageFallbackDescription>
                            Adicione uma imagem para destacar este item.
                          </S.ImageFallbackDescription>
                        </S.ImageFallback>
                      )}
                    </S.ImagePreviewFrame>

                    <S.ImageMeta>
                      <S.ImageMetaTitle>Imagem do produto</S.ImageMetaTitle>
                      <S.ImageMetaDescription>
                        {currentProductId
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
                        disabled={!selectedImageFile || !currentProductId || isSaving}
                      >
                        Enviar imagem
                      </PrimaryButton>
                    </S.ImageActions>

                    {!currentProductId && selectedImageFile ? (
                      <S.ImageMetaDescription>
                        {SAVE_PRODUCT_BEFORE_IMAGE_MESSAGE}
                      </S.ImageMetaDescription>
                    ) : null}
                    {imageSuccessMessage ? (
                      <S.SuccessText>{imageSuccessMessage}</S.SuccessText>
                    ) : null}
                    {imageErrorMessage ? (
                      <S.ErrorText>{imageErrorMessage}</S.ErrorText>
                    ) : null}
                  </S.ImageCard>
                </AdminFormSection>

                <AdminFormSection
                  title="Informações complementares"
                  description="Use uma linha por item. Em nutrientes, use o formato nome: valor."
                >
                  <InputField
                    label="Benefícios"
                    value={formValues.benefits}
                    onChangeText={value => updateField('benefits', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <InputField
                    label="Como escolher"
                    value={formValues.howToChoose}
                    onChangeText={value => updateField('howToChoose', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <InputField
                    label="Como conservar"
                    value={formValues.howToStore}
                    onChangeText={value => updateField('howToStore', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <InputField
                    label="Dicas de uso"
                    value={formValues.usageTips}
                    onChangeText={value => updateField('usageTips', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <InputField
                    label="Nutrientes"
                    value={formValues.nutrients}
                    onChangeText={value => updateField('nutrients', value)}
                    multiline
                    numberOfLines={4}
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
