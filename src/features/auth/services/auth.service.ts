import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';

function normalizeUser(user: AuthResponse['user']): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    gender: user.gender ?? null,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function normalizeAuthResponse(data: AuthResponse): AuthResponse {
  return {
    user: normalizeUser(data.user),
    accessToken: data.accessToken,
  };
}

export const authService = {
  async signIn(payload: LoginPayload) {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      payload,
    );

    return normalizeAuthResponse(response.data);
  },

  async signUp(payload: RegisterPayload) {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      payload,
    );

    return normalizeAuthResponse(response.data);
  },

  async getAuthenticatedUser() {
    const response = await apiClient.get<AuthUser>(API_ENDPOINTS.auth.me);

    return normalizeUser(response.data);
  },
};
