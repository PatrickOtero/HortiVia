import { toArticleDetail } from './article.mapper';

describe('article.mapper', () => {
  it('orders article blocks by sortOrder', () => {
    const article = toArticleDetail({
      id: 'article-1',
      title: 'Como conservar folhas',
      slug: 'como-conservar-folhas',
      summary: 'Dicas simples para o dia a dia.',
      category: 'STORAGE',
      imageUrl: null,
      tags: [],
      author: {
        id: 'author-1',
        name: 'Equipe HortiVia',
        avatarUrl: null,
      },
      blocks: [
        {
          id: 'block-3',
          kind: 'PARAGRAPH',
          body: 'Terceiro bloco.',
          sortOrder: 3,
        },
        {
          id: 'block-1',
          kind: 'HEADING',
          title: 'Primeiro bloco',
          sortOrder: 1,
        },
        {
          id: 'block-2',
          kind: 'CHECKLIST',
          items: ['Secar bem'],
          sortOrder: 2,
        },
      ],
    });

    expect(article.blocks.map(block => block.id)).toEqual([
      'block-1',
      'block-2',
      'block-3',
    ]);
  });

  it('defaults missing blocks to an empty array', () => {
    const article = toArticleDetail({
      id: 'article-1',
      title: 'Como conservar folhas',
      slug: 'como-conservar-folhas',
      summary: 'Dicas simples para o dia a dia.',
      category: 'STORAGE',
      imageUrl: null,
      tags: [],
      author: {
        id: 'author-1',
        name: 'Equipe HortiVia',
        avatarUrl: null,
      },
    });

    expect(article.blocks).toEqual([]);
  });
});
