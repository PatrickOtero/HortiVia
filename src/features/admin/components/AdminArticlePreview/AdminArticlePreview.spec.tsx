import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { AdminArticlePreview } from './index';

describe('AdminArticlePreview', () => {
  async function renderPreview(
    overrides?: Partial<React.ComponentProps<typeof AdminArticlePreview>>,
  ) {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <AdminArticlePreview
            title="Como aproveitar melhor o tomate"
            summary="Ideias práticas para o dia a dia."
            content={'Texto antigo preservado.\n\nSegundo parágrafo.'}
            category="RECIPES"
            imageUrl="https://example.com/capa.jpg"
            tags={['tomate']}
            blocks={[]}
            authorName="Equipe HortiVia"
            isPublished={false}
            {...overrides}
          />
        </ThemeProvider>,
      );
    });

    return renderer!;
  }

  it('previews legacy article content, metadata, cover and draft status', async () => {
    const renderer = await renderPreview();
    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Como aproveitar melhor o tomate');
    expect(output).toContain('Ideias práticas para o dia a dia.');
    expect(output).toContain('Texto antigo preservado.');
    expect(output).toContain('Segundo parágrafo.');
    expect(output).toContain('Uso na cozinha');
    expect(output).toContain('Rascunho');
    expect(output).toContain('https://example.com/capa.jpg');
    expect(output).toContain('Equipe HortiVia');
  });

  it('uses the existing block renderer and does not duplicate legacy content', async () => {
    const renderer = await renderPreview({
      blocks: [
        {
          id: 'block-1',
          kind: 'TIP',
          title: 'Ideia prática',
          body: 'Aproveite o tomate em uma preparação simples.',
          imageUrl: 'https://example.com/bloco.jpg',
          imageAlt: 'Tomates cortados',
          imageCaption: 'Imagem de apoio',
          items: ['Combine com folhas frescas'],
        },
      ],
    });
    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('article-block-tip');
    expect(output).toContain('Imagem de apoio');
    expect(output).toContain('Combine com folhas frescas');
    expect(output).not.toContain('Texto antigo preservado.');
  });

  it('shows a publication preview when the article is marked published', async () => {
    const renderer = await renderPreview({ isPublished: true });

    expect(JSON.stringify(renderer.toJSON())).toContain('Prévia publicada');
  });
});
