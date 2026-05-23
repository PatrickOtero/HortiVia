import type { ImageUploadFile } from '../../utils/images/imagePicker';

export function buildSingleFileUploadFormData(
  fieldName: string,
  file: ImageUploadFile,
  fallbackFileName: string,
) {
  const formData = new FormData();

  formData.append(
    fieldName,
    {
      uri: file.uri,
      name: file.name ?? fallbackFileName,
      type: file.type,
    } as unknown as Blob,
  );

  return formData;
}
