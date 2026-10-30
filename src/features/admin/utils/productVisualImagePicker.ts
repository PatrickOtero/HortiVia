import { launchImageLibrary } from 'react-native-image-picker';
import {
  IMAGE_LIBRARY_OPTIONS,
  normalizeImageUploadFile,
  validateImageUploadFile,
  type ImageUploadFile,
} from '../../../utils/images/imagePicker';

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const INVALID_IMAGE_MESSAGE = 'Escolha uma imagem válida.';
const IMAGE_TOO_LARGE_MESSAGE = 'A imagem deve ter no máximo 5 MB.';
const IMAGE_PICKER_ERROR_MESSAGE = 'Não foi possível enviar a imagem.';

export type ProductVisualImageSelection =
  | { status: 'cancelled' }
  | { status: 'error'; message: string }
  | { status: 'selected'; file: ImageUploadFile };

export async function selectProductVisualImage(
  fallbackFileName: string,
): Promise<ProductVisualImageSelection> {
  try {
    const response = await launchImageLibrary(IMAGE_LIBRARY_OPTIONS);
    if (response.didCancel) return { status: 'cancelled' };
    if (response.errorCode || response.errorMessage) {
      return { status: 'error', message: IMAGE_PICKER_ERROR_MESSAGE };
    }

    const asset = response.assets?.[0];
    const file = asset
      ? normalizeImageUploadFile(asset, fallbackFileName)
      : null;
    if (!file) return { status: 'error', message: INVALID_IMAGE_MESSAGE };

    const validationError = validateImageUploadFile(file, {
      invalidMessage: INVALID_IMAGE_MESSAGE,
      maxSizeInBytes: MAX_IMAGE_FILE_SIZE,
      tooLargeMessage: IMAGE_TOO_LARGE_MESSAGE,
    });
    if (validationError) return { status: 'error', message: validationError };

    return { status: 'selected', file };
  } catch {
    return { status: 'error', message: IMAGE_PICKER_ERROR_MESSAGE };
  }
}
