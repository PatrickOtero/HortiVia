import { perform, renderNavigation } from './testUtils/navigationHarness';
import React from 'react';
import { AuthProvider, useAuth } from '../features/auth/context/AuthContext';
import { authService } from '../features/auth/services/auth.service';
import {
  getToken,
  removeToken,
  setToken,
} from '../features/auth/storage/authToken.storage';
import {
  setApiAccessToken,
  setApiUnauthorizedHandler,
} from '../services/api/apiClient';
import { RootNavigator } from './RootNavigator';
import { focusedProbe } from './testUtils/NavigationProbe';

jest.mock('../features/auth/services/auth.service', () => ({
  authService: { login: jest.fn(), getMe: jest.fn(), register: jest.fn() },
}));
jest.mock('../features/auth/storage/authToken.storage', () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn(),
}));

let auth: ReturnType<typeof useAuth>;
function SessionNavigation() {
  auth = useAuth();
  return (
    <RootNavigator
      isAuthenticated={auth.isAuthenticated}
      isLoading={auth.isLoading}
    />
  );
}

describe('real AuthProvider connected to RootNavigator', () => {
  const user = {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.invalid',
    avatarUrl: null,
    gender: null,
    role: 'USER' as const,
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const credentials = { email: user.email, password: 'test-password-only' };
  const unauthorized = {
    isAxiosError: true,
    response: { status: 401, data: { message: 'Expired test session' } },
  };
  const service = jest.mocked(authService);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getToken).mockResolvedValue(null);
    jest.mocked(setToken).mockResolvedValue(undefined);
    jest.mocked(removeToken).mockResolvedValue(undefined);
    service.login.mockResolvedValue({ user, accessToken: 'test-token' });
    service.getMe.mockResolvedValue(user);
    setApiAccessToken(null);
    setApiUnauthorizedHandler(null);
  });
  afterEach(() => {
    setApiAccessToken(null);
    setApiUnauthorizedHandler(null);
  });

  async function mount() {
    await renderNavigation(
      <AuthProvider>
        <SessionNavigation />
      </AuthProvider>,
    );
  }

  it('switches from Login to Home on sign-in and clears protected history on sign-out', async () => {
    await mount();
    expect(focusedProbe().route.name).toBe('Login');
    await perform(() => auth.signIn(credentials));
    expect(service.login).toHaveBeenCalledWith(credentials);
    expect(setToken).toHaveBeenCalledWith('test-token');
    expect(focusedProbe().route.name).toBe('Home');
    await perform(() => focusedProbe().navigation.navigate('EditProfile'));
    await perform(() => auth.signOut());
    expect(removeToken).toHaveBeenCalled();
    expect(focusedProbe().route.name).toBe('Login');
    expect(focusedProbe().navigation.canGoBack()).toBe(false);
  });

  it('restores a verified stored session into Home', async () => {
    jest.mocked(getToken).mockResolvedValue('stored-test-token');
    await mount();
    expect(service.getMe).toHaveBeenCalledTimes(1);
    expect(focusedProbe().route.name).toBe('Home');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('sends an expired stored session to Login and removes its token', async () => {
    jest.mocked(getToken).mockResolvedValue('expired-test-token');
    service.getMe.mockRejectedValue(unauthorized);
    await mount();
    expect(removeToken).toHaveBeenCalled();
    expect(focusedProbe().route.name).toBe('Login');
    expect(focusedProbe().navigation.canGoBack()).toBe(false);
    expect(auth.isAuthenticated).toBe(false);
  });

  it('keeps failed login on the authentication stack', async () => {
    service.login.mockRejectedValue(unauthorized);
    await mount();
    await perform(async () => {
      await expect(auth.signIn(credentials)).rejects.toBe(unauthorized);
    });
    expect(focusedProbe().route.name).toBe('Login');
    expect(setToken).not.toHaveBeenCalled();
  });

  it('keeps registration unauthenticated until a verified sign-in', async () => {
    service.register.mockResolvedValue({
      message: 'Confirm test email',
      user: { ...user, emailVerified: false },
    });
    await mount();
    await perform(() =>
      auth.registerAccount({ ...credentials, name: user.name }),
    );
    expect(auth.isAuthenticated).toBe(false);
    expect(focusedProbe().route.name).toBe('Login');
    expect(setToken).not.toHaveBeenCalled();
  });
});
