import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import {
  sanitizeUpdatePreferencesPayload,
  toUserPreferences,
} from '../mappers/preferences.mapper';
import type {
  UpdatePreferencesPayload,
  UserPreferences,
} from '../types/preferences';

export const preferencesService = {
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get(API_ENDPOINTS.preferences.get);

    return toUserPreferences(response.data);
  },

  async updatePreferences(
    payload: UpdatePreferencesPayload,
  ): Promise<UserPreferences> {
    const response = await apiClient.patch(
      API_ENDPOINTS.preferences.update,
      sanitizeUpdatePreferencesPayload(payload),
    );

    return toUserPreferences(response.data);
  },
};
