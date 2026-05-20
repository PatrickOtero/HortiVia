import type {
  UpdatePreferencesPayload,
  UserPreferences,
} from '../types/preferences';

type ApiPreferencesResponse = {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  seasonalTipsEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function toUserPreferences(
  preferences: ApiPreferencesResponse,
): UserPreferences {
  return {
    id: preferences.id,
    userId: preferences.userId,
    notificationsEnabled: preferences.notificationsEnabled,
    seasonalTipsEnabled: preferences.seasonalTipsEnabled,
    createdAt: preferences.createdAt,
    updatedAt: preferences.updatedAt,
  };
}

export function sanitizeUpdatePreferencesPayload(
  payload: UpdatePreferencesPayload,
): UpdatePreferencesPayload {
  const nextPayload: UpdatePreferencesPayload = {};

  if (typeof payload.notificationsEnabled === 'boolean') {
    nextPayload.notificationsEnabled = payload.notificationsEnabled;
  }

  if (typeof payload.seasonalTipsEnabled === 'boolean') {
    nextPayload.seasonalTipsEnabled = payload.seasonalTipsEnabled;
  }

  return nextPayload;
}
