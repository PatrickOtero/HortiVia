import { toApiError } from '../../../services/api/apiError';

export const ADMIN_ACCESS_DENIED_MESSAGE =
  'Você não tem permissão para acessar esta área.';
export const ADMIN_LOAD_DATA_ERROR_MESSAGE = 'Não foi possível carregar os dados.';
export const ADMIN_SAVE_ERROR_MESSAGE = 'Não foi possível salvar.';
export const ADMIN_REMOVE_ERROR_MESSAGE = 'Não foi possível remover.';
export const ADMIN_UPLOAD_ERROR_MESSAGE = 'Não foi possível enviar a imagem.';
export const ADMIN_RETRY_MESSAGE = 'Tente novamente.';

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

  return options.uploadMessage ?? ADMIN_UPLOAD_ERROR_MESSAGE;
}
