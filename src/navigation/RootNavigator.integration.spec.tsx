import { perform, renderRoot, updateRoot } from './testUtils/navigationHarness';
import { NavigationContainer } from '@react-navigation/native';
import { focusedProbe, probes } from './testUtils/NavigationProbe';

describe('real application navigators', () => {
  it('opens Login for an anonymous session', async () => {
    await renderRoot();
    expect(focusedProbe().route.name).toBe('Login');
  });

  it('opens Home for an authenticated session', async () => {
    await renderRoot(true);
    expect(focusedProbe().route.name).toBe('Home');
  });

  it.each([false, true])(
    'waits for session loading before mounting navigation (authenticated: %s)',
    async authenticated => {
      const renderer = await renderRoot(authenticated, true);
      expect(
        renderer.root.findAllByProps({ testID: 'session-loading' }),
      ).not.toHaveLength(0);
      expect(renderer.root.findAllByType(NavigationContainer)).toHaveLength(0);
      expect(probes.size).toBe(0);
      await updateRoot(authenticated);
      expect(focusedProbe().route.name).toBe(authenticated ? 'Home' : 'Login');
    },
  );

  it('registers the existing authentication routes and returns from registration to the same Login route', async () => {
    await renderRoot();
    const login = focusedProbe();
    expect(login.navigation.getState().routeNames).toEqual([
      'Login',
      'Register',
      'ForgotPassword',
      'ResetPassword',
      'VerifyEmail',
      'SessionLoading',
    ]);
    expect(login.navigation.canGoBack()).toBe(false);
    await perform(() => login.navigation.navigate('Register'));
    expect(focusedProbe().route.name).toBe('Register');
    await perform(() => focusedProbe().navigation.goBack());
    expect(focusedProbe().route.key).toBe(login.route.key);
    expect(focusedProbe().navigation.canGoBack()).toBe(false);
  });

  it('replaces registration with VerifyEmail and preserves email and infoMessage', async () => {
    await renderRoot();
    await perform(() => focusedProbe().navigation.navigate('Register'));
    const params = {
      email: 'test+fruit@example.invalid',
      infoMessage: 'Confirme seu e-mail: ação & fruta',
    };
    await perform(() =>
      focusedProbe().navigation.replace('VerifyEmail', params),
    );
    expect(focusedProbe().route).toMatchObject({ name: 'VerifyEmail', params });
    expect(
      focusedProbe()
        .navigation.getState()
        .routes.map(route => route.name),
    ).toEqual(['Login', 'VerifyEmail']);
    await perform(() => focusedProbe().navigation.replace('Login', params));
    expect(focusedProbe().route).toMatchObject({ name: 'Login', params });
    expect(
      focusedProbe()
        .navigation.getState()
        .routes.some(route => route.name === 'VerifyEmail'),
    ).toBe(false);
  });

  it('preserves password recovery parameters and back navigation', async () => {
    await renderRoot();
    const email = 'test@example.invalid';
    await perform(() =>
      focusedProbe().navigation.navigate('ForgotPassword', { email }),
    );
    const forgotKey = focusedProbe().route.key;
    const params = { email, infoMessage: 'Código enviado' };
    await perform(() =>
      focusedProbe().navigation.navigate('ResetPassword', params),
    );
    expect(focusedProbe().route).toMatchObject({
      name: 'ResetPassword',
      params,
    });
    await perform(() => focusedProbe().navigation.goBack());
    expect(focusedProbe().route).toMatchObject({
      key: forgotKey,
      name: 'ForgotPassword',
      params: { email },
    });
  });

  it.each(['ForgotPassword', 'ResetPassword', 'VerifyEmail'])(
    'allows optional params to be omitted for %s',
    async routeName => {
      await renderRoot();
      await perform(() => focusedProbe().navigation.navigate(routeName));
      expect(focusedProbe().route.name).toBe(routeName);
      expect(focusedProbe().route.params).toBeUndefined();
    },
  );

  it('resets the route history on sign-in, sign-out and a new session', async () => {
    await renderRoot();
    const firstLoginKey = focusedProbe().route.key;
    await perform(() =>
      focusedProbe().navigation.navigate('VerifyEmail', {
        email: 'test@example.invalid',
      }),
    );
    await updateRoot(true);
    const home = focusedProbe();
    expect(home.route.name).toBe('Home');
    expect(home.navigation.canGoBack()).toBe(false);
    const firstTabsKey = home.navigation.getParent()?.getState().routes[0].key;
    await perform(() =>
      home.navigation.navigate('ProductDetail', {
        productId: 'private-test-product',
      }),
    );
    expect(focusedProbe().route.name).toBe('ProductDetail');
    await updateRoot(false);
    const login = focusedProbe();
    expect(login.route.name).toBe('Login');
    // The container may reuse the stack key; screen history and params must reset.
    expect(login.route.key).not.toBe(firstLoginKey);
    expect(login.navigation.getState().routes).toHaveLength(1);
    expect(login.navigation.canGoBack()).toBe(false);
    expect(
      [...probes.values()].some(probe => probe.route.name === 'ProductDetail'),
    ).toBe(false);
    await updateRoot(true);
    expect(focusedProbe().route.name).toBe('Home');
    expect(focusedProbe().route.key).not.toBe(home.route.key);
    expect(
      focusedProbe().navigation.getParent()?.getState().routes[0].key,
    ).not.toBe(firstTabsKey);
    expect(focusedProbe().navigation.canGoBack()).toBe(false);
  });
});
