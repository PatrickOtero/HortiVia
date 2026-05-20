import React, { useEffect, useState } from 'react';
import * as S from './styles';

type AvatarProps = {
  label: string;
  size?: number;
  imageUrl?: string | null;
};

export function Avatar({ label, size = 44, imageUrl }: AvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const initials = label
    .split(' ')
    .slice(0, 2)
    .map(item => item.charAt(0).toUpperCase())
    .join('');
  const shouldShowImage = Boolean(imageUrl) && !hasImageError;

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <S.Container $size={size}>
      {shouldShowImage ? (
        <S.Image
          source={{ uri: imageUrl ?? undefined }}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <S.Label>{initials}</S.Label>
      )}
    </S.Container>
  );
}
