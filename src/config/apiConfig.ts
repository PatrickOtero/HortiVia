import { NativeModules } from 'react-native';

const PRODUCTION_API_BASE_URL =
  'https://p01--frutinavigator--h2j28jgg9qgs.code.run';
const DEVELOPMENT_API_BASE_URL = 'http://127.0.0.1:3001';
const PRODUCTION_API_HOST = 'p01--frutinavigator--h2j28jgg9qgs.code.run';
const HTTPS_API_URL_PATTERN =
  /^https:\/\/([a-z0-9.-]+)(?::\d+)?(?:\/[^\s?#]*)?\/?$/i;

type NativeApiConfiguration = {
  apiBaseUrl?: string;
  environment?: string;
};

function resolveRemoteApiUrl(baseUrl?: string) {
  const match = baseUrl?.match(HTTPS_API_URL_PATTERN);
  if (!baseUrl || !match) {
    throw new Error('Remote development and homologation builds require a valid HTTPS API URL.');
  }
  if (match[1].toLowerCase() === PRODUCTION_API_HOST) {
    throw new Error('Remote development and homologation builds cannot target production.');
  }
  return baseUrl;
}

export function resolveApiBaseUrl(
  isDevelopment: boolean,
  nativeConfiguration?: NativeApiConfiguration,
) {
  if (isDevelopment) {
    if (nativeConfiguration?.environment === 'development-remote') {
      return resolveRemoteApiUrl(nativeConfiguration.apiBaseUrl);
    }
    return DEVELOPMENT_API_BASE_URL;
  }
  if (nativeConfiguration?.environment === 'homolog') {
    return resolveRemoteApiUrl(nativeConfiguration.apiBaseUrl);
  }
  return PRODUCTION_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl(
  __DEV__,
  NativeModules.HortiViaConfig as NativeApiConfiguration | undefined,
);

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  training: {
    product: (productId: string) => `/training/products/${encodeURIComponent(productId)}`,
    answer: (questionId: string) => `/training/questions/${encodeURIComponent(questionId)}/answers`,
    progress: '/training/progress',
    adminQuestions: (productId: string) => `/admin/training/products/${encodeURIComponent(productId)}/questions`,
    adminQuestion: (productId: string, questionId: string) =>
      `/admin/training/products/${encodeURIComponent(productId)}/questions/${encodeURIComponent(questionId)}`,
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    confirmEmail: '/auth/confirm-email',
    resendConfirmation: '/auth/resend-confirmation',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    resendPasswordResetCode: '/auth/resend-password-reset-code',
    me: '/auth/me',
  },
  products: {
    list: '/products',
    detail: (productId: string) => `/products/${productId}`,
    image: (productId: string) => `/products/${productId}/image`,
    favorite: (productId: string) => `/products/${productId}/favorite`,
    images: (productId: string) => `/products/${productId}/images`,
    imagesUpload: (productId: string) => `/products/${productId}/images/upload`,
    imageDetail: (productId: string, imageId: string) =>
      `/products/${productId}/images/${imageId}`,
    imageFile: (productId: string, imageId: string) =>
      `/products/${productId}/images/${imageId}/file`,
    guideSections: (productId: string) =>
      `/products/${productId}/guide-sections`,
    guideSectionDetail: (productId: string, sectionId: string) =>
      `/products/${productId}/guide-sections/${sectionId}`,
    guideSectionImage: (productId: string, sectionId: string) =>
      `/products/${productId}/guide-sections/${sectionId}/image`,
  },
  articles: {
    list: '/articles',
    detail: (articleId: string) => `/articles/${articleId}`,
    adminDetail: (articleId: string) => `/articles/${articleId}/admin`,
    image: (articleId: string) => `/articles/${articleId}/image`,
    comments: (articleId: string) => `/articles/${articleId}/comments`,
    commentDetail: (articleId: string, commentId: string) =>
      `/articles/${articleId}/comments/${commentId}`,
    commentModeration: (articleId: string, commentId: string) =>
      `/articles/${articleId}/comments/${commentId}/moderation`,
    blocks: (articleId: string) => `/articles/${articleId}/blocks`,
    blockDetail: (articleId: string, blockId: string) =>
      `/articles/${articleId}/blocks/${blockId}`,
    blockImageUpload: (articleId: string, blockId: string) =>
      `/articles/${articleId}/blocks/${blockId}/image-upload`,
    blockImage: (articleId: string, blockId: string) =>
      `/articles/${articleId}/blocks/${blockId}/image`,
    save: (articleId: string) => `/articles/${articleId}/save`,
    reactions: (articleId: string) => `/articles/${articleId}/reactions`,
  },
  favorites: {
    products: '/favorites/products',
  },
  saved: {
    articles: '/saved/articles',
  },
  profile: {
    get: '/profile',
    update: '/profile',
    avatar: '/profile/avatar',
  },
  preferences: {
    get: '/preferences',
    update: '/preferences',
  },
} as const;
