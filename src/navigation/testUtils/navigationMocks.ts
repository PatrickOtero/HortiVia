// Native views require a device. Keep React Navigation itself entirely real.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native-screens', () => {
  const screens = Object.create(jest.requireActual('react-native-screens'));
  const { View } = jest.requireActual('react-native');
  ['Screen', 'ScreenContainer', 'ScreenStack', 'ScreenStackItem'].forEach(
    name => {
      Object.defineProperty(screens, name, { value: View });
    },
  );
  return screens;
});

jest.mock('../../screens/Login', () => ({
  LoginScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/Register', () => ({
  RegisterScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/ForgotPassword', () => ({
  ForgotPasswordScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/ResetPassword', () => ({
  ResetPasswordScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/VerifyEmail', () => ({
  VerifyEmailScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/SessionLoading', () => {
  const React = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return {
    SessionLoadingScreen: () =>
      React.createElement(Text, { testID: 'session-loading' }, 'Loading'),
  };
});
jest.mock('../../screens/Home', () => ({
  HomeScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/Feed', () => ({
  FeedScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/Library', () => ({
  LibraryScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/Settings', () => ({
  SettingsScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/ProductDetail', () => ({
  ProductDetailScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/ArticleDetail', () => ({
  ArticleDetailScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../features/training/screens/TrainingScreen', () => ({
  TrainingScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../features/training/screens/TrainingProgressScreen', () => ({
  TrainingProgressScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../features/admin/screens/AdminTrainingProductsScreen', () => ({
  AdminTrainingProductsScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../features/admin/screens/AdminTrainingQuestionsScreen', () => ({
  AdminTrainingQuestionsScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/SavedArticles', () => ({
  SavedArticlesScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../screens/EditProfile', () => ({
  EditProfileScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../features/admin/screens/AdminHomeScreen', () => ({
  AdminHomeScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../features/admin/screens/AdminProductsScreen', () => ({
  AdminProductsScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../features/admin/screens/AdminProductFormScreen', () => ({
  AdminProductFormScreen:
    jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock(
  '../../features/admin/screens/AdminProductVisualContentScreen',
  () => ({
    AdminProductVisualContentScreen:
      jest.requireActual('./NavigationProbe').NavigationProbe,
  }),
);
jest.mock('../../features/admin/screens/AdminArticlesScreen', () => ({
  AdminArticlesScreen: jest.requireActual('./NavigationProbe').NavigationProbe,
}));
jest.mock('../../features/admin/screens/AdminArticleFormScreen', () => ({
  AdminArticleFormScreen:
    jest.requireActual('./NavigationProbe').NavigationProbe,
}));
