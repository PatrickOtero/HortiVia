import styled from 'styled-components/native';

export const Button = styled.Pressable<{ $active: boolean }>`
  min-height: 40px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
`;

export const Label = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme, $active }) =>
    $active ? theme.typography.label.fontWeight : theme.typography.bodySm.fontWeight};
`;
