export type {
  Gender as UserProfileGender,
  UpdateProfilePayload as UpdateUserProfileInput,
  UserProfile,
} from '../features/profile/types/profile';

export type UserProfileFormValues = {
  name: string;
  email: string;
};

export type UserProfileFormErrors = Partial<Record<keyof UserProfileFormValues, string>>;
