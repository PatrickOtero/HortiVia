import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ArticleReactionButton } from './index';

describe('ArticleReactionButton', () => {
  it('keeps the useful label and count visible while loading', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleReactionButton
            isActive
            count={12}
            isLoading
            size="md"
            onPress={jest.fn()}
          />
        </ThemeProvider>,
      );
    });

    const output = JSON.stringify(renderer!.toJSON());

    expect(output).toContain('Útil');
    expect(output).toContain('12');
    expect(renderer!.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });

  it('uses a compact icon plus number layout when the label is hidden', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleReactionButton
            isActive={false}
            count={1}
            size="sm"
            showLabel={false}
            onPress={jest.fn()}
          />
        </ThemeProvider>,
      );
    });

    const output = JSON.stringify(renderer!.toJSON());

    expect(output).toContain('1');
    expect(output).not.toContain('1 útil');
    expect(output).not.toContain('Útil ·');
  });
});
