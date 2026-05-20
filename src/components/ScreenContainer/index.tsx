import React from 'react';
import { ScrollViewProps, ViewProps } from 'react-native';
import * as S from './styles';

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  withTabBarSpacing?: boolean;
} & ScrollViewProps &
  ViewProps;

export function ScreenContainer({
  children,
  scrollable = false,
  withTabBarSpacing = false,
  ...props
}: ScreenContainerProps) {
  if (scrollable) {
    return (
      <S.ScrollContainer
        showsVerticalScrollIndicator={false}
        $withTabBarSpacing={withTabBarSpacing}
        {...props}
      >
        {children}
      </S.ScrollContainer>
    );
  }

  return (
    <S.StaticContainer $withTabBarSpacing={withTabBarSpacing} {...props}>
      {children}
    </S.StaticContainer>
  );
}
