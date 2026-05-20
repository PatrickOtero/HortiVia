import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  SessionLoading: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Feed: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabParamList>;
  ProductDetail: {
    productId: string;
  };
  ArticleDetail: {
    articleId: string;
  };
  EditProfile: undefined;
};
