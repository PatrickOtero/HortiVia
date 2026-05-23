type AdminNavigation = {
  canGoBack: () => boolean;
  goBack: () => void;
  navigate: (
    screen: 'MainTabs',
    params: {
      screen: 'Settings';
    },
  ) => void;
};

export function goBackFromAdmin(navigation: AdminNavigation) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  navigation.navigate('MainTabs', {
    screen: 'Settings',
  });
}
