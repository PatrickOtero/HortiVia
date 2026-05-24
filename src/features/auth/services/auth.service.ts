import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import {
  normalizeConfirmationCode,
  normalizeEmail,
} from '../validation/auth.validation';
import type {
  AuthActionResponse,
  AuthUser,
  ConfirmEmailPayload,
  LoginResponse,
  RequestPasswordResetPayload,
  RegisterResponse,
  ResendPasswordResetCodePayload,
  ResetPasswordPayload,
} from '../types/auth';

type AuthUserResponse = LoginResponse['user'];

function normalizeUser(user: AuthUserResponse): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    gender: user.gender ?? null,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function normalizeLoginResponse(data: LoginResponse): LoginResponse {
  return {
    user: normalizeUser(data.user),
    accessToken: data.accessToken,
  };
}

function normalizeRegisterResponse(data: RegisterResponse): RegisterResponse {
  return {
    message: data.message,
    user: normalizeUser(data.user),
  };
}

export const authService = {
  async login(payload: { email: string; password: string }) {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, {
      email: normalizeEmail(payload.email),
      password: payload.password,
    });

    return normalizeLoginResponse(response.data);
  },

  async register(payload: { name: string; email: string; password: string }) {
    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.auth.register,
      {
        name: payload.name.trim(),
        email: normalizeEmail(payload.email),
        password: payload.password,
      },
    );

    return normalizeRegisterResponse(response.data);
  },

  async confirmEmail(payload: ConfirmEmailPayload) {
    const response = await apiClient.post<AuthActionResponse>(
      API_ENDPOINTS.auth.confirmEmail,
      {
        email: normalizeEmail(payload.email),
        code: normalizeConfirmationCode(payload.code),
      },
    );

    return response.data;
  },

  async resendConfirmation(payload: { email: string }) {
    const response = await apiClient.post<AuthActionResponse>(
      API_ENDPOINTS.auth.resendConfirmation,
      {
        email: normalizeEmail(payload.email),
      },
    );

    return response.data;
  },

  async requestPasswordReset(payload: RequestPasswordResetPayload) {
    const response = await apiClient.post<AuthActionResponse>(
      API_ENDPOINTS.auth.forgotPassword,
      {
        email: normalizeEmail(payload.email),
      },
    );

    return response.data;
  },

  async resendPasswordResetCode(payload: ResendPasswordResetCodePayload) {
    const response = await apiClient.post<AuthActionResponse>(
      API_ENDPOINTS.auth.resendPasswordResetCode,
      {
        email: normalizeEmail(payload.email),
      },
    );

    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const response = await apiClient.post<AuthActionResponse>(
      API_ENDPOINTS.auth.resetPassword,
      {
        email: normalizeEmail(payload.email),
        code: normalizeConfirmationCode(payload.code),
        password: payload.password,
      },
    );

    return response.data;
  },

  async getMe() {
    const response = await apiClient.get<AuthUser>(API_ENDPOINTS.auth.me);

    return normalizeUser(response.data);
  },
};
