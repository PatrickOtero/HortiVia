import type { ImageUploadFile } from '../../utils/images/imagePicker';

export function buildSingleFileUploadFormData(
  fieldName: string,
  file: ImageUploadFile,
  fallbackFileName: string,
) {
  return buildMultipartFormData({
    fileFieldName: fieldName,
    file,
    fallbackFileName,
  });
}

export function buildMultipartFormData(options: {
  fileFieldName: string;
  file: ImageUploadFile;
  fallbackFileName: string;
  fields?: Record<string, string | number | boolean | null | undefined>;
}) {
  const formData = new FormData();

  Object.entries(options.fields ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    formData.append(key, String(value));
  });

  formData.append(
    options.fileFieldName,
    {
      uri: options.file.uri,
      name: options.file.name ?? options.fallbackFileName,
      type: options.file.type,
    } as unknown as Blob,
  );

  return formData;
}
