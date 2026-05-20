import React from 'react';
import { Switch } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SettingsRow } from '../SettingsRow';
import * as S from './styles';

type SettingsToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
};

export function SettingsToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingsToggleRowProps) {
  const { theme } = useTheme();

  return (
    <SettingsRow
      label={label}
      description={description}
      accessory={
        <S.SwitchWrapper>
          <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{
              false: theme.colors.borderStrong,
              true: theme.colors.primary,
            }}
            thumbColor={value ? theme.colors.surface : theme.colors.surface}
            ios_backgroundColor={theme.colors.border}
          />
        </S.SwitchWrapper>
      }
    />
  );
}
