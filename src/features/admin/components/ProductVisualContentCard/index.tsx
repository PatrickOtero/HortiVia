import React, { useEffect, useState } from 'react';
import { SecondaryButton, TextButton } from '../../../../components';
import * as S from './styles';

type ProductVisualContentCardProps = {
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  badgeLabel?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
};

export function ProductVisualContentCard({
  imageUrl,
  title,
  subtitle,
  badgeLabel,
  onEdit,
  onDelete,
  isDeleting = false,
}: ProductVisualContentCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(imageUrl) && !hasImageError;

  useEffect(() => setHasImageError(false), [imageUrl]);

  return (
    <S.ItemCard>
      <S.ItemRow>
        <S.PreviewFrame>
          {shouldShowImage ? (
            <S.PreviewImage
              source={{ uri: imageUrl ?? undefined }}
              resizeMode="cover"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <S.PreviewFallback>
              <S.PreviewFallbackBadge>
                <S.PreviewFallbackBadgeText>
                  HortiVia
                </S.PreviewFallbackBadgeText>
              </S.PreviewFallbackBadge>
              <S.PreviewFallbackText>Sem imagem</S.PreviewFallbackText>
            </S.PreviewFallback>
          )}
        </S.PreviewFrame>

        <S.ItemCopy>
          <S.ItemTitle>{title}</S.ItemTitle>
          {badgeLabel ? <S.ItemMeta>{badgeLabel}</S.ItemMeta> : null}
          {subtitle ? <S.ItemSubtitle>{subtitle}</S.ItemSubtitle> : null}
        </S.ItemCopy>
      </S.ItemRow>

      {onEdit || onDelete ? (
        <S.ItemActions>
          {onEdit ? (
            <SecondaryButton fullWidth={false} onPress={onEdit}>
              Editar
            </SecondaryButton>
          ) : null}
          {onDelete ? (
            <TextButton
              fullWidth={false}
              onPress={onDelete}
              loading={isDeleting}
              disabled={isDeleting}
            >
              Excluir
            </TextButton>
          ) : null}
        </S.ItemActions>
      ) : null}
    </S.ItemCard>
  );
}
