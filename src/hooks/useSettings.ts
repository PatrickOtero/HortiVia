import { useMemo } from 'react';
import { usePreferences } from '../features/preferences/hooks/usePreferences';
import type { UserPreferenceKey } from '../features/preferences/types/preferences';
import { getSettingsSections } from '../services/settingsService';
import { SettingsSectionItem } from '../types/settings';
import { useTheme } from './useTheme';

type UseSettingsResult = {
  sections: SettingsSectionItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  updatingPreferenceKey: UserPreferenceKey | null;
  togglePreference: (key: UserPreferenceKey) => Promise<boolean>;
  toggleAppearance: () => void;
  reloadSettings: () => Promise<void>;
};

export function useSettings(): UseSettingsResult {
  const { themeMode, toggleTheme } = useTheme();
  const {
    preferences,
    isLoading,
    errorMessage,
    updatingPreferenceKey,
    reloadPreferences,
    updatePreference,
  } = usePreferences();

  const sections = useMemo(
    () =>
      getSettingsSections().map(section => ({
        ...section,
        rows: section.rows.map(row => {
          if (row.preferenceKey) {
            return {
              ...row,
              enabled: preferences?.[row.preferenceKey] ?? false,
            };
          }

          if (row.type === 'theme') {
            return {
              ...row,
              valueLabel: themeMode === 'dark' ? 'Escuro' : 'Claro',
            };
          }

          return row;
        }),
      })),
    [preferences, themeMode],
  );

  async function togglePreference(key: UserPreferenceKey) {
    if (!preferences) {
      return false;
    }

    return updatePreference(key, !preferences[key]);
  }

  function toggleAppearance() {
    toggleTheme();
  }

  return {
    sections,
    isLoading,
    isError: Boolean(errorMessage) && !preferences,
    errorMessage,
    updatingPreferenceKey,
    togglePreference,
    toggleAppearance,
    reloadSettings: reloadPreferences,
  };
}
