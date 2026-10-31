import React from 'react';
import { ArticleBlockRenderer } from '../../../components';
import type { ArticleDetail } from '../../../features/articles/types/article';
import { getArticleContentParagraphs } from '../../../features/articles/utils/articleBlocks';
import * as S from '../styles';

type ArticleContentProps = {
  article: ArticleDetail;
};

export function ArticleContent({ article }: ArticleContentProps) {
  const hasBlocks = article.blocks.length > 0;
  const paragraphs = getArticleContentParagraphs(
    article.content,
    article.summary,
  );

  return (
    <S.BodySection>
      <S.BlocksList>
        {hasBlocks
          ? article.blocks.map(block => (
              <ArticleBlockRenderer key={block.id} block={block} />
            ))
          : paragraphs.map((paragraph, index) => (
              <S.Paragraph key={`${index}-${paragraph}`}>
                {paragraph}
              </S.Paragraph>
            ))}
      </S.BlocksList>
    </S.BodySection>
  );
}
