import axios from 'axios';

type ApiErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'conflict'
  | 'network'
  | 'server'
  | 'unknown';

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

    if (status === 409) {
      return new ApiError(message, 'conflict', status);
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

export function getAuthErrorMessage(
  error: unknown,
  action: 'signIn' | 'signUp' | 'loadSession',
) {
  const apiError = toApiError(error);

  if (action === 'signIn') {
    if (apiError.kind === 'unauthorized') {
      return 'E-mail ou senha invalidos.';
    }

    if (apiError.kind === 'network') {
      return 'Nao foi possivel entrar agora. Tente novamente.';
    }

    return 'Nao foi possivel entrar agora. Tente novamente.';
  }

  if (action === 'signUp') {
    if (apiError.kind === 'conflict') {
      return 'Este e-mail ja esta em uso.';
    }

    if (apiError.kind === 'validation') {
      return 'Confira os dados informados.';
    }

    if (apiError.kind === 'network') {
      return 'Nao foi possivel criar sua conta agora. Tente novamente.';
    }

    return 'Nao foi possivel criar sua conta agora. Tente novamente.';
  }

  return 'Nao foi possivel continuar agora. Tente novamente.';
}
