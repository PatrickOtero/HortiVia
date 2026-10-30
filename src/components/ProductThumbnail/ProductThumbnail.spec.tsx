import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ProductThumbnail } from './index';

describe('ProductThumbnail', () => {
  it('shows initials when there is no image', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ProductThumbnail
            imageUrl={null}
            name="Pimentão Verde"
            category="VEGETABLE"
            size="row"
          />
        </ThemeProvider>,
      );
    });

    expect(renderer!.root.findByProps({ children: 'PV' })).toBeTruthy();
  });

  it('falls back to initials when the remote image fails', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ProductThumbnail
            imageUrl="https://images.example.test/abacate.jpg"
            name="Abacate"
            category="FRUIT"
            size="tile"
          />
        </ThemeProvider>,
      );
    });

    const image = renderer!.root.find(
      node => node.props.source?.uri === 'https://images.example.test/abacate.jpg',
    );

    await ReactTestRenderer.act(async () => {
      image.props.onError();
    });

    expect(renderer!.root.findByProps({ children: 'A' })).toBeTruthy();
  });
});
