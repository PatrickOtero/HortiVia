import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '../services/auth.service';
import { getToken, removeToken, setToken } from '../storage/authToken.storage';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';
import {
  setApiAccessToken,
  setApiUnauthorizedHandler,
} from '../../../services/api/apiClient';
import { toApiError } from '../../../services/api/apiError';

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<AuthResponse>;
  signUp: (payload: RegisterPayload) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  loadAuthenticatedUser: (token?: string | null) => Promise<AuthUser | null>;
  syncUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async (removeStoredToken = true) => {
    if (removeStoredToken) {
      await removeToken();
    }

    setApiAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
  }, []);

  const loadAuthenticatedUser = useCallback(
    async (token?: string | null) => {
      const tokenToUse = token ?? (await getToken());

      if (!tokenToUse) {
        setApiAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
        return null;
      }

      setApiAccessToken(tokenToUse);

      try {
        const authenticatedUser = await authService.getAuthenticatedUser();

        setAccessTokenState(tokenToUse);
        setUser(authenticatedUser);

        return authenticatedUser;
      } catch (error) {
        const apiError = toApiError(error);

        if (apiError.status === 401) {
          await clearSession(true);
          return null;
        }

        setApiAccessToken(null);
        setAccessTokenState(null);
        setUser(null);

        return null;
      }
    },
    [clearSession],
  );

  const signIn = useCallback(async (payload: LoginPayload) => {
    const response = await authService.signIn(payload);

    await setToken(response.accessToken);
    setApiAccessToken(response.accessToken);
    setAccessTokenState(response.accessToken);
    setUser(response.user);

    return response;
  }, []);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.signUp(payload);

    await setToken(response.accessToken);
    setApiAccessToken(response.accessToken);
    setAccessTokenState(response.accessToken);
    setUser(response.user);

    return response;
  }, []);

  const signOut = useCallback(async () => {
    await clearSession(true);
  }, [clearSession]);

  const syncUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
  }, []);

  useEffect(() => {
    setApiUnauthorizedHandler(() => clearSession(true));

    return () => {
      setApiUnauthorizedHandler(null);
    };
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      try {
        const storedToken = await getToken();

        if (!storedToken) {
          if (isMounted) {
            setApiAccessToken(null);
            setAccessTokenState(null);
            setUser(null);
          }

          return;
        }

        await loadAuthenticatedUser(storedToken);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [loadAuthenticatedUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      signIn,
      signUp,
      signOut,
      loadAuthenticatedUser,
      syncUser,
    }),
    [
      accessToken,
      isLoading,
      loadAuthenticatedUser,
      signIn,
      signOut,
      signUp,
      syncUser,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
