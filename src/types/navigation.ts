import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login:
    | {
        email?: string;
        infoMessage?: string;
      }
    | undefined;
  Register: undefined;
  ForgotPassword:
    | {
        email?: string;
      }
    | undefined;
  ResetPassword:
    | {
        email?: string;
        infoMessage?: string;
      }
    | undefined;
  VerifyEmail:
    | {
        email?: string;
        infoMessage?: string;
      }
    | undefined;
  SessionLoading: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Feed: undefined;
  Favorites: undefined;
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
  AdminHome: undefined;
  AdminProducts: undefined;
  AdminProductForm: {
    productId?: string;
  };
  AdminProductVisualContent: {
    productId: string;
  };
  AdminArticles: undefined;
  AdminArticleForm: {
    articleId?: string;
  };
};
