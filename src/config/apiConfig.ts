import { NativeModules } from 'react-native';

const DEVELOPMENT_API_BASE_URL =
  'https://p01--oterofficia-backend--rfp2dvf84z2n.code.run';
const HOMOLOG_API_BASE_URL =
  'https://p01--oterofficia-backend--rfp2dvf84z2n.code.run';
const PRODUCTION_API_BASE_URL =
  'https://p01--frutinavigator--h2j28jgg9qgs.code.run';

type NativeApiConfiguration = {
  environment?: string;
};

export function resolveApiBaseUrl(
  isDevelopment: boolean,
  nativeConfiguration?: NativeApiConfiguration,
) {
  if (isDevelopment) {
    return DEVELOPMENT_API_BASE_URL;
  }

  if (nativeConfiguration?.environment === 'homolog') {
    return HOMOLOG_API_BASE_URL;
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
    ranking: '/training/ranking',
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
    user: (userId: string) => `/profile/${encodeURIComponent(userId)}`,
    get: '/profile',
    update: '/profile',
    avatar: '/profile/avatar',
  },
  preferences: {
    get: '/preferences',
    update: '/preferences',
  },
  users: {
    detail: (userId: string) => `/users/${encodeURIComponent(userId)}`,
  },
} as const;
