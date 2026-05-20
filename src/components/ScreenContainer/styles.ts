import styled, { css } from 'styled-components/native';

const shared = css<{ $withTabBarSpacing: boolean }>`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.layout.screenPadding}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
  padding-bottom: ${({ theme, $withTabBarSpacing }) =>
    $withTabBarSpacing
      ? theme.layout.tabContentBottomPadding
      : theme.layout.screenBottomPadding}px;
`;

export const StaticContainer = styled.View<{ $withTabBarSpacing: boolean }>`
  ${shared}
`;

export const ScrollContainer = styled.ScrollView.attrs<{
  $withTabBarSpacing: boolean;
}>(({ theme, $withTabBarSpacing }) => ({
  contentContainerStyle: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    paddingBottom: $withTabBarSpacing
      ? theme.layout.tabContentBottomPadding
      : theme.layout.screenBottomPadding,
    rowGap: theme.layout.contentGap,
  },
}))``;
