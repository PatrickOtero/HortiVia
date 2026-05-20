import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  launchImageLibrary,
  type Asset,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { useAuth } from '../../auth/hooks/useAuth';
import { toApiError } from '../../../services/api/apiError';
import { toAuthUser } from '../mappers/profile.mapper';
import { profileService } from '../services/profile.service';
import type {
  AvatarUploadFile,
  AvatarUploadMimeType,
  UserProfile,
} from '../types/profile';

const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES: AvatarUploadMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
const SAFE_AVATAR_ERROR_MESSAGES = new Set([
  'Envie uma imagem valida.',
  'A imagem deve ter no maximo 2 MB.',
  'Formato de imagem nao permitido.',
]);
const IMAGE_LIBRARY_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
  includeBase64: false,
};

export type UserProfileFormValues = {
  name: string;
  email: string;
};

export type UserProfileFormErrors = Partial<
  Record<keyof UserProfileFormValues, string>
>;

type UseProfileResult = {
  profile: UserProfile | null;
  formValues: UserProfileFormValues;
  formErrors: UserProfileFormErrors;
  successMessage: string;
  errorMessage: string;
  avatarSuccessMessage: string;
  avatarErrorMessage: string;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  updateField: (field: keyof UserProfileFormValues, value: string) => void;
  saveProfile: () => Promise<boolean>;
  uploadAvatar: () => Promise<boolean>;
  reloadProfile: () => Promise<void>;
};

function createFormValues(profile: UserProfile | null): UserProfileFormValues {
  return {
    name: profile?.name ?? '',
    email: profile?.email ?? '',
  };
}

function validateProfileForm(values: UserProfileFormValues): UserProfileFormErrors {
  const errors: UserProfileFormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.name.trim()) {
    errors.name = 'Informe seu nome.';
  }

  if (!values.email.trim() || !emailPattern.test(values.email.trim())) {
    errors.email = 'Informe um e-mail valido.';
  }

  return errors;
}

function getFileNameFromValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const normalizedValue = value.split('?')[0] ?? value;
  const segments = normalizedValue.split('/');

  return segments[segments.length - 1] || undefined;
}

function inferMimeTypeFromName(value?: string | null): AvatarUploadMimeType | null {
  const fileName = getFileNameFromValue(value)?.toLowerCase();

  if (!fileName) {
    return null;
  }

  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (fileName.endsWith('.png')) {
    return 'image/png';
  }

  if (fileName.endsWith('.webp')) {
    return 'image/webp';
  }

  return null;
}

function normalizeAvatarFile(asset: Asset): AvatarUploadFile | null {
  if (!asset.uri) {
    return null;
  }

  const resolvedType = (
    ALLOWED_AVATAR_MIME_TYPES.includes(asset.type as AvatarUploadMimeType)
      ? asset.type
      : inferMimeTypeFromName(asset.fileName ?? asset.uri)
  ) as AvatarUploadMimeType | null;

  if (!resolvedType) {
    return null;
  }

  return {
    uri: asset.uri,
    name: asset.fileName ?? `avatar.${resolvedType.split('/')[1] ?? 'jpg'}`,
    type: resolvedType,
    size: asset.fileSize,
  };
}

