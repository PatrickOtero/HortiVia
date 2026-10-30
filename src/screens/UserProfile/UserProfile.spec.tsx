import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { PrimaryButton, SecondaryButton } from '../../components';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { usePublicProfile } from '../../features/profile/hooks/usePublicProfile';
import { UserProfileScreen } from './index';

jest.mock('../../features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../features/profile/hooks/usePublicProfile', () => ({
  usePublicProfile: jest.fn(),
}));
jest.mock('../../features/admin/services/users.service', () => ({
  usersService: { updateBadge: jest.fn() },
}));

describe('UserProfileScreen', () => {
  let tree: Renderer.ReactTestRenderer;
  const navigate = jest.fn(),
    refresh = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'visitor', role: 'USER' },
    });
    (usePublicProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      error: false,
      refresh,
      data: {
        id: 'owner',
        name: 'Ana QA',
        avatarUrl: null,
        specialBadge: 'SPECIALIST',
        store: 'Loja QA',
        jobTitle: 'Repositora',
        email: 'private@example.invalid',
        phone: '11999999999',
        city: 'Recife',
        state: 'PE',
        learning: {
          position: 2,
          summary: { total: 10, answered: 8, correct: 7, percent: 70 },
          products: [
            {
              product: { id: 'p1', name: 'Banana' },
              progress: { total: 10, answered: 8, correct: 7, percent: 70 },
            },
          ],
        },
      },
    });
  });
  afterEach(async () => {
    await act(async () => tree?.unmount());
  });
  async function render() {
    await act(async () => {
      tree = Renderer.create(
        <ThemeProvider>
          <UserProfileScreen
            navigation={{ navigate, goBack: jest.fn() } as never}
            route={{ params: { userId: 'owner' } } as never}
          />
        </ThemeProvider>,
      );
    });
  }
  it('shows public identity and product results while hiding contact details from visitors', async () => {
    await render();
    const text = JSON.stringify(tree.toJSON());
    for (const value of [
      'Ana QA',
      'Especialista',
      'Loja QA',
      'Repositora',
      'Banana',
      '70%',
      '2º',
    ])
      expect(text).toContain(value);
    for (const value of [
      'private@example.invalid',
      '11999999999',
      'Recife',
      'Editar meu perfil',
      'Salvar selo',
    ])
      expect(text).not.toContain(value);
    await act(async () =>
      tree.root.findByType(SecondaryButton).props.onPress(),
    );
    expect(navigate).toHaveBeenCalledWith('TrainingRanking');
  });
  it('lets the owner view private fields and open the existing profile editor', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'owner', role: 'USER' },
    });
    await render();
    expect(JSON.stringify(tree.toJSON())).toContain('private@example.invalid');
    await act(async () => tree.root.findByType(PrimaryButton).props.onPress());
    expect(navigate).toHaveBeenCalledWith('EditProfile');
  });
  it('lets administrators view private fields and select a badge', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'admin', role: 'ADMIN' },
    });
    await render();
    const text = JSON.stringify(tree.toJSON());
    expect(text).toContain('private@example.invalid');
    expect(text).toContain('Salvar selo');
    expect(text).not.toContain('Editar meu perfil');
  });
  it('shows a recoverable failure instead of invented progress', async () => {
    (usePublicProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      error: true,
      data: null,
      refresh,
    });
    await render();
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Não foi possível carregar',
    );
    await act(async () => tree.root.findByType(PrimaryButton).props.onPress());
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
