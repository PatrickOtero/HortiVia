import { useCallback, useEffect, useRef, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  IMAGE_LIBRARY_OPTIONS,
  normalizeImageUploadFile,
  validateImageUploadFile,
  type ImageUploadFile,
} from '../../../utils/images/imagePicker';
import { productsService } from '../../products/services/products.service';
import type { CreateProductPayload } from '../../products/types/product';
import {
  ADMIN_LOAD_DATA_ERROR_MESSAGE,
  getSafeAdminImageErrorMessage,
  isAdminAccessDeniedError,
} from '../utils/adminFeedback';
import {
  INITIAL_PRODUCT_FORM_VALUES,
  productFormToPayload,
  productToFormValues,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
} from '../utils/adminProductForm';

const MAX_PRODUCT_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const PRODUCT_IMAGE_FALLBACK_FILE_NAME = 'product-image.jpg';
const PRODUCT_IMAGE_INVALID_MESSAGE = 'Escolha uma imagem válida.';
const PRODUCT_IMAGE_TOO_LARGE_MESSAGE = 'A imagem deve ter no máximo 5 MB.';
const PRODUCT_IMAGE_UPLOAD_ERROR_MESSAGE = 'Não foi possível enviar a imagem.';
const PRODUCT_IMAGE_SUCCESS_MESSAGE = 'Imagem atualizada.';
const SAVE_PRODUCT_BEFORE_IMAGE_MESSAGE =
  'Salve o produto antes de enviar a imagem.';

type UseAdminProductFormOptions = {
  initialProductId?: string;
};

