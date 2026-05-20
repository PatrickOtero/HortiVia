export type UserPreferences = {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  seasonalTipsEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdatePreferencesPayload = {
  notificationsEnabled?: boolean;
  seasonalTipsEnabled?: boolean;
};

export type UserPreferenceKey = keyof Pick<
  UserPreferences,
  'notificationsEnabled' | 'seasonalTipsEnabled'
>;
