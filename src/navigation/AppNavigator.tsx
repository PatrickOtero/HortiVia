import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabsNavigator } from './AppTabsNavigator';
import { BackButton } from '../components/BackButton';
import { AdminArticleFormScreen } from '../features/admin/screens/AdminArticleFormScreen';
import { AdminArticlesScreen } from '../features/admin/screens/AdminArticlesScreen';
import { AdminHomeScreen } from '../features/admin/screens/AdminHomeScreen';
import { AdminProductFormScreen } from '../features/admin/screens/AdminProductFormScreen';
import { AdminProductsScreen } from '../features/admin/screens/AdminProductsScreen';
import { useTheme } from '../hooks/useTheme';
import { ArticleDetailScreen } from '../screens/ArticleDetail';
import { EditProfileScreen } from '../screens/EditProfile';
import { ProductDetailScreen } from '../screens/ProductDetail';
import { AppStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

type HeaderBackButtonProps = {
  canGoBack?: boolean;
};

function HeaderBackButton({ canGoBack }: HeaderBackButtonProps) {
  const navigation = useNavigation();

  if (!canGoBack) {
    return <BackButton />;
  }

  return <BackButton onPress={() => navigation.goBack()} />;
}

export function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTitleStyle: {
          fontSize: theme.typography.bodyLg.fontSize,
          fontWeight: theme.typography.headingSm.fontWeight,
          color: theme.colors.text,
        },
        headerLeft: HeaderBackButton,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        options={{ headerShown: false }}
        component={AppTabsNavigator}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminProducts"
        component={AdminProductsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminProductForm"
        component={AdminProductFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminArticles"
        component={AdminArticlesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminArticleForm"
        component={AdminArticleFormScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
