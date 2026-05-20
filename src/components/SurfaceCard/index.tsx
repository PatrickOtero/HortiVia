import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import * as S from './styles';

type SurfaceCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return <S.Container style={style}>{children}</S.Container>;
}
