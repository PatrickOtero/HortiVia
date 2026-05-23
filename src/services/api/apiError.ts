import axios from 'axios';

type ApiErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'rateLimit'
  | 'network'
  | 'server'
  | 'unknown';

type AuthAction =
  | 'signIn'
  | 'signUp'
  | 'loadSession'
  | 'confirmEmail'
  | 'resendConfirmation';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

function getMessageFromResponse(data: unknown) {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const response = data as {
    message?: string | string[];
  };

  if (Array.isArray(response.message)) {
    return response.message[0];
  }

  return response.message;
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(
        'Nao foi possivel se conectar agora. Tente novamente.',
        'network',
      );
    }

    const status = error.response.status;
    const message =
      getMessageFromResponse(error.response.data) ??
      'Nao foi possivel concluir esta acao.';

    if (status === 400) {
      return new ApiError(message, 'validation', status);
    }

    if (status === 401) {
      return new ApiError(message, 'unauthorized', status);
    }

    if (status === 403) {
      return new ApiError(message, 'forbidden', status);
    }

    if (status === 409) {
      return new ApiError(message, 'conflict', status);
    }

    if (status === 429) {
      return new ApiError(message, 'rateLimit', status);
    }

    if (status >= 500) {
      return new ApiError(message, 'server', status);
    }

    return new ApiError(message, 'unknown', status);
  }

  return new ApiError(
    'Nao foi possivel concluir esta acao agora. Tente novamente.',
    'unknown',
  );
}

export function isUnverifiedEmailError(error: unknown) {
  const apiError = toApiError(error);

  return apiError.kind === 'forbidden';
}

export function getAuthErrorMessage(error: unknown, action: AuthAction) {
  const apiError = toApiError(error);

  if (action === 'signIn') {
    if (apiError.kind === 'unauthorized') {
      return 'E-mail ou senha inv\u00e1lidos.';
    }

    if (apiError.kind === 'forbidden') {
      return 'Confirme seu e-mail antes de entrar.';
    }

    return 'N\u00e3o foi poss\u00edvel entrar agora. Tente novamente.';
  }

  if (action === 'signUp') {
    if (apiError.kind === 'conflict') {
      return 'Este e-mail j\u00e1 est\u00e1 em uso.';
    }

    if (apiError.kind === 'validation') {
      return 'Verifique os dados informados.';
    }

    return 'N\u00e3o foi poss\u00edvel criar sua conta agora. Tente novamente.';
  }

  if (action === 'confirmEmail') {
    if (apiError.kind === 'validation') {
      return 'C\u00f3digo inv\u00e1lido ou expirado.';
    }

    if (apiError.kind === 'server' && apiError.message) {
      return apiError.message;
    }

    return 'N\u00e3o foi poss\u00edvel concluir a opera\u00e7\u00e3o. Tente novamente.';
  }

  if (action === 'resendConfirmation') {
    if (apiError.kind === 'validation') {
      return 'Informe um e-mail v\u00e1lido.';
    }

    if (apiError.kind === 'rateLimit') {
      return 'Aguarde um momento antes de solicitar outro c\u00f3digo.';
    }

    if (apiError.kind === 'server' && apiError.message) {
      return apiError.message;
    }

    return 'N\u00e3o foi poss\u00edvel concluir a opera\u00e7\u00e3o. Tente novamente.';
  }

  return 'N\u00e3o foi poss\u00edvel concluir a opera\u00e7\u00e3o. Tente novamente.';
}
