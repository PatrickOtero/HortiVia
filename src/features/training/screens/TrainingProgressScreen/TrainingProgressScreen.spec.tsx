import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import type { AppStackParamList } from '../../../../types/navigation';
import { trainingService } from '../../services/training.service';
import { TrainingProgressScreen } from './index';

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native-screens', () => {
  const screens = Object.create(jest.requireActual('react-native-screens'));
  const { View } = jest.requireActual('react-native');
  ['Screen', 'ScreenContainer', 'ScreenStack', 'ScreenStackItem'].forEach(
    name => {
      Object.defineProperty(screens, name, { value: View });
    },
  );
  return screens;
});
jest.mock('../../services/training.service', () => ({
  trainingService: { progress: jest.fn() },
}));
const progress = trainingService.progress as jest.Mock;
const Stack = createNativeStackNavigator<AppStackParamList>();
function TrainingPlaceholder() {
  return null;
}
describe('TrainingProgressScreen', () => {
  let renderer: Renderer.ReactTestRenderer;
  let navigation: ReturnType<
    typeof createNavigationContainerRef<AppStackParamList>
  >;
  function visibleText(node: unknown): string {
    if (typeof node === 'string' || typeof node === 'number')
      return String(node);
    if (Array.isArray(node)) return node.map(visibleText).join('');
    if (node && typeof node === 'object' && 'children' in node)
      return visibleText(node.children);
    return '';
  }
  const text = () => visibleText(renderer.toJSON());
  beforeEach(() => {
    jest.useFakeTimers();
    progress.mockReset();
    navigation = createNavigationContainerRef<AppStackParamList>();
  });
  afterEach(async () => {
    await act(async () => renderer.unmount());
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  async function perform(action: () => void | Promise<unknown>) {
    await act(async () => {
      await action();
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
  }
  async function render() {
    await perform(() => {
      renderer = Renderer.create(
        <ThemeProvider>
          <NavigationContainer ref={navigation}>
            <Stack.Navigator
              initialRouteName="TrainingProgress"
              screenOptions={{ headerShown: false, animation: 'none' }}
            >
              <Stack.Screen
                name="TrainingProgress"
                component={TrainingProgressScreen}
              />
              <Stack.Screen name="Training" component={TrainingPlaceholder} />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>,
      );
    });
  }
  it('shows server progress for the current session and opens the corresponding product training', async () => {
    progress.mockResolvedValue({
      products: [
        {
          product: { id: 'p1', name: 'Banana' },
          progress: { total: 3, answered: 2, correct: 1, percent: 33 },
        },
      ],
    });
    await render();
    expect(text()).toContain('33%');
    await act(async () =>
      renderer.root.findByType(PrimaryButton).props.onPress(),
    );
    expect(navigation.getCurrentRoute()).toMatchObject({
      name: 'Training',
      params: { productId: 'p1' },
    });
  });
  it('handles no published training', async () => {
    progress.mockResolvedValue({ products: [] });
    await render();
    expect(text()).toContain('Ainda não há treinamentos publicados.');
  });
  it('retries a network failure', async () => {
    progress
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ products: [] });
    await render();
    expect(progress).toHaveBeenCalledTimes(1);
    expect(text()).toContain('Não foi possível carregar seu progresso.');
    await act(async () =>
      renderer.root.findByType(PrimaryButton).props.onPress(),
    );
    expect(text()).toContain('Ainda não há treinamentos publicados.');
    expect(progress).toHaveBeenCalledTimes(2);
  });
  it('issues exactly one request on initial mount, including while the response is pending', async () => {
    let resolve!: (value: { products: [] }) => void;
    progress.mockImplementation(
      () =>
        new Promise(done => {
          resolve = done;
        }),
    );
    await render();
    expect(progress).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve({ products: [] });
    });
    expect(progress).toHaveBeenCalledTimes(1);
  });
  it('refreshes once when returning from training and rejects an obsolete response', async () => {
    let resolveOld!: (value: { products: [] }) => void;
    progress.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolveOld = done;
        }),
    );
    await render();
    await perform(() => navigation.navigate('Training', { productId: 'p1' }));
    expect(progress).toHaveBeenCalledTimes(1);
    progress.mockResolvedValue({
      products: [
        {
          product: { id: 'p1', name: 'Banana' },
          progress: { total: 3, answered: 3, correct: 2, percent: 67 },
        },
      ],
    });
    await perform(() => navigation.goBack());
    expect(progress).toHaveBeenCalledTimes(2);
    expect(text()).toContain('67%');
    await act(async () => {
      resolveOld({ products: [] });
    });
    expect(text()).toContain('67%');
    expect(text()).not.toContain('Ainda não há treinamentos publicados.');
    expect(progress).toHaveBeenCalledTimes(2);
  });
  it('clears unconfirmed progress on a return failure and recovers with one retry', async () => {
    progress.mockResolvedValue({
      products: [
        {
          product: { id: 'p1', name: 'Banana' },
          progress: { total: 3, answered: 3, correct: 2, percent: 67 },
        },
      ],
    });
    await render();
    await perform(() => navigation.navigate('Training', { productId: 'p1' }));
    progress.mockRejectedValueOnce(new Error('offline'));
    await perform(() => navigation.goBack());
    expect(progress).toHaveBeenCalledTimes(2);
    expect(text()).toContain('Não foi possível carregar seu progresso.');
    expect(text()).not.toContain('67%');
    progress.mockResolvedValue({ products: [] });
    await perform(() =>
      renderer.root.findByType(PrimaryButton).props.onPress(),
    );
    expect(progress).toHaveBeenCalledTimes(3);
    expect(text()).toContain('Ainda não há treinamentos publicados.');
  });
});
