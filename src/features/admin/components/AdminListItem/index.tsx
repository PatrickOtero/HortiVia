import React, { useEffect, useState } from 'react';
import { SecondaryButton, TextButton } from '../../../../components';
import * as S from './styles';

type AdminListItemProps = {
  title: string;
  subtitle: string;
  meta?: string | null;
  imageUrl?: string | null;
  imageFallbackLabel: string;
  extraActionLabel?: string;
  onExtraAction?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function AdminListItem({
  title,
  subtitle,
  meta,
  imageUrl,
  imageFallbackLabel,
  extraActionLabel,
  onExtraAction,
  onEdit,
  onDelete,
  isDeleting = false,
}: AdminListItemProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(imageUrl) && !hasImageError;

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <S.Container>
      <S.ContentRow>
        <S.CopyBlock>
          <S.Title>{title}</S.Title>
          {meta ? <S.Meta>{meta}</S.Meta> : null}
          <S.Subtitle>{subtitle}</S.Subtitle>
        </S.CopyBlock>
        <S.ImageFrame>
          {shouldShowImage ? (
            <S.ImagePreview
              source={{ uri: imageUrl ?? undefined }}
              resizeMode="cover"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <S.ImageFallback>
              <S.ImageFallbackBadge>
                <S.ImageFallbackBadgeText>HortiVia</S.ImageFallbackBadgeText>
              </S.ImageFallbackBadge>
              <S.ImageFallbackLabel>{imageFallbackLabel}</S.ImageFallbackLabel>
            </S.ImageFallback>
          )}
        </S.ImageFrame>
      </S.ContentRow>
      <S.Actions>
        {extraActionLabel && onExtraAction ? (
          <SecondaryButton fullWidth={false} onPress={onExtraAction}>
            {extraActionLabel}
          </SecondaryButton>
        ) : null}
        <SecondaryButton fullWidth={false} onPress={onEdit}>
          Editar
        </SecondaryButton>
        <TextButton
          fullWidth={false}
          onPress={onDelete}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Remover
        </TextButton>
      </S.Actions>
    </S.Container>
  );
}
