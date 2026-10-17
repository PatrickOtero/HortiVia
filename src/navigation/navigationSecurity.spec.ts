import { getPathFromState, getStateFromPath } from '@react-navigation/native';
import type { AppStackParamList } from '../types/navigation';

// Node APIs are scoped to this Jest test, without adding Node globals to the app.
const { execFileSync } = jest.requireActual<{
  execFileSync: (
    file: string,
    args: string[],
    options: { encoding: 'utf8'; timeout: number },
  ) => string;
}>('node:child_process');
const { execPath } = jest.requireActual<{ execPath: string }>('node:process');

// RootNavigator has no linking config. These fixtures verify the updated public
// parser/serializer without enabling new deep links in the application.
const config: NonNullable<
  Parameters<typeof getStateFromPath<AppStackParamList>>[1]
> = {
  screens: {
    ProductDetail: 'products/:productId',
    ArticleDetail: 'articles/:articleId',
    MainTabs: {
      screens: { Home: 'home', Library: 'library', Settings: 'settings' },
    },
  },
};

const parsePath = (path: string) =>
  getStateFromPath<AppStackParamList>(path, config);
const serializeState = (state: NonNullable<ReturnType<typeof parsePath>>) =>
  getPathFromState<AppStackParamList>(state, config);

describe('navigation dependency security regressions', () => {
  it('preserves Unicode, escaped identifiers, repeated query values, nulls and empty strings', () => {
    const state = parsePath(
      '/products/fruit%2F123?q=ma%C3%A7%C3%A3+%26+pera&tag=ripe&tag=green&flag&empty=',
    );
    expect(state?.routes[0]).toMatchObject({
      name: 'ProductDetail',
      params: {
        productId: 'fruit/123',
        q: 'maçã & pera',
        tag: ['ripe', 'green'],
        flag: null,
        empty: '',
      },
    });
    const path = serializeState(state!);
    expect(parsePath(path)?.routes[0].params).toEqual(state?.routes[0].params);
  });

  it('preserves nested route identity across the path/state round trip', () => {
    const state = parsePath('/library?q=fruta');
    expect(state?.routes[0]).toMatchObject({
      name: 'MainTabs',
      state: { routes: [{ name: 'Library', params: { q: 'fruta' } }] },
    });
    expect(serializeState(state!)).toBe('/library?q=fruta');
  });

  it.each(['%ZZ', '%E0%A4%A', 'valid%20text%FF', '%C3%A7%C3%A3o%ZZ'])(
    'handles malformed percent encoding in query values without losing route identity: %s',
    input => {
      const state = parsePath(`/articles/test-article?q=${input}`);
      expect(state?.routes[0]).toMatchObject({
        name: 'ArticleDetail',
        params: { articleId: 'test-article', q: expect.any(String) },
      });
    },
  );

  it('does not allow a query value to overwrite the identifier from the route path', () => {
    const state = parsePath('/products/path-id?productId=query-id');
    expect(state?.routes[0]).toMatchObject({
      params: { productId: 'path-id' },
    });
  });

  it('rejects malformed percent-encoded route identifiers', () => {
    const state = parsePath('/products/%ZZ');
    expect(state).toBeUndefined();
  });

  it('bounds non-secure negative/zero generators and secure custom zero-size generators', () => {
    // A subprocess timeout prevents a future reintroduction of an infinite loop
    // from hanging Jest's main thread. No network or real credentials are used.
    const result = execFileSync(
      execPath,
      [
        '-e',
        `
      const assert = require('node:assert/strict');
      const nonSecure = require('nanoid/non-secure');
      const secure = require('nanoid');
      for (const size of [-1, 0]) {
        assert.equal(nonSecure.nanoid(size), '');
        assert.equal(nonSecure.customAlphabet('abc', size)(), '');
      }
      assert.equal(secure.customAlphabet('abc', 0)(), '');
      assert.equal(secure.customRandom('abc', 0, size => new Uint8Array(size))(), '');
      console.log('bounded');
    `,
      ],
      { encoding: 'utf8', timeout: 3000 },
    );
    expect(result.trim()).toBe('bounded');
  });
});
