import React, { useState } from 'react';
import { TextInputProps } from 'react-native';
import * as S from './styles';

type SearchInputProps = TextInputProps;

export function SearchInput({ onBlur, onFocus, ...props }: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <S.Container $isFocused={isFocused}>
      <S.IconWrapper>
        <S.IconLens $isFocused={isFocused} />
        <S.IconHandle $isFocused={isFocused} />
      </S.IconWrapper>
      <S.Input
        onBlur={event => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={event => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        {...props}
      />
    </S.Container>
  );
}
