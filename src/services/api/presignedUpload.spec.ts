import { MockXMLHttpRequest as XHR } from './testUtils/nativeHttp';
import { apiClient, setApiAccessToken } from './apiClient';
import { articlesService } from '../../features/articles/services/articles.service';
import { uploadFileUriToPresignedUrl } from './presignedUpload';

describe('presigned uploads use standalone XMLHttpRequest', () => {
  const options = {
    uploadUrl: 'https://storage.example.invalid/test-image?signature=test-only',
    fileUri: 'file:///test-image.png',
    contentType: 'image/png',
  };
  const blob = { close: jest.fn() };

  beforeEach(() => {
    blob.close.mockClear();
    setApiAccessToken('test-token-must-not-reach-storage');
  });
  afterEach(() => {
    setApiAccessToken(null);
    jest.restoreAllMocks();
  });

  it.each([200, 201, 204])(
    'reads the local blob and accepts upload HTTP %i without Axios or Bearer',
    async status => {
      const axiosRequest = jest.spyOn(apiClient, 'request');
      XHR.replies.push({ body: blob }, { status });
      await expect(
        articlesService.uploadFileToPresignedUrl(options),
      ).resolves.toBeUndefined();

      expect(XHR.requests).toHaveLength(2);
      const [read, upload] = XHR.requests;
      expect(read.open).toHaveBeenCalledWith('GET', options.fileUri, true);
      expect(read.responseType).toBe('blob');
      expect(read.send).toHaveBeenCalledWith();
      expect(read.headers).toEqual({});
      expect(upload.open).toHaveBeenCalledWith('PUT', options.uploadUrl, true);
      expect(upload.headers).toEqual({ 'content-type': 'image/png' });
      expect(upload.send).toHaveBeenCalledWith(blob);
      expect(axiosRequest).not.toHaveBeenCalled();
      expect(blob.close).toHaveBeenCalledTimes(1);
    },
  );

  it.each([0, 301, 400, 401, 403, 500])(
    'rejects upload HTTP %i and closes the blob',
    async status => {
      XHR.replies.push({ body: blob }, { status });
      await expect(uploadFileUriToPresignedUrl(options)).rejects.toThrow(
        'file-upload-failed',
      );
      expect(blob.close).toHaveBeenCalledTimes(1);
    },
  );

  it('closes the blob after an upload network failure', async () => {
    XHR.replies.push({ body: blob }, { event: 'error' });
    await expect(uploadFileUriToPresignedUrl(options)).rejects.toThrow(
      'file-upload-failed',
    );
    expect(blob.close).toHaveBeenCalledTimes(1);
  });

  it('does not start the upload after a local file read failure', async () => {
    XHR.replies.push({ event: 'error' });
    await expect(uploadFileUriToPresignedUrl(options)).rejects.toThrow(
      'file-read-failed',
    );
    expect(XHR.requests).toHaveLength(1);
    expect(blob.close).not.toHaveBeenCalled();
  });

  it('supports blobs without a React Native close method', async () => {
    XHR.replies.push({ body: {} }, { status: 204 });
    await expect(uploadFileUriToPresignedUrl(options)).resolves.toBeUndefined();
  });
});
