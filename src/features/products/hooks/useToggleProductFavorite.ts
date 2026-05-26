import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { productsService } from '../services/products.service';

type UseToggleProductFavoriteOptions = {
  productId: string;
  initialIsFavorite?: boolean;
  onSuccess?: (isFavorite: boolean) => void;
  onError?: (message: string) => void;
  onRequireAuth?: () => void;
};

export function useToggleProductFavorite({
  productId,
  initialIsFavorite = false,
  onSuccess,
  onError,
  onRequireAuth,
}: UseToggleProductFavoriteOptions) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite, productId]);

  async function toggleFavorite() {
    if (isSubmitting) {
      return;
    }

    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }

    const previousIsFavorite = isFavorite;
    const nextIsFavorite = !isFavorite;

    setIsFavorite(nextIsFavorite);
    setIsSubmitting(true);

    try {
      if (nextIsFavorite) {
        await productsService.favoriteProduct(productId);
      } else {
        await productsService.unfavoriteProduct(productId);
      }

      onSuccess?.(nextIsFavorite);
    } catch {
      setIsFavorite(previousIsFavorite);
      onError?.('Não foi possível atualizar os favoritos.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isFavorite,
    isSubmitting,
    toggleFavorite,
  };
}
