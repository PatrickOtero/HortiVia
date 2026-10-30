import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { profileService } from '../services/profile.service';
import { usePublicProfile } from './usePublicProfile';
import type { PublicUserProfile } from '../types/profile';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    const ReactModule = require('react');
    ReactModule.useEffect(callback, [callback]);
  },
}));
jest.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'viewer', role: 'USER' } }),
}));
jest.mock('../services/profile.service', () => ({
  profileService: { getUserProfile: jest.fn() },
}));

describe('usePublicProfile', () => {
  let tree: Renderer.ReactTestRenderer;
  let current: ReturnType<typeof usePublicProfile>;
  function Probe({ userId }: { userId: string }) {
    current = usePublicProfile(userId);
    return null;
  }
  afterEach(async () => {
    await act(async () => tree?.unmount());
    jest.clearAllMocks();
  });
  it('discards obsolete profile responses and aborts requests when switching users', async () => {
    let finishOld!: (profile: PublicUserProfile) => void;
    (profileService.getUserProfile as jest.Mock)
      .mockReturnValueOnce(
        new Promise<PublicUserProfile>(resolve => {
          finishOld = resolve;
        }),
      )
      .mockResolvedValueOnce({ id: 'new', name: 'Novo perfil' });
    await act(async () => {
      tree = Renderer.create(<Probe userId="old" />);
    });
    const oldSignal = (profileService.getUserProfile as jest.Mock).mock
      .calls[0][1];
    await act(async () => tree.update(<Probe userId="new" />));
    expect(oldSignal.aborted).toBe(true);
    expect(current.data?.id).toBe('new');
    await act(async () =>
      finishOld({
        id: 'old',
        email: 'private@example.invalid',
      } as PublicUserProfile),
    );
    expect(current.data?.id).toBe('new');
    expect(current.data).not.toHaveProperty('email');
  });
  it('clears stale content after a failure and permits an explicit retry', async () => {
    (profileService.getUserProfile as jest.Mock)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ id: 'user', name: 'QA' });
    await act(async () => {
      tree = Renderer.create(<Probe userId="user" />);
    });
    expect(current.error).toBe(true);
    expect(current.data).toBeNull();
    await act(async () => current.refresh());
    expect(current.error).toBe(false);
    expect(current.data?.name).toBe('QA');
    expect(profileService.getUserProfile).toHaveBeenCalledTimes(2);
  });
});
