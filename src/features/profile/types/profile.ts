export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
export type UserRole = 'USER' | 'ADMIN';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  gender: Gender;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  gender?: Exclude<Gender, null>;
};

export type AvatarUploadMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

export type AvatarUploadFile = {
  uri: string;
  name?: string;
  type: AvatarUploadMimeType;
  size?: number;
};

export type GenderOption = {
  value: Exclude<Gender, null>;
  label: string;
};
