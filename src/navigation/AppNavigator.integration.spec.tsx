import { perform, renderRoot } from './testUtils/navigationHarness';
import type ReactTestRenderer from 'react-test-renderer';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabItem } from '../components/BottomTabItem';
import type { AppStackParamList, AppTabParamList } from '../types/navigation';
import { focusedProbe } from './testUtils/NavigationProbe';

async function pressTab(
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) {
  const item = renderer.root
    .findAllByType(BottomTabItem)
    .find(tab => tab.props.label === label);
  expect(item).toBeDefined();
  await perform(() => item!.props.onPress());
}

describe('AppNavigator and AppTabsNavigator with real routers and tab controls', () => {
  it('keeps the MainTabs root and existing tab names, labels and selected state', async () => {
    const renderer = await renderRoot(true);
    const home = focusedProbe();
    expect(home.navigation.getState().routeNames).toEqual([
      'Home',
      'Feed',
      'Library',
      'Settings',
    ]);
    expect(
      home.navigation
        .getParent()
        ?.getState()
        .routes.map(route => route.name),
    ).toEqual(['MainTabs']);
    expect(
      renderer.root
        .findAllByType(BottomTabItem)
        .map(tab => [tab.props.label, tab.props.active]),
    ).toEqual([
      ['Inicio', true],
      ['Leituras', false],
      ['Biblioteca', false],
      ['Ajustes', false],
    ]);
  });

  it.each([
    ['Leituras', 'Feed'],
    ['Biblioteca', 'Library'],
    ['Ajustes', 'Settings'],
  ])(
    'navigates by pressing %s and returns to the original Home key',
    async (label, name) => {
      const renderer = await renderRoot(true);
      const homeKey = focusedProbe().route.key;
      await pressTab(renderer, label);
      expect(focusedProbe().route.name).toBe(name);
      expect(
        renderer.root
          .findAllByType(BottomTabItem)
          .filter(tab => tab.props.active)
          .map(tab => tab.props.label),
      ).toEqual([label]);
      await pressTab(renderer, 'Inicio');
      expect(focusedProbe().route.key).toBe(homeKey);
    },
  );

  it('emits tabPress with the target route key and honors preventDefault', async () => {
    const renderer = await renderRoot(true);
    await pressTab(renderer, 'Leituras');
    const feed = focusedProbe();
    const tabs =
      feed.navigation as unknown as BottomTabNavigationProp<AppTabParamList>;
    await pressTab(renderer, 'Inicio');
    const listener = jest.fn(event => event.preventDefault());
    const unsubscribe = tabs.addListener('tabPress', listener);
    await pressTab(renderer, 'Leituras');
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ target: feed.route.key, type: 'tabPress' }),
    );
    expect(focusedProbe().route.name).toBe('Home');
    unsubscribe();
    await pressTab(renderer, 'Leituras');
    expect(focusedProbe().route.key).toBe(feed.route.key);
  });

  it('emits tabPress for the active tab without creating a new route', async () => {
    const renderer = await renderRoot(true);
    const home = focusedProbe();
    const tabs =
      home.navigation as unknown as BottomTabNavigationProp<AppTabParamList>;
    const listener = jest.fn();
    const unsubscribe = tabs.addListener('tabPress', listener);
    await pressTab(renderer, 'Inicio');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ target: home.route.key }),
    );
    expect(focusedProbe().route.key).toBe(home.route.key);
    expect(tabs.getState().routes).toHaveLength(4);
    unsubscribe();
  });

  const destinations: [
    Exclude<keyof AppStackParamList, 'MainTabs'>,
    object | undefined,
  ][] = [
    ['Training', { productId: 'product-training-1' }],
    ['TrainingProgress', undefined],
    ['AdminTrainingProducts', undefined],
    ['AdminTrainingQuestions', { productId: 'product-training-1' }],
    ['ProductDetail', { productId: 'product/with ?#% and fruta' }],
    ['ArticleDetail', { articleId: 'article-123' }],
    ['SavedArticles', undefined],
    ['EditProfile', undefined],
    ['AdminHome', undefined],
    ['AdminProducts', undefined],
    ['AdminProductForm', { productId: 'product-123' }],
    ['AdminProductVisualContent', { productId: 'product-123' }],
    ['AdminArticles', undefined],
    ['AdminArticleForm', { articleId: 'article-123' }],
  ];

  it.each(destinations)(
    'opens %s on the app stack, preserves params and returns to the same tab',
    async (name, params) => {
      const renderer = await renderRoot(true);
      await pressTab(renderer, 'Biblioteca');
      const libraryKey = focusedProbe().route.key;
      await perform(() => focusedProbe().navigation.navigate(name, params));
      const detail = focusedProbe();
      expect(detail.route.name).toBe(name);
      expect(detail.route.params).toEqual(params);
      expect(
        detail.navigation.getState().routes.map(route => route.name),
      ).toEqual(['MainTabs', name]);
      expect(detail.navigation.canGoBack()).toBe(true);
      await perform(() => detail.navigation.goBack());
      expect(focusedProbe().route).toMatchObject({
        name: 'Library',
        key: libraryKey,
      });
    },
  );

  it.each(['AdminProductForm', 'AdminArticleForm'])(
    'preserves the create mode of %s without an entity ID',
    async name => {
      await renderRoot(true);
      await perform(() => focusedProbe().navigation.navigate(name, {}));
      expect(focusedProbe().route).toMatchObject({ name, params: {} });
    },
  );

  it('gives repeated pushes distinct route keys and restores each set of params on back', async () => {
    await renderRoot(true);
    await perform(() =>
      focusedProbe().navigation.navigate('ProductDetail', {
        productId: 'first-product',
      }),
    );
    const first = focusedProbe();
    await perform(() =>
      first.navigation.push('ProductDetail', { productId: 'second-product' }),
    );
    const second = focusedProbe();
    expect(second.route.key).not.toBe(first.route.key);
    expect(second.route.params).toEqual({ productId: 'second-product' });
    const keys = second.navigation.getState().routes.map(route => route.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every(key => typeof key === 'string' && key.length > 0)).toBe(
      true,
    );
    await perform(() => second.navigation.goBack());
    expect(focusedProbe().route).toMatchObject({
      key: first.route.key,
      params: { productId: 'first-product' },
    });
  });

  it('selects a nested tab through MainTabs params without duplicating the root route', async () => {
    await renderRoot(true);
    await perform(() =>
      focusedProbe().navigation.navigate('MainTabs', { screen: 'Settings' }),
    );
    expect(focusedProbe().route.name).toBe('Settings');
    expect(
      focusedProbe().navigation.getParent()?.getState().routes,
    ).toHaveLength(1);
  });
});
