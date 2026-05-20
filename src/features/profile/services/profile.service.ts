import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
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
    const formData = new FormData();

    formData.append(
      'avatar',
      {
        uri: file.uri,
        name: file.name ?? 'avatar.jpg',
        type: file.type,
      } as unknown as Blob,
    );

    const response = await apiClient.request({
      method: 'post',
      url: API_ENDPOINTS.profile.avatar,
      data: formData,
      headers: {
        Accept: 'application/json',
      },
      transformRequest: data => data,
    });

    return toUserProfile(response.data);
  },
};
