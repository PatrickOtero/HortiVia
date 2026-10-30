import React, { useMemo } from 'react';
import { ArticleBlockRenderer } from '../../../../components/ArticleBlockRenderer';
import { getArticleCategoryLabel } from '../../../articles/mappers/article.mapper';
import type {
  ArticleBlock,
  ArticleCategory,
} from '../../../articles/types/article';
import { getArticleContentParagraphs } from '../../../articles/utils/articleBlocks';
import * as S from './styles';

type AdminArticlePreviewProps = {
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory | null;
  imageUrl: string | null;
  tags: string[];
  blocks: ArticleBlock[];
  authorName?: string;
  isPublished: boolean;
};

export function AdminArticlePreview({
  title,
  summary,
  content,
  category,
  imageUrl,
  tags,
  blocks,
  authorName,
  isPublished,
}: AdminArticlePreviewProps) {
  const contentParagraphs = useMemo(
    () => getArticleContentParagraphs(content, summary),
    [content, summary],
  );

  return (
    <S.Container testID="admin-article-preview">
      <S.PreviewHeading accessibilityRole="header">
        Prévia do artigo
      </S.PreviewHeading>
      <S.PreviewDescription>
        Confira a hierarquia e a sequência do conteúdo antes de salvar.
      </S.PreviewDescription>

      {imageUrl ? (
        <S.CoverImage
          source={{ uri: imageUrl }}
          accessibilityLabel={title.trim() || 'Imagem de capa do artigo'}
          accessibilityRole="image"
        />
      ) : null}

      <S.MetaRow>
        <S.MetaPill>
          <S.MetaText>
            {category ? getArticleCategoryLabel(category) : 'Categoria pendente'}
          </S.MetaText>
        </S.MetaPill>
        <S.MetaPill $status>
          <S.MetaText $status>
            {isPublished ? 'Prévia publicada' : 'Rascunho'}
          </S.MetaText>
        </S.MetaPill>
      </S.MetaRow>

      <S.ArticleTitle accessibilityRole="header">
        {title.trim() || 'Título do artigo'}
      </S.ArticleTitle>
      <S.Summary>{summary.trim() || 'O resumo aparecerá aqui.'}</S.Summary>

      {authorName ? <S.Author>Por {authorName}</S.Author> : null}

      {tags.length > 0 ? (
        <S.TagList>
          {tags.map(tag => (
            <S.Tag key={tag}>{tag}</S.Tag>
          ))}
        </S.TagList>
      ) : null}

      <S.Body testID="admin-article-preview-body">
        {blocks.length > 0
          ? blocks.map(block => (
              <ArticleBlockRenderer key={block.id} block={block} />
            ))
          : contentParagraphs.map((paragraph, index) => (
              <S.LegacyParagraph key={`${index}-${paragraph}`}>
                {paragraph}
              </S.LegacyParagraph>
            ))}
      </S.Body>
    </S.Container>
  );
}
