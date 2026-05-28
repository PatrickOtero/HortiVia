import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ArticleBlockRenderer } from './index';

describe('ArticleBlockRenderer', () => {
  async function renderBlock(
    block: React.ComponentProps<typeof ArticleBlockRenderer>['block'],
  ) {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleBlockRenderer block={block} />
        </ThemeProvider>,
      );
    });

    return renderer!;
  }

  it('renders paragraph blocks', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'PARAGRAPH',
      body: 'Texto introdutorio.',
    });

    expect(JSON.stringify(renderer.toJSON())).toContain('Texto introdutorio.');
  });

  it('renders section blocks', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'SECTION',
      title: 'Secagem correta',
      body: 'Seque bem antes de guardar.',
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Secagem correta');
    expect(output).toContain('Seque bem antes de guardar.');
  });

  it('renders tip blocks', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'TIP',
      body: 'Use um pano limpo.',
      items: ['Nao feche o pote ainda'],
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Use um pano limpo.');
    expect(output).toContain('Nao feche o pote ainda');
  });

  it('renders warning blocks', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'WARNING',
      body: 'Evite folhas molhadas.',
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Evite folhas molhadas.');
    expect(output).toContain('Atencao');
  });

  it('renders checklist items', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'CHECKLIST',
      title: 'Antes de guardar',
      items: ['Secar bem', 'Usar pote limpo'],
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Secar bem');
    expect(output).toContain('Usar pote limpo');
  });

  it('renders numbered steps', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'STEPS',
      items: ['Lave', 'Seque', 'Guarde'],
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('"1"');
    expect(output).toContain('"2"');
    expect(output).toContain('"3"');
  });

  it('hides image blocks when imageUrl is missing', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'IMAGE',
      imageCaption: 'Legenda solta',
    });

    expect(renderer.toJSON()).toBeNull();
  });

  it('renders imageUrl for non-image blocks when available', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'SECTION',
      title: 'Secagem correta',
      body: 'Seque bem antes de guardar.',
      imageUrl: 'https://cdn.example.com/block.webp',
      imageCaption: 'Imagem de apoio',
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Secagem correta');
    expect(output).toContain('Imagem de apoio');
    expect(output).toContain('https://cdn.example.com/block.webp');
  });

  it('ignores malformed items without crashing', async () => {
    const renderer = await renderBlock({
      id: 'block-1',
      kind: 'CHECKLIST',
      items: [null, 1, { label: 'Secar bem' }, { nope: true }],
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Secar bem');
    expect(output).not.toContain('nope');
  });
});