export function useAdminProductForm({
  initialProductId,
}: UseAdminProductFormOptions = {}) {
  const [currentProductId, setCurrentProductId] = useState<string | null>(
    initialProductId ?? null,
  );
  const [formValues, setFormValues] = useState<ProductFormValues>(
    INITIAL_PRODUCT_FORM_VALUES,
  );
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [screenError, setScreenError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(initialProductId));
  const [isSaving, setIsSaving] = useState(false);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] =
    useState<ImageUploadFile | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageSuccessMessage, setImageSuccessMessage] = useState('');
  const [imageErrorMessage, setImageErrorMessage] = useState('');
  const [hasImageLoadError, setHasImageLoadError] = useState(false);
  const [hasAccessDeniedError, setHasAccessDeniedError] = useState(false);
  const loadRequestId = useRef(0);
  const loadedProductId = useRef<string | null>(null);
  const syncedInitialProductId = useRef(initialProductId);
  const isMounted = useRef(true);
  const isSavingRef = useRef(false);
  const isUploadingRef = useRef(false);

  const isEditing = Boolean(currentProductId);
  const previewImageUrl = selectedImageFile?.uri ?? remoteImageUrl;
  const shouldShowImage = Boolean(previewImageUrl) && !hasImageLoadError;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      loadRequestId.current += 1;
    };
  }, []);

  const loadProduct = useCallback(async (productId: string) => {
    const requestId = ++loadRequestId.current;
    loadedProductId.current = null;
    setIsLoading(true);
    setScreenError('');
    setFormValues(INITIAL_PRODUCT_FORM_VALUES);
    setFormErrors({});
    setRemoteImageUrl(null);
    setSelectedImageFile(null);
    setImageErrorMessage('');
    setImageSuccessMessage('');
    setHasAccessDeniedError(false);

    try {
      const product = await productsService.getProductById(productId);
      if (!isMounted.current || requestId !== loadRequestId.current) return;

      setFormValues(productToFormValues(product));
      loadedProductId.current = productId;
      setRemoteImageUrl(product.imageUrl ?? null);
      setSelectedImageFile(null);
      setImageErrorMessage('');
      setImageSuccessMessage('');
      setHasAccessDeniedError(false);
    } catch (error) {
      if (!isMounted.current || requestId !== loadRequestId.current) return;
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        setScreenError('');
      } else {
        setScreenError(ADMIN_LOAD_DATA_ERROR_MESSAGE);
      }
    } finally {
      if (isMounted.current && requestId === loadRequestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const reloadProduct = useCallback(async () => {
    if (currentProductId) await loadProduct(currentProductId);
  }, [currentProductId, loadProduct]);

  useEffect(() => {
    const nextProductId = initialProductId ?? null;
    syncedInitialProductId.current = initialProductId;
    loadedProductId.current = null;
    setCurrentProductId(nextProductId);

    if (nextProductId) {
      loadProduct(nextProductId);
      return;
    }

    loadRequestId.current += 1;
    loadedProductId.current = null;
    setFormValues(INITIAL_PRODUCT_FORM_VALUES);
    setFormErrors({});
    setRemoteImageUrl(null);
    setSelectedImageFile(null);
    setScreenError('');
    setIsLoading(false);
    setHasAccessDeniedError(false);
  }, [initialProductId, loadProduct]);

  useEffect(() => {
    setHasImageLoadError(false);
  }, [remoteImageUrl, selectedImageFile?.uri]);

  function updateField<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) {
    setFormValues(current => ({ ...current, [field]: value }));
    setFormErrors(current => ({ ...current, [field]: undefined }));
    setScreenError('');
  }

  function clearImageFeedback() {
    setImageErrorMessage('');
    setImageSuccessMessage('');
  }

  async function handleSelectImage() {
    if (isSavingRef.current || isUploadingRef.current) return;
    clearImageFeedback();

    try {
      const response = await launchImageLibrary(IMAGE_LIBRARY_OPTIONS);
      if (!isMounted.current || response.didCancel) return;

      if (response.errorCode || response.errorMessage) {
        setImageErrorMessage(PRODUCT_IMAGE_UPLOAD_ERROR_MESSAGE);
        return;
      }

      const asset = response.assets?.[0];
      const file = asset
        ? normalizeImageUploadFile(asset, PRODUCT_IMAGE_FALLBACK_FILE_NAME)
        : null;
      if (!file) {
        setImageErrorMessage(PRODUCT_IMAGE_INVALID_MESSAGE);
        return;
      }

      const validationMessage = validateImageUploadFile(file, {
        invalidMessage: PRODUCT_IMAGE_INVALID_MESSAGE,
        maxSizeInBytes: MAX_PRODUCT_IMAGE_FILE_SIZE,
        tooLargeMessage: PRODUCT_IMAGE_TOO_LARGE_MESSAGE,
      });
      if (validationMessage) {
        setImageErrorMessage(validationMessage);
        return;
      }

      setSelectedImageFile(file);
      setHasImageLoadError(false);
    } catch {
      if (isMounted.current) {
        setImageErrorMessage(PRODUCT_IMAGE_UPLOAD_ERROR_MESSAGE);
      }
    }
  }

  async function uploadSelectedImage(productId: string, file: ImageUploadFile) {
    if (isUploadingRef.current) return false;

    isUploadingRef.current = true;
    setIsUploadingImage(true);
    setImageErrorMessage('');
    setImageSuccessMessage('');

    try {
      const updatedProduct = await productsService.uploadProductImage(
        productId,
        file,
      );
      if (!isMounted.current) return false;

      const imageUrl = updatedProduct.imageUrl ?? null;
      setRemoteImageUrl(imageUrl);
      setSelectedImageFile(null);
      setHasImageLoadError(false);
      setFormValues(current => ({ ...current, imageUrl: imageUrl ?? '' }));
      setImageSuccessMessage(PRODUCT_IMAGE_SUCCESS_MESSAGE);
      return true;
    } catch (error) {
      if (!isMounted.current) return false;
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
      isUploadingRef.current = false;
      if (isMounted.current) setIsUploadingImage(false);
    }
  }

  async function handleUploadImage() {
    if (!currentProductId) {
      setImageSuccessMessage('');
      setImageErrorMessage(SAVE_PRODUCT_BEFORE_IMAGE_MESSAGE);
      return false;
    }
    if (!selectedImageFile) return false;
    return uploadSelectedImage(currentProductId, selectedImageFile);
  }

  async function handleSubmit() {
    if (isSavingRef.current || isUploadingRef.current) return null;
    if (
      syncedInitialProductId.current !== initialProductId ||
      (initialProductId && initialProductId !== currentProductId) ||
      (currentProductId && loadedProductId.current !== currentProductId)
    ) {
      return null;
    }

    const errors = validateProductForm(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return null;
    }

    const payload: CreateProductPayload = productFormToPayload(formValues);
    const wasEditing = Boolean(currentProductId);
    const imageFile = selectedImageFile;
    isSavingRef.current = true;
    setIsSaving(true);
    setScreenError('');

    try {
      const product = currentProductId
        ? await productsService.updateProduct(currentProductId, payload)
        : await productsService.createProduct(payload);
      if (!isMounted.current) return;

      setCurrentProductId(product.id);
      loadedProductId.current = product.id;
      setRemoteImageUrl(product.imageUrl ?? null);
      setFormValues(current => ({
        ...current,
        imageUrl: product.imageUrl ?? '',
      }));
      if (imageFile && !(await uploadSelectedImage(product.id, imageFile))) {
        return { status: 'image-upload-failed' as const, wasEditing };
      }

      return {
        status: 'saved' as const,
        wasEditing,
        imageUploaded: Boolean(imageFile),
      };
    } catch (error) {
      if (!isMounted.current) return null;
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return { status: 'access-denied' as const };
      } else {
        setScreenError('Não foi possível salvar o produto.');
      }
      return { status: 'failed' as const };
    } finally {
      isSavingRef.current = false;
      if (isMounted.current) setIsSaving(false);
    }
  }

  return {
    currentProductId,
    isEditing,
    formValues,
    formErrors,
    screenError,
    isLoading,
    isSaving,
    selectedImageFile,
    isUploadingImage,
    imageSuccessMessage,
    imageErrorMessage,
    hasImageLoadError,
    hasAccessDeniedError,
    previewImageUrl,
    shouldShowImage,
    saveProductBeforeImageMessage: SAVE_PRODUCT_BEFORE_IMAGE_MESSAGE,
    updateField,
    reloadProduct,
    handleSelectImage,
    handleUploadImage,
    handleSubmit,
    setHasImageLoadError,
  };
}
