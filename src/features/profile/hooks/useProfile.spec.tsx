import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { useProfile } from './useProfile';
import { profileService } from '../services/profile.service';

jest.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, syncUser: jest.fn() }),
}));
jest.mock('../services/profile.service', () => ({
  profileService: { getProfile: jest.fn(), updateProfile: jest.fn() },
}));

describe('Profile editing', () => {
  let tree: Renderer.ReactTestRenderer;
  let current: ReturnType<typeof useProfile>;
  const profile = {
    id: 'u1',
    name: 'Ana',
    email: 'qa@example.invalid',
    avatarUrl: null,
    gender: null,
    role: 'USER',
    store: 'Loja A',
    jobTitle: 'Repositora',
    phone: '11999999999',
    city: 'Recife',
    state: 'PE',
    specialBadge: 'SPECIALIST',
  };
  function Probe() {
    current = useProfile();
    return null;
  }
  beforeEach(() => {
    jest.clearAllMocks();
    (profileService.getProfile as jest.Mock).mockResolvedValue(profile);
    (profileService.updateProfile as jest.Mock).mockImplementation(
      async fields => ({ ...profile, ...fields }),
    );
  });
  afterEach(async () => {
    await act(async () => tree?.unmount());
  });
  it('fills existing optional data and submits edited fields without the badge', async () => {
    await act(async () => {
      tree = Renderer.create(<Probe />);
    });
    expect(current.formValues).toMatchObject({
      store: 'Loja A',
      city: 'Recife',
      phone: '11999999999',
    });
    await act(async () => {
      current.updateField('store', 'Loja B');
      current.updateField('phone', '');
    });
    await act(async () => {
      expect(await current.saveProfile()).toBe(true);
    });
    const submitted = (profileService.updateProfile as jest.Mock).mock
      .calls[0][0];
    expect(submitted).toMatchObject({
      store: 'Loja B',
      phone: '',
      jobTitle: 'Repositora',
      city: 'Recife',
      state: 'PE',
    });
    expect(submitted).not.toHaveProperty('specialBadge');
    expect(submitted).not.toHaveProperty('role');
  });
  it('rejects malformed phone/UF before submitting', async () => {
    await act(async () => {
      tree = Renderer.create(<Probe />);
    });
    await act(async () => {
      current.updateField('phone', 'invalid');
      current.updateField('state', 'Pernambuco');
    });
    await act(async () => {
      expect(await current.saveProfile()).toBe(false);
    });
    expect(current.formErrors.phone).toBeDefined();
    expect(current.formErrors.state).toBeDefined();
    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it('does not erase unknown optional data when the initial profile load fails', async () => {
    (profileService.getProfile as jest.Mock).mockRejectedValueOnce(
      new Error('offline'),
    );
    await act(async () => {
      tree = Renderer.create(<Probe />);
    });
    expect(current.profile).toBeNull();
    await act(async () => {
      expect(await current.saveProfile()).toBe(false);
    });
    expect(profileService.updateProfile).not.toHaveBeenCalled();
    await act(async () => current.reloadProfile());
    expect(current.formValues.store).toBe('Loja A');
    await act(async () => {
      expect(await current.saveProfile()).toBe(true);
    });
    expect(profileService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ store: 'Loja A', city: 'Recife' }),
    );
  });
});
