import React, { useEffect, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { ArticleReactionButton } from '../ArticleReactionButton';
import { SavedArticleButton } from '../SavedArticleButton';
import { getArticleCategoryLabel } from '../../features/articles/mappers/article.mapper';
import type { ArticleListItem } from '../../features/articles/types/article';
import type { RelatedArticle } from '../../features/products/types/product';
import * as S from './styles';

type CompactArticlePreview = Pick<
  RelatedArticle | ArticleListItem,
  'id' | 'title' | 'summary' | 'category' | 'imageUrl'
> & {
  reactionsCount?: number;
  isReacted?: boolean;
};

type CompactArticleCardProps = {
  article: CompactArticlePreview;
  onPress: () => void;
  isSaved?: boolean;
  isSavedLoading?: boolean;
  onToggleSaved?: (event: GestureResponderEvent) => void;
};

export function CompactArticleCard({
  article,
  onPress,
  isSaved,
  isSavedLoading = false,
  onToggleSaved,
}: CompactArticleCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [article.imageUrl]);

  const shouldShowImage = Boolean(article.imageUrl) && !hasImageError;

  return (
    <S.Button onPress={onPress} activeOpacity={0.94}>
      <S.ImageShell>
        {shouldShowImage ? (
          <S.ArticleImage
            source={{ uri: article.imageUrl ?? undefined }}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <S.ImageFallback>
            <S.ImageFallbackBadge>
              <S.ImageFallbackBadgeText>HortiVia</S.ImageFallbackBadgeText>
            </S.ImageFallbackBadge>
          </S.ImageFallback>
        )}

        <S.MediaTopRow>
          <S.CategoryTag>
            <S.CategoryText>
              {getArticleCategoryLabel(article.category)}
            </S.CategoryText>
          </S.CategoryTag>
          {onToggleSaved ? (
            <SavedArticleButton
              isSaved={Boolean(isSaved)}
              isLoading={isSavedLoading}
              onPress={onToggleSaved}
              size="sm"
              showLabel={false}
            />
          ) : null}
        </S.MediaTopRow>
      </S.ImageShell>

      <S.Content>
        <S.Title numberOfLines={2} ellipsizeMode="tail">
          {article.title}
        </S.Title>
        <S.Summary numberOfLines={2} ellipsizeMode="tail">
          {article.summary}
        </S.Summary>
        {article.reactionsCount !== undefined ? (
          <S.ReactionRow>
            <ArticleReactionButton
              isActive={article.isReacted === true}
              count={article.reactionsCount}
              size="sm"
            />
          </S.ReactionRow>
        ) : null}
      </S.Content>
    </S.Button>
  );
}
