import axios, { AxiosHeaders, type AxiosInstance } from 'axios';
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

apiClient.interceptors.request.use(config => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = AxiosHeaders.from(config.headers);

    headers.set('Accept', 'application/json');
    headers.delete('Content-Type');
    config.headers = headers;
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401 && accessToken && unauthorizedHandler) {
      try {
        await unauthorizedHandler();
      } catch {
        // Keep the original request error as the only surfaced failure.
      }
    }

    return Promise.reject(error);
  },
);
