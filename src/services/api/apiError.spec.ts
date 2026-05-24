import { getAuthErrorMessage, isUnverifiedEmailError } from './apiError';

function createAxiosLikeError(status: number, message: string) {
  return {
    isAxiosError: true,
    response: {
      status,
      data: {
        message,
      },
    },
  };
}

describe('apiError auth mapping', () => {
  it('maps login 403 to unverified e-mail message', () => {
    const error = createAxiosLikeError(
      403,
      'Confirme seu e-mail antes de entrar.',
    );

    expect(getAuthErrorMessage(error, 'signIn')).toBe(
      'Confirme seu e-mail antes de entrar.',
    );
    expect(isUnverifiedEmailError(error)).toBe(true);
  });

  it('maps invalid confirmation code to a safe message', () => {
    const error = createAxiosLikeError(
      400,
      'C\u00f3digo inv\u00e1lido ou expirado.',
    );

    expect(getAuthErrorMessage(error, 'confirmEmail')).toBe(
      'C\u00f3digo inv\u00e1lido ou expirado.',
    );
  });

  it('maps resend cooldown to a safe message', () => {
    const error = createAxiosLikeError(
      429,
      'Aguarde um momento antes de solicitar outro c\u00f3digo.',
    );

    expect(getAuthErrorMessage(error, 'resendConfirmation')).toBe(
      'Aguarde um momento antes de pedir outro c\u00f3digo.',
    );
  });

  it('maps password reset invalid code to a safe message', () => {
    const error = createAxiosLikeError(
      400,
      'C\u00f3digo inv\u00e1lido ou expirado.',
    );

    expect(getAuthErrorMessage(error, 'resetPassword')).toBe(
      'C\u00f3digo inv\u00e1lido ou expirado.',
    );
  });

  it('maps password reset resend cooldown to a safe message', () => {
    const error = createAxiosLikeError(
      429,
      'Aguarde um momento antes de solicitar outro c\u00f3digo.',
    );

    expect(getAuthErrorMessage(error, 'resendPasswordResetCode')).toBe(
      'Aguarde um momento antes de pedir outro c\u00f3digo.',
    );
  });
});
