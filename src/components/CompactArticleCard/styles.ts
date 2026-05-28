import styled from 'styled-components/native';

export const Button = styled.TouchableOpacity`
  width: 228px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 8px;
  shadow-opacity: 1;
  shadow-radius: 18px;
  elevation: ${({ theme }) => theme.elevation.card};
`;

export const ImageShell = styled.View`
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export const ArticleImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 100%;
`;

export const ImageFallback = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const ImageFallbackBadge = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const ImageFallbackBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const MediaTopRow = styled.View`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm}px;
  right: ${({ theme }) => theme.spacing.sm}px;
  left: ${({ theme }) => theme.spacing.sm}px;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategoryTag = styled.View`
  align-self: flex-start;
  max-width: 68%;
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.88);
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: rgba(254, 255, 252, 0.94);
`;

export const CategoryText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const ReactionRow = styled.View`
  align-items: flex-start;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: 20px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const Summary = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: 18px;
`;
