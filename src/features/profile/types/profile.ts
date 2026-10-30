import type { UserBadgeType } from '../../../types/userBadge';
import type {
  TrainingProgress,
  TrainingProgressList,
} from '../../training/types/training';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
export type UserRole = 'USER' | 'ADMIN';

export type UserProfile = {
  store?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  specialBadge?: UserBadgeType | null;
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
  store?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  gender?: Exclude<Gender, null>;
};

export type AvatarUploadMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

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

export type PublicUserSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
  specialBadge: UserBadgeType | null;
  store: string | null;
  jobTitle: string | null;
};

export type PublicUserProfile = PublicUserSummary & {
  email?: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  learning: TrainingProgressList & {
    summary: TrainingProgress;
    position: number | null;
  };
};
