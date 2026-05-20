import styled, { css } from 'styled-components/native';

type Align = 'left' | 'center';

const centered = css`
  align-items: center;
`;

export const Container = styled.View<{ $align: Align }>`
  gap: ${({ theme }) => theme.spacing.xs}px;
  ${({ $align }) => ($align === 'center' ? centered : '')}
`;

export const Row = styled.View<{ $align: Align }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  ${({ $align }) => ($align === 'center' ? centered : '')}
`;

export const MarkShell = styled.View`
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
`;

export const MarkImage = styled.Image`
  width: 64px;
  height: 64px;
`;

export const Copy = styled.View<{ $align: Align }>`
  flex: 1;
  gap: 1px;
  ${({ $align }) => ($align === 'center' ? centered : '')}
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingLg.fontWeight};
  letter-spacing: ${({ theme }) => theme.typography.headingLg.letterSpacing ?? 0}px;
`;

export const Subtitle = styled.Text<{ $align: Align }>`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  text-align: ${({ $align }) => $align};
`;
