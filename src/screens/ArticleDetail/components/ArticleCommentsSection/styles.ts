import styled, { css } from 'styled-components/native';

export const CommentsSection = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const CommentComposerCard = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const CommentInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textMuted,
}))`
  min-height: 116px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
`;

export const CommentComposerFooter = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CommentHelperText = styled.Text<{
  $tone: 'default' | 'danger';
}>`
  color: ${({ theme, $tone }) =>
    $tone === 'danger' ? theme.colors.danger : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

export const CommentsPromptCard = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const CommentsPromptTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingSm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const CommentsPromptText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const CommentsPromptExtra = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const CommentsStatusCard = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const CommentsStatusText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const CommentList = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CommentCard = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const CommentHeader = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CommentMeta = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const CommentIdentity = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CommentAuthor = styled.Text`
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const CommentDate = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

export const CommentActionsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const CommentActionButton = styled.TouchableOpacity`
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
`;

export const CommentActionLabel = styled.Text<{
  $tone: 'default' | 'danger';
  $disabled: boolean;
}>`
  color: ${({ theme, $tone, $disabled }) => {
    if ($disabled) {
      return theme.colors.textMuted;
    }

    return $tone === 'danger'
      ? theme.colors.danger
      : theme.colors.primaryStrong;
  }};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const controlButtonVariantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  `,
};

const controlButtonDisabledStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primarySoft};
    border-color: ${({ theme }) => theme.colors.primarySoft};
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.surfaceMuted};
    border-color: ${({ theme }) => theme.colors.border};
  `,
};

export const CommentControlButton = styled.TouchableOpacity<{
  $variant: 'primary' | 'secondary';
  $disabled: boolean;
}>`
  min-height: 46px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 8px;
  shadow-opacity: ${({ $variant, $disabled }) =>
    $variant === 'primary' && !$disabled ? 0.14 : 0};
  shadow-radius: 16px;
  elevation: ${({ theme, $variant, $disabled }) =>
    $variant === 'primary' && !$disabled ? theme.elevation.card : 0};
  ${({ $variant }) => controlButtonVariantStyles[$variant]}
  ${({ $variant, $disabled }) =>
    $disabled ? controlButtonDisabledStyles[$variant] : ''}
`;

export const CommentControlLabel = styled.Text<{
  $variant: 'primary' | 'secondary';
  $disabled: boolean;
}>`
  color: ${({ theme, $variant, $disabled }) => {
    if ($disabled) {
      return $variant === 'primary'
        ? theme.colors.primaryStrong
        : theme.colors.textMuted;
    }

    return $variant === 'primary'
      ? theme.colors.textOnPrimary
      : theme.colors.text;
  }};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const CommentBody = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: 22px;
`;

export const CommentEditShell = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CommentEditFooter = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CommentEditActions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const LoadMoreWrap = styled.View`
  align-items: flex-start;
`;
