import React from 'react';
import { Edge } from 'react-native-safe-area-context';
import * as S from './styles';

type SafeScreenProps = {
  children: React.ReactNode;
  edges?: Edge[];
};

export function SafeScreen({
  children,
  edges = ['top', 'left', 'right'],
}: SafeScreenProps) {
  return <S.Container edges={edges}>{children}</S.Container>;
}
