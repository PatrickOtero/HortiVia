import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { SettingsRow } from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { settingsSections } from '../../data/settings';
import { SettingsScreen } from './index';

jest.mock('../../features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../hooks/useSettings', () => ({ useSettings: jest.fn() }));

describe('SettingsScreen logout', () => {
  let tree: Renderer.ReactTestRenderer;
  const signOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: null, signOut });
    (useSettings as jest.Mock).mockReturnValue({
      sections: settingsSections,
      isLoading: false,
      isError: false,
      errorMessage: '',
      updatingPreferenceKey: null,
      toggleAppearance: jest.fn(),
      togglePreference: jest.fn(),
      reloadSettings: jest.fn(),
    });
  });

  afterEach(async () => {
    await act(async () => tree?.unmount());
  });

  async function render() {
    await act(async () => {
      tree = Renderer.create(
        <ThemeProvider>
          <SettingsScreen
            navigation={{ navigate: jest.fn() } as never}
            route={{} as never}
          />
        </ThemeProvider>,
      );
    });
  }

  function logoutRow() {
    return tree.root
      .findAllByType(SettingsRow)
      .find(row => row.props.label === 'Sair');
  }

  it('shows a recoverable error and allows retry when token removal fails', async () => {
    let rejectLogout: ((error: Error) => void) | undefined;
    signOut.mockReturnValueOnce(
      new Promise<void>((_resolve, reject) => {
        rejectLogout = reject;
      }),
    );
    signOut.mockResolvedValueOnce(undefined);

    await render();
    await act(async () => {
      logoutRow()?.props.onPress();
      logoutRow()?.props.onPress();
    });

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(logoutRow()?.props.onPress).toBeUndefined();
    expect(logoutRow()?.props.description).toBe('Encerrando sessão...');

    await act(async () => {
      rejectLogout?.(new Error('storage unavailable'));
      await Promise.resolve();
    });

    expect(JSON.stringify(tree.toJSON())).toContain(
      'Não foi possível encerrar a sessão neste aparelho. Você continua conectado; tente novamente.',
    );
    expect(logoutRow()?.props.onPress).toEqual(expect.any(Function));

    await act(async () => {
      logoutRow()?.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(signOut).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(tree.toJSON())).not.toContain(
      'Não foi possível encerrar a sessão neste aparelho.',
    );
  });
});
