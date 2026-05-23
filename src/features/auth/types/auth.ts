export type AuthUserRole = 'USER' | 'ADMIN';
export type AuthUserGender =
  | 'MALE'
  | 'FEMALE'
  | 'OTHER'
  | 'PREFER_NOT_TO_SAY'
  | null;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  gender?: AuthUserGender;
  role: AuthUserRole;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

export type RegisterResponse = {
  message: string;
  user: AuthUser;
};

export type AuthActionResponse = {
  message: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type ConfirmEmailPayload = {
  email: string;
  code: string;
};

export type ResendConfirmationPayload = {
  email: string;
};
