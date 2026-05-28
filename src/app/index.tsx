import { ArticleReactionsProvider } from '../features/articles/context/ArticleReactionsContext';
import React from 'react';
import { SavedArticlesProvider } from '../features/articles/context/SavedArticlesContext';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ThemeProvider } from '../contexts/ThemeContext';
import { RootNavigator } from '../navigation/RootNavigator';

function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <RootNavigator isAuthenticated={isAuthenticated} isLoading={isLoading} />
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ArticleReactionsProvider>
          <SavedArticlesProvider>
            <AppNavigation />
          </SavedArticlesProvider>
        </ArticleReactionsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
