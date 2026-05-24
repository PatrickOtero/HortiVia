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
  AuthActionResponse,
  AuthUser,
  ConfirmEmailPayload,
  LoginPayload,
  LoginResponse,
  RequestPasswordResetPayload,
  RegisterPayload,
  RegisterResponse,
  ResendConfirmationPayload,
  ResendPasswordResetCodePayload,
  ResetPasswordPayload,
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
  signIn: (payload: LoginPayload) => Promise<LoginResponse>;
  registerAccount: (payload: RegisterPayload) => Promise<RegisterResponse>;
  confirmEmail: (payload: ConfirmEmailPayload) => Promise<AuthActionResponse>;
  resendConfirmation: (
    payload: ResendConfirmationPayload,
  ) => Promise<AuthActionResponse>;
  requestPasswordReset: (
    payload: RequestPasswordResetPayload,
  ) => Promise<AuthActionResponse>;
  resendPasswordResetCode: (
    payload: ResendPasswordResetCodePayload,
  ) => Promise<AuthActionResponse>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<AuthActionResponse>;
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
        const authenticatedUser = await authService.getMe();

        if (!authenticatedUser.emailVerified) {
          await clearSession(true);
          return null;
        }

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
    const response = await authService.login(payload);

    await setToken(response.accessToken);
    setApiAccessToken(response.accessToken);
    setAccessTokenState(response.accessToken);
    setUser(response.user);

    return response;
  }, []);

  const registerAccount = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload);

    return response;
  }, []);

  const confirmEmail = useCallback(async (payload: ConfirmEmailPayload) => {
    return authService.confirmEmail(payload);
  }, []);

  const resendConfirmation = useCallback(
    async (payload: ResendConfirmationPayload) => {
      return authService.resendConfirmation(payload);
    },
    [],
  );

  const requestPasswordReset = useCallback(
    async (payload: RequestPasswordResetPayload) => {
      return authService.requestPasswordReset(payload);
    },
    [],
  );

  const resendPasswordResetCode = useCallback(
    async (payload: ResendPasswordResetCodePayload) => {
      return authService.resendPasswordResetCode(payload);
    },
    [],
  );

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    return authService.resetPassword(payload);
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
      isAuthenticated: Boolean(user && accessToken && user.emailVerified),
      isLoading,
      signIn,
      registerAccount,
      confirmEmail,
      resendConfirmation,
      requestPasswordReset,
      resendPasswordResetCode,
      resetPassword,
      signOut,
      loadAuthenticatedUser,
      syncUser,
    }),
    [
      accessToken,
      confirmEmail,
      isLoading,
      loadAuthenticatedUser,
      requestPasswordReset,
      registerAccount,
      resendPasswordResetCode,
      resendConfirmation,
      resetPassword,
      signIn,
      signOut,
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