export function useProfile(): UseProfileResult {
  const { user, syncUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formValues, setFormValues] = useState<UserProfileFormValues>(
    createFormValues(null),
  );
  const [formErrors, setFormErrors] = useState<UserProfileFormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState('');
  const [avatarErrorMessage, setAvatarErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const hasAppliedFallbackRef = useRef(false);

  const fallbackProfile = useMemo<UserProfile | null>(() => {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      gender: user.gender ?? null,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }, [user]);

  const applyProfile = useCallback(
    (
      nextProfile: UserProfile | null,
      options?: {
        preserveFormValues?: boolean;
      },
    ) => {
      setProfile(nextProfile);

      if (!options?.preserveFormValues) {
        setFormValues(createFormValues(nextProfile));
      }
    },
    [],
  );

  const reloadProfile = useCallback(async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setAvatarErrorMessage('');
    setIsLoading(true);

    try {
      const nextProfile = await profileService.getProfile();

      applyProfile(nextProfile);
      setFormErrors({});
    } catch {
      if (!fallbackProfile) {
        setProfile(null);
      }

      setErrorMessage('Nao foi possivel carregar seu perfil.');
    } finally {
      setIsLoading(false);
    }
  }, [applyProfile, fallbackProfile]);

  useEffect(() => {
    if (fallbackProfile && !hasAppliedFallbackRef.current) {
      hasAppliedFallbackRef.current = true;
      applyProfile(fallbackProfile);
    }
  }, [applyProfile, fallbackProfile]);

  useEffect(() => {
    reloadProfile();
  }, [reloadProfile]);

  function updateField(field: keyof UserProfileFormValues, value: string) {
    setFormValues(current => ({
      ...current,
      [field]: value,
    }));

    setFormErrors(current => {
      if (!current[field]) {
        return current;
      }

      return {
        ...current,
        [field]: undefined,
      };
    });

    if (successMessage) {
      setSuccessMessage('');
    }

    if (errorMessage) {
      setErrorMessage('');
    }

    if (avatarSuccessMessage) {
      setAvatarSuccessMessage('');
    }

    if (avatarErrorMessage) {
      setAvatarErrorMessage('');
    }
  }

  async function saveProfile() {
    const nextErrors = validateProfileForm(formValues);

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setSuccessMessage('');
      return false;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const updatedProfile = await profileService.updateProfile({
        name: formValues.name,
        email: formValues.email,
      });

      applyProfile(updatedProfile);
      setFormErrors({});
      setSuccessMessage('Perfil atualizado.');
      setAvatarSuccessMessage('');
      setAvatarErrorMessage('');
      syncUser(toAuthUser(updatedProfile));

      return true;
    } catch (error) {
      const apiError = toApiError(error);

      if (apiError.kind === 'conflict' || apiError.kind === 'validation') {
        setErrorMessage('Nao foi possivel salvar suas alteracoes.');
      } else {
        setErrorMessage('Nao foi possivel salvar suas alteracoes.');
      }

      setSuccessMessage('');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadAvatar() {
    if (isUploadingAvatar) {
      return false;
    }

    setAvatarErrorMessage('');
    setAvatarSuccessMessage('');

    try {
      const pickerResponse = await launchImageLibrary(IMAGE_LIBRARY_OPTIONS);

      if (pickerResponse.didCancel) {
        return false;
      }

      if (pickerResponse.errorCode || pickerResponse.errorMessage) {
        setAvatarErrorMessage('Nao foi possivel enviar a imagem.');
        return false;
      }

      const selectedAsset = pickerResponse.assets?.[0];

      if (!selectedAsset) {
        setAvatarErrorMessage('Escolha uma imagem valida.');
        return false;
      }

      const avatarFile = normalizeAvatarFile(selectedAsset);

      if (!avatarFile) {
        setAvatarErrorMessage('Escolha uma imagem valida.');
        return false;
      }

      if (
        typeof avatarFile.size === 'number' &&
        avatarFile.size > MAX_AVATAR_FILE_SIZE
      ) {
        setAvatarErrorMessage('A imagem deve ter no maximo 2 MB.');
        return false;
      }

      setIsUploadingAvatar(true);

      const updatedProfile = await profileService.uploadAvatar(avatarFile);

      applyProfile(updatedProfile, {
        preserveFormValues: true,
      });
      setAvatarSuccessMessage('Foto atualizada.');
      setAvatarErrorMessage('');
      syncUser(toAuthUser(updatedProfile));

      return true;
    } catch (error) {
      const apiError = toApiError(error);
      const safeMessage = SAFE_AVATAR_ERROR_MESSAGES.has(apiError.message)
        ? apiError.message
        : 'Nao foi possivel enviar a imagem.';

      setAvatarErrorMessage(safeMessage);
      setAvatarSuccessMessage('');

      return false;
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  return {
    profile,
    formValues,
    formErrors,
    successMessage,
    errorMessage,
    avatarSuccessMessage,
    avatarErrorMessage,
    isLoading,
    isSaving,
    isUploadingAvatar,
    updateField,
    saveProfile,
    uploadAvatar,
    reloadProfile,
  };
}
