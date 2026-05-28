import React from 'react';
import type { ArticleBlock } from '../../features/articles/types/article';
import { normalizeBlockItems } from '../../features/articles/utils/articleBlocks';
import * as S from './styles';

type ArticleBlockRendererProps = {
  block: ArticleBlock;
};

function splitBody(body?: string) {
  if (!body) {
    return [];
  }

  return body
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);
}

function renderParagraphs(body?: string) {
  return splitBody(body).map(paragraph => (
    <S.BodyText key={paragraph}>{paragraph}</S.BodyText>
  ));
}

function renderBlockImage(block: ArticleBlock) {
  if (!block.imageUrl) {
    return null;
  }

  return (
    <S.MediaBlock>
      <S.MediaImage
        source={{ uri: block.imageUrl }}
        accessibilityLabel={block.imageAlt ?? block.title ?? 'Imagem do artigo'}
      />
      {block.imageCaption ? (
        <S.ImageCaption>{block.imageCaption}</S.ImageCaption>
      ) : null}
    </S.MediaBlock>
  );
}

export function ArticleBlockRenderer({ block }: ArticleBlockRendererProps) {
  const normalizedItems = normalizeBlockItems(block.items);
  const hasGenericContent = Boolean(block.title) || Boolean(block.body);
  const blockImage = renderBlockImage(block);

  switch (block.kind) {
    case 'PARAGRAPH':
      return block.body || block.imageUrl ? (
        <S.BlockContainer testID="article-block-paragraph">
          {renderParagraphs(block.body)}
          {blockImage}
        </S.BlockContainer>
      ) : null;

    case 'HEADING':
      return block.title || block.body || block.imageUrl ? (
        <S.BlockContainer testID="article-block-heading">
          {block.title || block.body ? (
            <S.HeadingText>{block.title ?? block.body}</S.HeadingText>
          ) : null}
          {blockImage}
        </S.BlockContainer>
      ) : null;

    case 'SECTION':
      return hasGenericContent || block.imageUrl ? (
        <S.SectionBlock testID="article-block-section">
          {block.title ? <S.SectionHeading>{block.title}</S.SectionHeading> : null}
          {renderParagraphs(block.body)}
          {blockImage}
        </S.SectionBlock>
      ) : null;

    case 'IMAGE':
      if (!block.imageUrl) {
        return null;
      }

      return <S.MediaWrapper testID="article-block-image">{blockImage}</S.MediaWrapper>;

    case 'TIP':
      if (!hasGenericContent && normalizedItems.length === 0 && !block.imageUrl) {
        return null;
      }

      return (
        <S.HighlightBlock $tone="tip" testID="article-block-tip">
          <S.HighlightLabel>{block.title ?? 'Dica pratica'}</S.HighlightLabel>
          {renderParagraphs(block.body)}
          {blockImage}
          {normalizedItems.length > 0 ? (
            <S.List>
              {normalizedItems.map(item => (
                <S.ListItem key={item}>
                  <S.ListBulletText>-</S.ListBulletText>
                  <S.ListItemText>{item}</S.ListItemText>
                </S.ListItem>
              ))}
            </S.List>
          ) : null}
        </S.HighlightBlock>
      );

    case 'WARNING':
      if (!hasGenericContent && normalizedItems.length === 0 && !block.imageUrl) {
        return null;
      }

      return (
        <S.HighlightBlock $tone="warning" testID="article-block-warning">
          <S.HighlightLabel>{block.title ?? 'Atencao'}</S.HighlightLabel>
          {renderParagraphs(block.body)}
          {blockImage}
          {normalizedItems.length > 0 ? (
            <S.List>
              {normalizedItems.map(item => (
                <S.ListItem key={item}>
                  <S.ListBulletText>-</S.ListBulletText>
                  <S.ListItemText>{item}</S.ListItemText>
                </S.ListItem>
              ))}
            </S.List>
          ) : null}
        </S.HighlightBlock>
      );

    case 'CHECKLIST':
      if (!hasGenericContent && normalizedItems.length === 0 && !block.imageUrl) {
        return null;
      }

      return (
        <S.SectionBlock testID="article-block-checklist">
          {block.title ? <S.SectionHeading>{block.title}</S.SectionHeading> : null}
          {renderParagraphs(block.body)}
          {blockImage}
          {normalizedItems.length > 0 ? (
            <S.List>
              {normalizedItems.map(item => (
                <S.ListItem key={item}>
                  <S.CheckIndicator>
                    <S.CheckText>✓</S.CheckText>
                  </S.CheckIndicator>
                  <S.ListItemText>{item}</S.ListItemText>
                </S.ListItem>
              ))}
            </S.List>
          ) : null}
        </S.SectionBlock>
      );

    case 'STEPS':
      if (!hasGenericContent && normalizedItems.length === 0 && !block.imageUrl) {
        return null;
      }

      return (
        <S.SectionBlock testID="article-block-steps">
          {block.title ? <S.SectionHeading>{block.title}</S.SectionHeading> : null}
          {renderParagraphs(block.body)}
          {blockImage}
          {normalizedItems.length > 0 ? (
            <S.List>
              {normalizedItems.map((item, index) => (
                <S.ListItem key={`${index + 1}-${item}`}>
                  <S.StepBadge>
                    <S.StepBadgeText>{index + 1}</S.StepBadgeText>
                  </S.StepBadge>
                  <S.ListItemText>{item}</S.ListItemText>
                </S.ListItem>
              ))}
            </S.List>
          ) : null}
        </S.SectionBlock>
      );

    case 'QUOTE':
      if (!block.body && !block.title && !block.imageUrl) {
        return null;
      }

      return (
        <S.QuoteBlock testID="article-block-quote">
          {block.body ? <S.QuoteText>{block.body}</S.QuoteText> : null}
          {blockImage}
          {block.title ? <S.QuoteSource>{block.title}</S.QuoteSource> : null}
        </S.QuoteBlock>
      );

    case 'PRODUCT_REFERENCE':
    case 'OTHER':
      if (!hasGenericContent && normalizedItems.length === 0 && !block.imageUrl) {
        return null;
      }

      return (
        <S.SectionBlock testID={`article-block-${block.kind.toLowerCase()}`}>
          {block.title ? <S.SectionHeading>{block.title}</S.SectionHeading> : null}
          {renderParagraphs(block.body)}
          {blockImage}
          {normalizedItems.length > 0 ? (
            <S.List>
              {normalizedItems.map(item => (
                <S.ListItem key={item}>
                  <S.ListBulletText>-</S.ListBulletText>
                  <S.ListItemText>{item}</S.ListItemText>
                </S.ListItem>
              ))}
            </S.List>
          ) : null}
        </S.SectionBlock>
      );

    default:
      return null;
  }
}
