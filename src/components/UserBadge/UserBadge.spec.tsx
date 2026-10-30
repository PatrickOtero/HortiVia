import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { UserBadge, USER_BADGE_OPTIONS } from './index';

describe('UserBadge', () => {
  it.each(USER_BADGE_OPTIONS)(
    'identifies $value with readable text',
    async ({ value, label }) => {
      let tree!: Renderer.ReactTestRenderer;
      await act(async () => {
        tree = Renderer.create(
          <ThemeProvider>
            <UserBadge badge={value} />
          </ThemeProvider>,
        );
      });
      expect(JSON.stringify(tree.toJSON())).toContain(label);
      expect(
        tree.root.findAllByProps({ accessibilityLabel: label }).length,
      ).toBeGreaterThan(0);
      await act(async () => tree.unmount());
    },
  );
  it('does not display a badge when none has been assigned', async () => {
    let tree!: Renderer.ReactTestRenderer;
    await act(async () => {
      tree = Renderer.create(<UserBadge badge={null} />);
    });
    expect(tree.toJSON()).toBeNull();
    await act(async () => tree.unmount());
  });
});
