import './navigationMocks';
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { RootNavigator } from '../RootNavigator';
import { probes } from './NavigationProbe';

let renderer: ReactTestRenderer.ReactTestRenderer;

beforeEach(() => {
  jest.useFakeTimers();
  probes.clear();
});
afterEach(async () => {
  if (renderer) {
    await act(async () => {
      renderer.unmount();
    });
  }
  jest.clearAllTimers();
  jest.useRealTimers();
  probes.clear();
});

export async function perform(action: () => void | Promise<unknown>) {
  await act(async () => {
    await action();
  });
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
}

export async function renderRoot(isAuthenticated = false, isLoading = false) {
  return renderNavigation(
    <RootNavigator isAuthenticated={isAuthenticated} isLoading={isLoading} />,
  );
}

export async function renderNavigation(children: React.ReactNode) {
  await perform(() => {
    renderer = ReactTestRenderer.create(
      <ThemeProvider>{children}</ThemeProvider>,
    );
  });
  return renderer;
}

export async function updateRoot(isAuthenticated: boolean, isLoading = false) {
  await perform(() => {
    renderer.update(
      <ThemeProvider>
        <RootNavigator
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
        />
      </ThemeProvider>,
    );
  });
}
