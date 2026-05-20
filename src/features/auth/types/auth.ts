export type AuthUserRole = 'USER' | 'ADMIN';
export type AuthUserGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  gender?: AuthUserGender;
  role: AuthUserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
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
