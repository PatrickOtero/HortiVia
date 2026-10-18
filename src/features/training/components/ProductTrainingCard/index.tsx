import React, { useCallback } from 'react';
import {
  PrimaryButton,
  SectionTitle,
  SurfaceCard,
  TextButton,
} from '../../../../components';
import { useTrainingResource } from '../../hooks/useTrainingResource';
import { trainingService } from '../../services/training.service';
import * as S from './styles';

export function ProductTrainingCard({
  productId,
  onStart,
}: {
  productId: string;
  onStart: () => void;
}) {
  const load = useCallback(
    () => trainingService.getProduct(productId),
    [productId],
  );
  const { data, isLoading, error, refresh } = useTrainingResource(load);
  if (isLoading) return null;
  if (error)
    return (
      <SurfaceCard>
        <S.Content>
          <SectionTitle
            title="Treinamento indisponível"
            subtitle="Confira a conexão e tente novamente."
          />
          <TextButton onPress={refresh}>Tentar carregar treinamento</TextButton>
        </S.Content>
      </SurfaceCard>
    );
  if (!data?.questions.length) return null;
  return (
    <SurfaceCard>
      <S.Content>
        <SectionTitle
          title="Aprenda na prática"
          subtitle={`${data.questions.length} perguntas sobre este produto.`}
        />
        <PrimaryButton onPress={onStart}>Treinar conhecimento</PrimaryButton>
      </S.Content>
    </SurfaceCard>
  );
}
