import { MockXMLHttpRequest as XHR } from '../../../services/api/testUtils/nativeHttp';
import { API_CONFIG, API_ENDPOINTS } from '../../../config/apiConfig';
import {
  setApiAccessToken,
  setApiUnauthorizedHandler,
} from '../../../services/api/apiClient';
import { authService } from './auth.service';

describe('authService HTTP contracts', () => {
  beforeEach(() => {
    setApiAccessToken(null);
    setApiUnauthorizedHandler(null);
  });

  afterEach(() => {
    setApiAccessToken(null);
    setApiUnauthorizedHandler(null);
  });

  const user = {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.invalid',
    role: 'USER',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('normalizes login JSON, preserves the password and returns the token and user', async () => {
    XHR.replies.push({ body: { user, accessToken: 'test-token' } });
    const result = await authService.login({
      email: ' Test@Example.Invalid ',
      password: ' test-password ',
    });

    expect(XHR.requests[0].open).toHaveBeenCalledWith(
      'POST',
      `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.login}`,
      true,
    );
    expect(XHR.requests[0].send).toHaveBeenCalledWith(
      JSON.stringify({
        email: 'test@example.invalid',
        password: ' test-password ',
      }),
    );
    expect(XHR.requests[0].headers).toEqual({
      accept: 'application/json',
      'content-type': 'application/json',
    });
    expect(result).toEqual({
      accessToken: 'test-token',
      user: { ...user, avatarUrl: null, gender: null },
    });
  });

  it('normalizes registration JSON without creating a session', async () => {
    XHR.replies.push(
      { status: 201, body: { user, message: 'Confirm test email' } },
      {},
    );
    const result = await authService.register({
      name: ' Test User ',
      email: ' Test@Example.Invalid ',
      password: 'test-password',
    });

    expect(XHR.requests[0].open).toHaveBeenCalledWith(
      'POST',
      `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.register}`,
      true,
    );
    expect(XHR.requests[0].send).toHaveBeenCalledWith(
      JSON.stringify({
        name: 'Test User',
        email: 'test@example.invalid',
        password: 'test-password',
      }),
    );
    expect(result).toEqual({
      message: 'Confirm test email',
      user: { ...user, avatarUrl: null, gender: null },
    });
    expect(result).not.toHaveProperty('accessToken');
    // A subsequent request is still anonymous until the auth context sets a token.
    await authService.resendConfirmation({ email: user.email });
    expect(XHR.requests.every(request => !request.headers.authorization)).toBe(
      true,
    );
  });

  it('propagates invalid-credential 401 responses without invoking session expiry', async () => {
    XHR.replies.push({
      status: 401,
      body: { message: 'Invalid test credentials' },
    });
    const handler = jest.fn();
    setApiUnauthorizedHandler(handler);
    await expect(
      authService.login({
        email: user.email,
        password: 'incorrect-test-password',
      }),
    ).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 401, data: { message: 'Invalid test credentials' } },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('gets the current user with Bearer authentication', async () => {
    XHR.replies.push({ body: user });
    setApiAccessToken('test-token');
    await expect(authService.getMe()).resolves.toEqual({
      ...user,
      avatarUrl: null,
      gender: null,
    });
    expect(XHR.requests[0].open).toHaveBeenCalledWith(
      'GET',
      `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.me}`,
      true,
    );
    expect(XHR.requests[0].headers.authorization).toBe('Bearer test-token');
  });
});
