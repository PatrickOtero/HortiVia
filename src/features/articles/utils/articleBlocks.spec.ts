import type { ArticleBlock } from '../types/article';
import { sortArticleBlocks } from './articleBlocks';

const block = (id: string, sortOrder?: number): ArticleBlock => ({
  id,
  kind: 'PARAGRAPH',
  sortOrder,
});

describe('sortArticleBlocks', () => {
  it('sorts by sortOrder and uses the ID to break ties', () => {
    const blocks = [block('z', 2), block('b', 1), block('a', 1)];

    expect(sortArticleBlocks(blocks).map(item => item.id)).toEqual([
      'a',
      'b',
      'z',
    ]);
  });

  it('treats missing sortOrder as zero', () => {
    expect(
      sortArticleBlocks([block('second', 2), block('first')]).map(
        item => item.id,
      ),
    ).toEqual(['first', 'second']);
  });

  it('does not mutate the original list', () => {
    const blocks = [block('b', 2), block('a', 1)];

    expect(sortArticleBlocks(blocks)).not.toBe(blocks);
    expect(blocks.map(item => item.id)).toEqual(['b', 'a']);
  });
});
