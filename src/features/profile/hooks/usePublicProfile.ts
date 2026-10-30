import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth/hooks/useAuth';
import { profileService } from '../services/profile.service';
import type { PublicUserProfile } from '../types/profile';

export function usePublicProfile(userId: string) {
  const { user } = useAuth();
  const [data, setData] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    controller.current?.abort();
    const pending = new AbortController();
    controller.current = pending;
    const current = ++request.current;
    setData(null);
    setError(false);
    setIsLoading(true);
    try {
      const profile = await profileService.getUserProfile(
        userId,
        pending.signal,
      );
      if (current === request.current) setData(profile);
    } catch {
      if (current === request.current) setError(true);
    } finally {
      if (current === request.current) setIsLoading(false);
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      // Authentication/permission changes must invalidate previously loaded personal data.
      if (!user?.id || !user.role) {
        setData(null);
        setIsLoading(false);
        return;
      }
      refresh();
      return () => {
        request.current++;
        controller.current?.abort();
        setData(null);
      };
    }, [refresh, user?.id, user?.role]),
  );
  return { data: data?.id === userId ? data : null, isLoading, error, refresh };
}
