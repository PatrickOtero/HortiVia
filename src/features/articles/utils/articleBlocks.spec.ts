import { sortArticleBlocks } from './articleBlocks';

describe('sortArticleBlocks', () => {
  it('orders blocks by sortOrder and uses id as a stable tie-breaker', () => {
    const blocks = [
      { id: 'block-c', kind: 'HEADING' as const, sortOrder: 2 },
      { id: 'block-b', kind: 'PARAGRAPH' as const, sortOrder: 1 },
      { id: 'block-a', kind: 'SECTION' as const, sortOrder: 1 },
    ];

    expect(sortArticleBlocks(blocks).map(block => block.id)).toEqual([
      'block-a',
      'block-b',
      'block-c',
    ]);
    expect(blocks[0].id).toBe('block-c');
  });
});
