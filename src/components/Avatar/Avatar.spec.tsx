import React from 'react';
import { Image } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { Avatar } from './index';

describe('Avatar', () => {
  it('shows initials without a photo, recovers from broken photos and tries a replacement URL', async () => {
    let tree!: Renderer.ReactTestRenderer;
    const render = (imageUrl?: string) => (
      <ThemeProvider>
        <Avatar label="Ana Silva" imageUrl={imageUrl} />
      </ThemeProvider>
    );
    await act(async () => {
      tree = Renderer.create(render());
    });
    expect(JSON.stringify(tree.toJSON())).toContain('AS');
    await act(async () =>
      tree.update(render('https://example.invalid/broken.jpg')),
    );
    expect(tree.root.findByType(Image).props.source.uri).toContain(
      'broken.jpg',
    );
    await act(async () => tree.root.findByType(Image).props.onError());
    expect(tree.root.findAllByType(Image)).toHaveLength(0);
    expect(JSON.stringify(tree.toJSON())).toContain('AS');
    await act(async () =>
      tree.update(render('https://example.invalid/replacement.jpg')),
    );
    expect(tree.root.findByType(Image).props.source.uri).toContain(
      'replacement.jpg',
    );
    await act(async () => tree.unmount());
  });
});
