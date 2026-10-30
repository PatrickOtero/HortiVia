import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { Avatar, PrimaryButton } from '../../../../components';
import { trainingService } from '../../services/training.service';
import { TrainingRankingScreen } from './index';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    const ReactModule = require('react');
    ReactModule.useEffect(callback, [callback]);
  },
}));
jest.mock('../../services/training.service', () => ({
  trainingService: { ranking: jest.fn() },
}));

function visibleText(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(visibleText).join('');
  if (node && typeof node === 'object' && 'children' in node)
    return visibleText(node.children);
  return '';
}

describe('TrainingRankingScreen', () => {
  let tree: Renderer.ReactTestRenderer;
  const navigate = jest.fn();
  const entry = {
    position: 1,
    user: {
      id: 'u1',
      name: 'Ana QA',
      avatarUrl: 'https://example.invalid/ana.jpg',
      specialBadge: 'CO_FOUNDER',
      store: 'Loja QA',
      jobTitle: 'Repositora',
    },
    progress: { total: 10, correct: 8, answered: 9, percent: 80 },
  };
  beforeEach(() => jest.clearAllMocks());
  afterEach(async () => {
    await act(async () => tree?.unmount());
  });
  async function render() {
    await act(async () => {
      tree = Renderer.create(
        <ThemeProvider>
          <TrainingRankingScreen
            navigation={{ navigate, goBack: jest.fn() } as never}
            route={{} as never}
          />
        </ThemeProvider>,
      );
    });
  }
  it('loads once, shows a tied rank, photo and badge, and opens a profile', async () => {
    (trainingService.ranking as jest.Mock).mockResolvedValue({
      top: [
        entry,
        {
          ...entry,
          user: { ...entry.user, id: 'u2', name: 'Bia QA', specialBadge: null },
        },
      ],
      currentUser: { ...entry, position: 12 },
      participants: 12,
    });
    await render();
    expect(trainingService.ranking).toHaveBeenCalledTimes(1);
    const text = visibleText(tree.toJSON());
    for (const value of [
      'Cofundador',
      'Loja QA',
      'Repositora',
      '80',
      '12º',
      '1º',
    ])
      expect(text).toContain(value);
    expect(tree.root.findAllByType(Avatar)[0].props.imageUrl).toContain(
      'ana.jpg',
    );
    await act(async () =>
      tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === 'Abrir perfil de Bia QA' &&
            typeof node.props.onPress === 'function',
        )[0]
        .props.onPress(),
    );
    expect(navigate).toHaveBeenCalledWith('UserProfile', { userId: 'u2' });
  });
  it('retries a failed request and explains how a new user can participate', async () => {
    (trainingService.ranking as jest.Mock)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ top: [], currentUser: null, participants: 0 });
    await render();
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Não foi possível carregar',
    );
    await act(async () => tree.root.findByType(PrimaryButton).props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain('Responda um treinamento');
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Ainda não há participantes',
    );
  });
});
