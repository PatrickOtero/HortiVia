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
  | 'resendConfirmation'
  | 'requestPasswordReset'
  | 'resetPassword'
  | 'resendPasswordResetCode';

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

function normalizeMessageForComparison(message: string) {
  return message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(
        'Não foi possível se conectar agora. Tente novamente.',
        'network',
      );
    }

    const status = error.response.status;
    const message =
      getMessageFromResponse(error.response.data) ??
      'Não foi possível concluir agora.';

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
    'Não foi possível concluir esta ação agora. Tente novamente.',
    'unknown',
  );
}

export function isUnverifiedEmailError(error: unknown) {
  const apiError = toApiError(error);

  return apiError.kind === 'forbidden';
}

export function getAuthErrorMessage(error: unknown, action: AuthAction) {
  const apiError = toApiError(error);
  const normalizedMessage = normalizeMessageForComparison(apiError.message);

  if (action === 'signIn') {
    if (apiError.kind === 'unauthorized') {
      return 'E-mail ou senha inválidos.';
    }

    if (apiError.kind === 'forbidden') {
      return 'Confirme seu e-mail antes de entrar.';
    }

    return 'Não foi possível entrar agora. Tente novamente.';
  }

  if (action === 'signUp') {
    if (apiError.kind === 'conflict') {
      return 'Este e-mail já está em uso.';
    }

    if (apiError.kind === 'validation') {
      return 'Verifique os dados informados.';
    }

    return 'Não foi possível criar sua conta agora. Tente novamente.';
  }

  if (action === 'confirmEmail') {
    if (apiError.kind === 'validation') {
      return 'Código inválido ou expirado.';
    }

    if (apiError.kind === 'server' && apiError.message) {
      return apiError.message;
    }

    return 'Não foi possível concluir agora. Tente novamente.';
  }

  if (action === 'resendConfirmation') {
    if (apiError.kind === 'validation') {
      return 'Informe um e-mail válido.';
    }

    if (apiError.kind === 'rateLimit') {
      return 'Aguarde um momento antes de pedir outro código.';
    }

    if (apiError.kind === 'server' && apiError.message) {
      return apiError.message;
    }

    return 'Não foi possível concluir agora. Tente novamente.';
  }

  if (action === 'requestPasswordReset') {
    if (apiError.kind === 'validation') {
      return 'Informe um e-mail válido.';
    }

    return 'Não foi possível enviar o código agora. Tente novamente.';
  }

  if (action === 'resetPassword') {
    if (apiError.kind === 'validation') {
      if (normalizedMessage.includes('expir') && normalizedMessage.includes('codigo')) {
        return 'Código inválido ou expirado.';
      }

      if (normalizedMessage.includes('e-mail') || normalizedMessage.includes('email')) {
        return 'Informe um e-mail válido.';
      }

      if (normalizedMessage.includes('nova senha')) {
        return 'Informe uma nova senha.';
      }

      if (
        normalizedMessage.includes('caractere especial') ||
        normalizedMessage.includes('letra maiuscula') ||
        normalizedMessage.includes('letra minuscula')
      ) {
        return 'A senha deve incluir letra maiúscula, letra minúscula, número e caractere especial.';
      }

      if (normalizedMessage.includes('10') && normalizedMessage.includes('72')) {
        return 'A senha deve ter entre 10 e 72 caracteres.';
      }

      if (normalizedMessage.includes('espaco')) {
        return 'A senha não pode começar ou terminar com espaços.';
      }

      if (normalizedMessage.includes('quebra de linha')) {
        return 'A senha não pode conter quebra de linha.';
      }
    }

    return 'Não foi possível concluir agora. Tente novamente.';
  }

  if (action === 'resendPasswordResetCode') {
    if (apiError.kind === 'validation') {
      return 'Informe um e-mail válido.';
    }

    if (apiError.kind === 'rateLimit') {
      return 'Aguarde um momento antes de pedir outro código.';
    }

    return 'Não foi possível concluir agora. Tente novamente.';
  }

  if (action === 'loadSession') {
    return 'Não foi possível abrir sua conta agora.';
  }

  return 'Não foi possível concluir agora. Tente novamente.';
}
