import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import { authService } from './auth.service';

jest.mock('../../../services/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register sends normalized payload and returns user without authenticating', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        message:
          'Cadastro realizado. Enviamos um código de confirmação para seu e-mail.',
        user: {
          id: 'user-1',
          name: 'Patrick',
          email: 'patrick@email.com',
          avatarUrl: null,
          gender: null,
          role: 'USER',
          emailVerified: false,
          createdAt: '2026-05-22T00:00:00.000Z',
          updatedAt: '2026-05-22T00:00:00.000Z',
        },
      },
    });

    const result = await authService.register({
      name: ' Patrick ',
      email: ' Patrick@Email.com ',
      password: 'SenhaForte@123',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.auth.register,
      {
        name: 'Patrick',
        email: 'patrick@email.com',
        password: 'SenhaForte@123',
      },
    );
    expect(result.user.emailVerified).toBe(false);
    expect(result).not.toHaveProperty('accessToken');
  });

  it('confirmEmail calls the correct endpoint with e-mail and code', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        message: 'E-mail confirmado com sucesso.',
      },
    });

    const result = await authService.confirmEmail({
      email: ' Patrick@Email.com ',
      code: '12a-34 56',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.auth.confirmEmail,
      {
        email: 'patrick@email.com',
        code: '123456',
      },
    );
    expect(result.message).toBe('E-mail confirmado com sucesso.');
  });

  it('resendConfirmation calls the correct endpoint', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        message:
          'Se o e-mail estiver cadastrado, enviaremos um novo código de confirmação.',
      },
    });

    const result = await authService.resendConfirmation({
      email: ' Patrick@Email.com ',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.auth.resendConfirmation,
      {
        email: 'patrick@email.com',
      },
    );
    expect(result.message).toBe(
      'Se o e-mail estiver cadastrado, enviaremos um novo código de confirmação.',
    );
  });
});
