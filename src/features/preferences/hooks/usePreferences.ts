import { useCallback, useEffect, useRef, useState } from 'react';
import { preferencesService } from '../services/preferences.service';
import type {
  UserPreferenceKey,
  UserPreferences,
} from '../types/preferences';

type UsePreferencesResult = {
  preferences: UserPreferences | null;
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string;
  updatingPreferenceKey: UserPreferenceKey | null;
  reloadPreferences: () => Promise<void>;
  updatePreference: (key: UserPreferenceKey, value: boolean) => Promise<boolean>;
};

export function usePreferences(): UsePreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingPreferenceKey, setUpdatingPreferenceKey] =
    useState<UserPreferenceKey | null>(null);
  const requestIdRef = useRef(0);
  const preferencesRef = useRef<UserPreferences | null>(null);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const reloadPreferences = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setErrorMessage('');

    if (preferencesRef.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const nextPreferences = await preferencesService.getPreferences();

      if (requestId !== requestIdRef.current) {
        return;
      }

      setPreferences(nextPreferences);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setErrorMessage('Não foi possível carregar seus ajustes.');
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    reloadPreferences();
  }, [reloadPreferences]);

  async function updatePreference(key: UserPreferenceKey, value: boolean) {
    if (!preferences || updatingPreferenceKey) {
      return false;
    }

    setUpdatingPreferenceKey(key);
    setErrorMessage('');

    try {
      const nextPreferences = await preferencesService.updatePreferences({
        [key]: value,
      });

      setPreferences(nextPreferences);
      return true;
    } catch {
      setErrorMessage('Não foi possível salvar esse ajuste.');
      return false;
    } finally {
      setUpdatingPreferenceKey(null);
    }
  }

  return {
    preferences,
    isLoading,
    isRefreshing,
    errorMessage,
    updatingPreferenceKey,
    reloadPreferences,
    updatePreference,
  };
}
