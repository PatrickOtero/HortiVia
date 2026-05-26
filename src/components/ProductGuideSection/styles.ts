import styled, { css } from 'styled-components/native';

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ImageBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SectionImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 220px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const ImageCaption = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

export const List = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ListItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Bullet = styled.View`
  width: 9px;
  height: 9px;
  margin-top: 6px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const ListText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
`;

const calloutTones = {
  ideal: css`
    background-color: ${({ theme }) => theme.colors.primarySoft};
    border-color: ${({ theme }) => theme.colors.border};
  `,
  avoid: css`
    background-color: #f8ece7;
    border-color: #ebc8bd;
  `,
};

export const CalloutCard = styled.View<{ $tone: 'ideal' | 'avoid' }>`
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${({ $tone }) => calloutTones[$tone]}
`;

export const CalloutTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const CalloutItem = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;
