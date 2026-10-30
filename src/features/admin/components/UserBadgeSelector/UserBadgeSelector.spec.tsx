import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { PrimaryButton } from '../../../../components';
import { useAuth } from '../../../auth/hooks/useAuth';
import { usersService } from '../../services/users.service';
import { UserBadgeSelector } from './index';

jest.mock('../../../auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/users.service', () => ({
  usersService: { updateBadge: jest.fn() },
}));

describe('UserBadgeSelector', () => {
  let tree: Renderer.ReactTestRenderer;
  const saved = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { role: 'ADMIN' } });
  });
  afterEach(async () => {
    await act(async () => tree?.unmount());
  });
  async function render(badge: 'FOUNDER' | null = null) {
    await act(async () => {
      tree = Renderer.create(
        <ThemeProvider>
          <UserBadgeSelector userId="u1" badge={badge} onSaved={saved} />
        </ThemeProvider>,
      );
    });
  }
  async function select(label: string) {
    await act(async () =>
      tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === label &&
            typeof node.props.onPress === 'function',
        )[0]
        .props.onPress(),
    );
  }
  it('does not expose administration to an ordinary user', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { role: 'USER' } });
    await render();
    expect(tree.toJSON()).toBeNull();
    expect(usersService.updateBadge).not.toHaveBeenCalled();
  });
  it('assigns a badge once despite repeated taps, then refreshes the profile', async () => {
    let finish!: () => void;
    (usersService.updateBadge as jest.Mock).mockReturnValue(
      new Promise<void>(resolve => {
        finish = resolve;
      }),
    );
    await render();
    await select('Especialista');
    await act(async () => {
      const save = tree.root.findByType(PrimaryButton).props.onPress;
      save();
      save();
    });
    expect(usersService.updateBadge).toHaveBeenCalledTimes(1);
    expect(usersService.updateBadge).toHaveBeenCalledWith('u1', 'SPECIALIST');
    await act(async () => finish());
    expect(saved).toHaveBeenCalledTimes(1);
  });
  it('removes a badge with null and reports failures without claiming success', async () => {
    (usersService.updateBadge as jest.Mock)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined);
    await render('FOUNDER');
    await select('Sem selo');
    await act(async () => tree.root.findByType(PrimaryButton).props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain('Não foi possível salvar');
    expect(saved).not.toHaveBeenCalled();
    await act(async () => tree.root.findByType(PrimaryButton).props.onPress());
    expect(usersService.updateBadge).toHaveBeenLastCalledWith('u1', null);
    expect(saved).toHaveBeenCalledTimes(1);
  });
});
