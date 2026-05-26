import type {
  UserPreferenceKey,
  UserPreferences,
} from '../features/preferences/types/preferences';

export type { UserPreferenceKey, UserPreferences };

export type SettingsRowType = 'navigation' | 'toggle' | 'action' | 'info' | 'theme';

export type SettingsActionKey =
  | 'editProfile'
  | 'savedArticles'
  | 'adminContent'
  | 'preferences'
  | 'about'
  | 'help'
  | 'signOut'
  | 'appearance';

export type SettingsRowTone = 'default' | 'danger';

export type SettingsRowItem = {
  id: string;
  label: string;
  description?: string;
  type: SettingsRowType;
  actionKey?: SettingsActionKey;
  preferenceKey?: UserPreferenceKey;
  enabled?: boolean;
  valueLabel?: string;
  tone?: SettingsRowTone;
};

export type SettingsSectionItem = {
  id: string;
  title: string;
  rows: SettingsRowItem[];
};
