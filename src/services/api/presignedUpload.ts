export async function uploadFileUriToPresignedUrl(options: {
  uploadUrl: string;
  fileUri: string;
  contentType: string;
}) {
  const fileBlob = await readFileUriAsBlob(options.fileUri);

  try {
    await putBlobToPresignedUrl({
      uploadUrl: options.uploadUrl,
      blob: fileBlob,
      contentType: options.contentType,
    });
  } finally {
    const closeBlob = (fileBlob as Blob & { close?: () => void }).close;

    if (typeof closeBlob === 'function') {
      closeBlob();
    }
  }
}

function readFileUriAsBlob(fileUri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.onerror = () => reject(new Error('file-read-failed'));
    request.onload = () => resolve(request.response as Blob);
    request.responseType = 'blob';
    request.open('GET', fileUri, true);
    request.send();
  });
}

function putBlobToPresignedUrl(options: {
  uploadUrl: string;
  blob: Blob;
  contentType: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.onerror = () => reject(new Error('file-upload-failed'));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      reject(new Error('file-upload-failed'));
    };

    request.open('PUT', options.uploadUrl, true);
    request.setRequestHeader('Content-Type', options.contentType);
    request.send(options.blob);
  });
}
