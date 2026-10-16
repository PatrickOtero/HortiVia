import { MockXMLHttpRequest as XHR } from './testUtils/nativeHttp';
import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';
import {
  apiClient,
  setApiAccessToken,
  setApiUnauthorizedHandler,
} from './apiClient';
import { toApiError } from './apiError';
import { buildMultipartFormData } from './uploadFormData';

describe('apiClient with the real Axios XHR adapter', () => {
  beforeEach(() => {
    setApiAccessToken(null);
    setApiUnauthorizedHandler(null);
  });

  afterEach(() => {
    setApiAccessToken(null);
    setApiUnauthorizedHandler(null);
  });

  it.each(['get', 'post', 'patch', 'delete'] as const)(
    'preserves %s URLs, headers, JSON and the configured timeout',
    async method => {
      XHR.replies.push({ body: { ok: true } });
      setApiAccessToken('test-token');
      const payload = { title: 'Fruta', enabled: false, count: 0, empty: null };
      const hasBody = method === 'post' || method === 'patch';

      const response = await apiClient.request({
        method,
        url: '/http-regression',
        params: { page: 2, search: 'a & b', omitted: undefined },
        ...(hasBody ? { data: payload } : {}),
      });

      const request = XHR.requests[0];
      expect(request.open).toHaveBeenCalledWith(
        method.toUpperCase(),
        `${API_CONFIG.baseURL}/http-regression?page=2&search=a+%26+b`,
        true,
      );
      expect(request.timeout).toBe(API_CONFIG.timeout);
      expect(request.headers).toEqual({
        accept: 'application/json',
        authorization: 'Bearer test-token',
        ...(hasBody ? { 'content-type': 'application/json' } : {}),
      });
      expect(request.send).toHaveBeenCalledWith(
        hasBody ? JSON.stringify(payload) : null,
      );
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ ok: true });
    },
  );

  it('uses the current token and removes it after logout without stale defaults', async () => {
    XHR.replies.push({}, {}, {});
    setApiAccessToken('first-test-token');
    await apiClient.get('/http-regression');
    setApiAccessToken('second-test-token');
    await apiClient.get('/http-regression');
    setApiAccessToken(null);
    await apiClient.get('/http-regression');

    expect(XHR.requests.map(request => request.headers.authorization)).toEqual([
      'Bearer first-test-token',
      'Bearer second-test-token',
      undefined,
    ]);
  });

  it('preserves caller headers and replaces Authorization with the session Bearer', async () => {
    XHR.replies.push({});
    setApiAccessToken('test-token');
    await apiClient.post(
      '/http-regression',
      { name: 'Fruta' },
      {
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer old-test-token',
          'X-Request-Id': 'test-id',
        },
      },
    );

    expect(XHR.requests[0].headers).toMatchObject({
      authorization: 'Bearer test-token',
      'content-type': 'application/json',
      'x-request-id': 'test-id',
    });
    expect(
      Object.keys(XHR.requests[0].headers).filter(
        key => key === 'authorization',
      ),
    ).toHaveLength(1);
  });

  it('passes native FormData unchanged with multipart and Bearer headers', async () => {
    XHR.replies.push({ body: { uploaded: true } }, {});
    setApiAccessToken('test-token');
    const form = buildMultipartFormData({
      fileFieldName: 'image',
      file: { uri: 'file:///test-image.jpg', type: 'image/jpeg' },
      fallbackFileName: 'image.jpg',
      fields: {
        imageAlt: 'Fruta',
        count: 0,
        enabled: false,
        skipped: null,
        omitted: undefined,
      },
    });

    const response = await apiClient.post('/http-regression/image', form);

    expect(XHR.requests[0].send).toHaveBeenCalledWith(form);
    expect(form).toBeInstanceOf(FormData);
    expect(form.getAll('image')).toEqual([
      { uri: 'file:///test-image.jpg', name: 'image.jpg', type: 'image/jpeg' },
    ]);
    expect(form.getParts()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fieldName: 'imageAlt', string: 'Fruta' }),
        expect.objectContaining({ fieldName: 'count', string: '0' }),
        expect.objectContaining({ fieldName: 'enabled', string: 'false' }),
      ]),
    );
    expect(form.getParts()).toHaveLength(4);
    const convertRequestBody = jest.requireActual<{
      default: (data: FormData) => {
        formData: ReturnType<FormData['getParts']>;
      };
    }>('react-native/Libraries/Network/convertRequestBody').default;
    expect(convertRequestBody(form)).toEqual({ formData: form.getParts() });
    expect(response.config.headers.get('Content-Type')).toBe(
      'multipart/form-data',
    );
    // Axios 1.20 delegates the wire Content-Type/boundary to native networking.
    // RN 0.85.3: Android NetworkingModule and iOS RCTNetworking handle formData.
    expect(XHR.requests[0].headers).toEqual({
      accept: 'application/json',
      authorization: 'Bearer test-token',
    });
    await apiClient.post('/http-regression', { afterUpload: true });
    expect(XHR.requests[1].headers['content-type']).toBe('application/json');
  });

  it.each(['resolve', 'reject', 'throw'] as const)(
    'keeps the original 401 when the session callback will %s',
    async outcome => {
      XHR.replies.push({
        status: 401,
        body: { message: 'Expired test session' },
      });
      setApiAccessToken('test-token');
      const handler = jest.fn(() => {
        if (outcome === 'throw') {
          throw new Error('callback failed');
        }
        if (outcome === 'reject') {
          return Promise.reject(new Error('callback failed'));
        }
        return Promise.resolve();
      });
      setApiUnauthorizedHandler(handler);

      const error = await apiClient
        .get('/http-regression')
        .catch((failure: unknown) => failure);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(axios.isAxiosError(error)).toBe(true);
      expect(error).toMatchObject({
        code: 'ERR_BAD_REQUEST',
        response: { status: 401, data: { message: 'Expired test session' } },
      });
      expect(toApiError(error)).toMatchObject({
        kind: 'unauthorized',
        status: 401,
      });
    },
  );

  it('awaits the unauthorized callback before rejecting the request', async () => {
    XHR.replies.push({ status: 401 });
    setApiAccessToken('test-token');
    let finishHandler!: () => void;
    let notifyStarted!: () => void;
    const started = new Promise<void>(resolve => {
      notifyStarted = resolve;
    });
    const handler = jest.fn(
      () =>
        new Promise<void>(resolve => {
          finishHandler = resolve;
          notifyStarted();
        }),
    );
    setApiUnauthorizedHandler(handler);
    const rejected = jest.fn();
    const pending = apiClient.get('/http-regression').catch(rejected);
    await started;
    expect(handler).toHaveBeenCalledTimes(1);
    expect(rejected).not.toHaveBeenCalled();
    finishHandler();
    await pending;
    expect(rejected).toHaveBeenCalledWith(
      expect.objectContaining({
        response: expect.objectContaining({ status: 401 }),
      }),
    );
  });

  it('does not call the session handler for an unauthenticated 401', async () => {
    XHR.replies.push({ status: 401 });
    const handler = jest.fn();
    setApiUnauthorizedHandler(handler);
    await expect(apiClient.get('/http-regression')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects an authenticated 401 even without a session handler', async () => {
    XHR.replies.push({ status: 401 });
    setApiAccessToken('test-token');
    await expect(apiClient.get('/http-regression')).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it.each([
    [400, 'validation'],
    [403, 'forbidden'],
    [409, 'conflict'],
    [429, 'rateLimit'],
    [500, 'server'],
    [502, 'server'],
  ])(
    'preserves HTTP %i errors and their application mapping',
    async (status, kind) => {
      XHR.replies.push({
        status: Number(status),
        body: { message: ['Test failure', 'Other detail'] },
      });
      setApiAccessToken('test-token');
      const handler = jest.fn();
      setApiUnauthorizedHandler(handler);
      const error = await apiClient
        .get('/http-regression')
        .catch((failure: unknown) => failure);
      expect(axios.isAxiosError(error)).toBe(true);
      expect(toApiError(error)).toMatchObject({
        kind,
        status,
        message: 'Test failure',
      });
      expect(handler).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['error', 'ERR_NETWORK'],
    ['timeout', 'ECONNABORTED'],
    ['abort', 'ECONNABORTED'],
  ] as const)(
    'preserves %s failures without expiring the session',
    async (event, code) => {
      XHR.replies.push({ event });
      setApiAccessToken('test-token');
      const handler = jest.fn();
      setApiUnauthorizedHandler(handler);
      const error = await apiClient
        .get('/http-regression')
        .catch((failure: unknown) => failure);
      expect(error).toMatchObject({ code, isAxiosError: true });
      expect(error).not.toHaveProperty('response');
      expect(toApiError(error)).toMatchObject({ kind: 'network' });
      expect(handler).not.toHaveBeenCalled();
    },
  );

  it('rejects a status-zero HTTP loadend as an aborted request in Axios 1.20', async () => {
    XHR.replies.push({ status: 0, body: '' });
    await expect(apiClient.get('/http-regression')).rejects.toMatchObject({
      code: 'ECONNABORTED',
      isAxiosError: true,
    });
  });

  it.each(['<html>unexpected</html>', '{invalid-json', '', 'null'])(
    'preserves the default response transformation for %p',
    async body => {
      XHR.replies.push({ body });
      const response = await apiClient.get('/http-regression');
      expect(response.data).toBe(body === 'null' ? null : body);
    },
  );

  it('keeps unexpected HTTP error bodies available and maps them safely', async () => {
    XHR.replies.push({ status: 502, body: '<html>gateway failure</html>' });
    const error = await apiClient
      .get('/http-regression')
      .catch((failure: unknown) => failure);
    expect(error).toMatchObject({
      response: { status: 502, data: '<html>gateway failure</html>' },
    });
    expect(toApiError(error)).toMatchObject({ kind: 'server', status: 502 });
  });
});
