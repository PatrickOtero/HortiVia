import type { Asset, ImageLibraryOptions } from 'react-native-image-picker';

export type ImageUploadMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

export type ImageUploadFile = {
  uri: string;
  name?: string;
  type: ImageUploadMimeType;
  size?: number;
};

export const ALLOWED_IMAGE_MIME_TYPES: ImageUploadMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const IMAGE_LIBRARY_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
  includeBase64: false,
};

function getFileNameFromValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const normalizedValue = value.split('?')[0] ?? value;
  const segments = normalizedValue.split('/');

  return segments[segments.length - 1] || undefined;
}

function inferMimeTypeFromName(value?: string | null): ImageUploadMimeType | null {
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

function getExtensionFromMimeType(type: ImageUploadMimeType) {
  if (type === 'image/png') {
    return 'png';
  }

  if (type === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

function buildSafeFileName(
  fallbackFileName: string,
  type: ImageUploadMimeType,
) {
  const baseName = fallbackFileName.replace(/\.[^.]+$/, '');
  const extension = getExtensionFromMimeType(type);

  return `${baseName}.${extension}`;
}

export function normalizeImageUploadFile(
  asset: Asset,
  fallbackFileName: string,
): ImageUploadFile | null {
  if (!asset.uri) {
    return null;
  }

  const resolvedType = (
    ALLOWED_IMAGE_MIME_TYPES.includes(asset.type as ImageUploadMimeType)
      ? asset.type
      : inferMimeTypeFromName(asset.fileName ?? asset.uri)
  ) as ImageUploadMimeType | null;

  if (!resolvedType) {
    return null;
  }

  return {
    uri: asset.uri,
    name: buildSafeFileName(fallbackFileName, resolvedType),
    type: resolvedType,
    size: asset.fileSize,
  };
}

export function validateImageUploadFile(
  file: ImageUploadFile,
  options: {
    invalidMessage: string;
    maxSizeInBytes: number;
    tooLargeMessage: string;
  },
) {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return options.invalidMessage;
  }

  if (
    typeof file.size === 'number' &&
    file.size > options.maxSizeInBytes
  ) {
    return options.tooLargeMessage;
  }

  return null;
}
