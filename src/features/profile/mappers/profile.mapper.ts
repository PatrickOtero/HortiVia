import type { AuthUser } from '../../auth/types/auth';
import type {
  GenderOption,
  UpdateProfilePayload,
  UserProfile,
} from '../types/profile';

type ApiProfileResponse = {
  store?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  specialBadge?: UserProfile['specialBadge'];
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  gender?: UserProfile['gender'];
  role: UserProfile['role'];
  createdAt?: string;
  updatedAt?: string;
};

export const GENDER_OPTIONS: GenderOption[] = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'OTHER', label: 'Outro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiro não informar' },
];

const GENDER_LABELS = Object.fromEntries(
  GENDER_OPTIONS.map(option => [option.value, option.label]),
) as Record<Exclude<UserProfile['gender'], null>, string>;

export function getGenderLabel(gender: UserProfile['gender']) {
  if (!gender) {
    return '';
  }

  return GENDER_LABELS[gender];
}

export function toUserProfile(profile: ApiProfileResponse): UserProfile {
  return {
    store: profile.store ?? null,
    jobTitle: profile.jobTitle ?? null,
    phone: profile.phone ?? null,
    city: profile.city ?? null,
    state: profile.state ?? null,
    specialBadge: profile.specialBadge ?? null,
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatarUrl ?? null,
    gender: profile.gender ?? null,
    role: profile.role,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function toAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    gender: profile.gender,
    role: profile.role,
    emailVerified: true,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function sanitizeUpdateProfilePayload(
  payload: UpdateProfilePayload,
): UpdateProfilePayload {
  const nextPayload: UpdateProfilePayload = {};

  for (const field of [
    'store',
    'jobTitle',
    'phone',
    'city',
    'state',
  ] as const) {
    if (payload[field] !== undefined) {
      const value = payload[field]?.trim() || null;
      nextPayload[field] =
        field === 'state' ? value?.toUpperCase() ?? null : value;
    }
  }

  if (typeof payload.name === 'string') {
    nextPayload.name = payload.name.trim();
  }

  if (typeof payload.email === 'string') {
    nextPayload.email = payload.email.trim();
  }

  if (payload.avatarUrl !== undefined) {
    nextPayload.avatarUrl = payload.avatarUrl;
  }

  if (payload.gender) {
    nextPayload.gender = payload.gender;
  }

  return nextPayload;
}
