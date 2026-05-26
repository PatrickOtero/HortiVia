import { toApiError } from '../../../services/api/apiError';

export const ADMIN_ACCESS_DENIED_MESSAGE =
  'Você não pode acessar esta área.';
export const ADMIN_LOAD_DATA_ERROR_MESSAGE =
  'Não foi possível carregar os dados.';
export const ADMIN_SAVE_ERROR_MESSAGE = 'Não foi possível salvar.';
export const ADMIN_REMOVE_ERROR_MESSAGE = 'Não foi possível remover.';
export const ADMIN_UPLOAD_ERROR_MESSAGE = 'Não foi possível enviar a imagem.';
export const ADMIN_RETRY_MESSAGE = 'Tente novamente.';
export const ADMIN_UNAVAILABLE_VISUAL_UPLOAD_MESSAGE =
  'Esse recurso ainda não está disponível no servidor atual.';

function normalizeErrorMessage(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function isAdminAccessDeniedError(error: unknown) {
  const apiError = toApiError(error);

  return apiError.kind === 'forbidden' || apiError.kind === 'unauthorized';
}

export function getSafeAdminImageErrorMessage(
  error: unknown,
  options: {
    invalidMessage: string;
    tooLargeMessage: string;
    uploadMessage?: string;
  },
) {
  const apiError = toApiError(error);
  const normalizedMessage = normalizeErrorMessage(apiError.message);

  if (normalizedMessage.includes('5 mb') || normalizedMessage.includes('5mb')) {
    return options.tooLargeMessage;
  }

  if (
    normalizedMessage.includes('jpeg') ||
    normalizedMessage.includes('png') ||
    normalizedMessage.includes('webp') ||
    normalizedMessage.includes('formato') ||
    normalizedMessage.includes('mime') ||
    normalizedMessage.includes('tipo') ||
    normalizedMessage.includes('valida')
  ) {
    return options.invalidMessage;
  }

  if (
    apiError.status === 404 &&
    (normalizedMessage.includes('/images/upload') ||
      (normalizedMessage.includes('/images/') &&
        normalizedMessage.includes('/file')) ||
      (normalizedMessage.includes('/guide-sections/') &&
        normalizedMessage.includes('/image')))
  ) {
    return ADMIN_UNAVAILABLE_VISUAL_UPLOAD_MESSAGE;
  }

  return options.uploadMessage ?? ADMIN_UPLOAD_ERROR_MESSAGE;
}

export function getSafeAdminSaveErrorMessage(error: unknown) {
  const apiError = toApiError(error);
  const normalizedMessage = normalizeErrorMessage(apiError.message);

  if (apiError.kind === 'validation') {
    return 'Verifique os campos preenchidos.';
  }

  if (
    apiError.status === 404 &&
    (normalizedMessage.includes('secao do produto nao encontrada') ||
      normalizedMessage.includes('produto nao encontrado'))
  ) {
    return 'Atualize a tela e tente novamente.';
  }

  if (
    apiError.status === 404 &&
    (normalizedMessage.includes('/images/upload') ||
      (normalizedMessage.includes('/images/') &&
        normalizedMessage.includes('/file')) ||
      (normalizedMessage.includes('/guide-sections/') &&
        normalizedMessage.includes('/image')))
  ) {
    return ADMIN_UNAVAILABLE_VISUAL_UPLOAD_MESSAGE;
  }

  return ADMIN_SAVE_ERROR_MESSAGE;
}
