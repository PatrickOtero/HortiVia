export const API_BASE_URL = 'https://p01--frutinavigator--h2j28jgg9qgs.code.run';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
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
  },
  articles: {
    list: '/articles',
    detail: (articleId: string) => `/articles/${articleId}`,
    image: (articleId: string) => `/articles/${articleId}/image`,
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
