import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import * as S from './styles';

type InputFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  helperTone?: 'default' | 'danger' | 'success';
  rightAccessory?: React.ReactNode;
};

export const InputField = forwardRef<TextInput, InputFieldProps>(function InputField(
  {
    label,
    helperText,
    helperTone = 'default',
    rightAccessory,
    onBlur,
    onFocus,
    editable = true,
    ...props
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  function handleFocus(event: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) {
    setIsFocused(false);
    onBlur?.(event);
  }

  return (
    <S.Container>
      {label ? <S.Label $isFocused={isFocused}>{label}</S.Label> : null}
      <S.InputShell $isFocused={isFocused} $editable={editable}>
        <S.Input
          ref={ref}
          editable={editable}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...props}
        />
        {rightAccessory ? <S.RightAccessory>{rightAccessory}</S.RightAccessory> : null}
      </S.InputShell>
      {helperText ? <S.HelperText $tone={helperTone}>{helperText}</S.HelperText> : null}
    </S.Container>
  );
});
