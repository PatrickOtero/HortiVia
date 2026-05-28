import type { ImageUploadFile } from '../../../utils/images/imagePicker';
import { validateImageUploadFile } from '../../../utils/images/imagePicker';

export const MAX_ARTICLE_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const ARTICLE_IMAGE_INVALID_MESSAGE =
  'Escolha uma imagem em JPG, PNG ou WebP.';
export const ARTICLE_IMAGE_TOO_LARGE_MESSAGE =
  'A imagem selecionada e muito grande.';
export const ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE =
  'Nao foi possivel enviar a imagem do bloco.';

export function validateArticleImageUploadFile(file: ImageUploadFile) {
  if (typeof file.size !== 'number' || file.size <= 0) {
    return ARTICLE_IMAGE_INVALID_MESSAGE;
  }

  return validateImageUploadFile(file, {
    invalidMessage: ARTICLE_IMAGE_INVALID_MESSAGE,
    maxSizeInBytes: MAX_ARTICLE_IMAGE_FILE_SIZE,
    tooLargeMessage: ARTICLE_IMAGE_TOO_LARGE_MESSAGE,
  });
}
