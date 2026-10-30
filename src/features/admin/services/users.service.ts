import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import type { UserBadgeType } from '../../../types/userBadge';

export const usersService = {
  async updateBadge(
    userId: string,
    specialBadge: UserBadgeType | null,
  ): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.users.detail(userId), { specialBadge });
  },
};
