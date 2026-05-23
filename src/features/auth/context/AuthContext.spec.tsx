import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/auth.service';
import { getToken, removeToken, setToken } from '../storage/authToken.storage';

jest.mock('../services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    confirmEmail: jest.fn(),
    resendConfirmation: jest.fn(),
    getMe: jest.fn(),
  },
}));

jest.mock('../storage/authToken.storage', () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn(),
}));

jest.mock('../../../services/api/apiClient', () => ({
  setApiAccessToken: jest.fn(),
  setApiUnauthorizedHandler: jest.fn(),
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedGetToken = getToken as jest.Mock;
const mockedSetToken = setToken as jest.Mock;
const mockedRemoveToken = removeToken as jest.Mock;

describe('AuthContext', () => {
  type AuthContextSnapshot = ReturnType<typeof useAuth>;

  let latestContext: AuthContextSnapshot | null = null;

  function ContextProbe() {
    latestContext = useAuth();

    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestContext = null;
    mockedGetToken.mockResolvedValue(null);
  });

  it('registerAccount does not authenticate automatically', async () => {
    mockedAuthService.register.mockResolvedValue({
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
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <ContextProbe />
        </AuthProvider>,
      );
    });

    await ReactTestRenderer.act(async () => {
      await latestContext?.registerAccount({
        name: 'Patrick',
        email: 'patrick@email.com',
        password: 'SenhaForte@123',
      });
    });

    expect(mockedSetToken).not.toHaveBeenCalled();
    expect(latestContext?.user).toBeNull();
    expect(latestContext?.accessToken).toBeNull();
    expect(latestContext?.isAuthenticated).toBe(false);
  });

  it('bootstrap clears stored session for unverified users', async () => {
    mockedGetToken.mockResolvedValue('stored-token');
    mockedAuthService.getMe.mockResolvedValue({
      id: 'user-1',
      name: 'Patrick',
      email: 'patrick@email.com',
      avatarUrl: null,
      gender: null,
      role: 'USER',
      emailVerified: false,
      createdAt: '2026-05-22T00:00:00.000Z',
      updatedAt: '2026-05-22T00:00:00.000Z',
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <ContextProbe />
        </AuthProvider>,
      );
    });

    expect(mockedRemoveToken).toHaveBeenCalledTimes(1);
    expect(latestContext?.user).toBeNull();
    expect(latestContext?.isAuthenticated).toBe(false);
  });
});
