import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import { buildSingleFileUploadFormData } from '../../../services/api/uploadFormData';
import {
  sanitizeUpdateProfilePayload,
  toUserProfile,
} from '../mappers/profile.mapper';
import type {
  AvatarUploadFile,
  UpdateProfilePayload,
  UserProfile,
} from '../types/profile';

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get(API_ENDPOINTS.profile.get);

    return toUserProfile(response.data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await apiClient.patch(
      API_ENDPOINTS.profile.update,
      sanitizeUpdateProfilePayload(payload),
    );

    return toUserProfile(response.data);
  },

  async uploadAvatar(file: AvatarUploadFile): Promise<UserProfile> {
    const response = await apiClient.post(
      API_ENDPOINTS.profile.avatar,
      buildSingleFileUploadFormData('avatar', file, 'avatar.jpg'),
    );

    return toUserProfile(response.data);
  },
};
