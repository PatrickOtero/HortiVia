import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

let accessToken: string | null = null;
let unauthorizedHandler: (() => void | Promise<void>) | null = null;

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function setApiUnauthorizedHandler(
  handler: (() => void | Promise<void>) | null,
) {
  unauthorizedHandler = handler;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

export const apiMultipartClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    Accept: 'application/json',
  },
});

delete apiMultipartClient.defaults.headers.post['Content-Type'];
delete apiMultipartClient.defaults.headers.put['Content-Type'];
delete apiMultipartClient.defaults.headers.patch['Content-Type'];

function applyAuthAndMultipartHeaders(config: InternalAxiosRequestConfig) {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = AxiosHeaders.from(config.headers);

    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'multipart/form-data');
    config.headers = headers;
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

apiClient.interceptors.request.use(config => applyAuthAndMultipartHeaders(config));
apiMultipartClient.interceptors.request.use(config =>
  applyAuthAndMultipartHeaders(config),
);

function handleUnauthorizedError(error: unknown) {
  if (
    typeof error === 'object' &&
    error &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 401 &&
    accessToken &&
    unauthorizedHandler
  ) {
    return Promise.resolve()
      .then(() => unauthorizedHandler?.())
      .catch(() => {
        // Keep the original request error as the only surfaced failure.
      })
      .then(() => Promise.reject(error));
  }

  return Promise.reject(error);
}

apiClient.interceptors.response.use(
  response => response,
  error => handleUnauthorizedError(error),
);

apiMultipartClient.interceptors.response.use(
  response => response,
  error => handleUnauthorizedError(error),
);
