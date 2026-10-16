import { MockXMLHttpRequest as XHR } from '../../../services/api/testUtils/nativeHttp';
import { API_CONFIG, API_ENDPOINTS } from '../../../config/apiConfig';
import { setApiAccessToken } from '../../../services/api/apiClient';
import { articlesService } from './articles.service';

describe('articlesService HTTP contracts', () => {
  beforeEach(() => setApiAccessToken('test-token'));
  afterEach(() => setApiAccessToken(null));

  const comment = {
    id: 'test-comment',
    body: 'Test comment',
    status: 'VISIBLE',
    createdAt: '2026-01-01T00:00:00.000Z',
    author: { id: 'test-user', name: 'Test User' },
  };

  it('preserves GET pagination, POST/PATCH JSON and DELETE without a body', async () => {
    XHR.replies.push(
      {
        body: { items: [comment], page: 2, limit: 5, total: 6, totalPages: 2 },
      },
      { status: 201, body: comment },
      { body: comment },
      { status: 204, body: '' },
    );
    const result = await articlesService.listArticleComments('test-article', {
      page: 2,
      limit: 5,
    });
    await expect(
      articlesService.createArticleComment('test-article', ' Test comment '),
    ).resolves.toEqual(comment);
    await expect(
      articlesService.updateArticleComment(
        'test-article',
        comment.id,
        ' Test comment ',
      ),
    ).resolves.toEqual(comment);
    await expect(
      articlesService.deleteArticleComment('test-article', comment.id),
    ).resolves.toBeUndefined();

    expect(result).toEqual({
      items: [comment],
      page: 2,
      limit: 5,
      total: 6,
      totalPages: 2,
    });
    const listUrl = `${API_CONFIG.baseURL}${API_ENDPOINTS.articles.comments(
      'test-article',
    )}`;
    const detailUrl = `${
      API_CONFIG.baseURL
    }${API_ENDPOINTS.articles.commentDetail('test-article', comment.id)}`;
    expect(XHR.requests.map(request => request.open.mock.calls[0])).toEqual([
      ['GET', `${listUrl}?page=2&limit=5`, true],
      ['POST', listUrl, true],
      ['PATCH', detailUrl, true],
      ['DELETE', detailUrl, true],
    ]);
    expect(XHR.requests.map(request => request.send.mock.calls[0][0])).toEqual([
      null,
      JSON.stringify({ body: 'Test comment' }),
      JSON.stringify({ body: 'Test comment' }),
      null,
    ]);
    expect(
      XHR.requests.every(
        request => request.headers.authorization === 'Bearer test-token',
      ),
    ).toBe(true);
  });

  it.each([false, true])(
    'uploads native block FormData (explicit filename: %s)',
    async hasName => {
      XHR.replies.push({
        body: {
          id: 'test-block',
          articleId: 'test-article',
          kind: 'SECTION',
          items: [],
          sortOrder: 0,
        },
      });
      await articlesService.uploadArticleBlockImage({
        articleId: 'test-article',
        blockId: 'test-block',
        file: {
          uri: 'content://test/image',
          type: 'image/png',
          ...(hasName ? { name: 'test.png' } : {}),
        },
        imageAlt: ' Test image ',
        imageCaption: ' Test caption ',
      });

      const request = XHR.requests[0];
      const form = request.send.mock.calls[0][0] as FormData;
      expect(request.open).toHaveBeenCalledWith(
        'POST',
        `${API_CONFIG.baseURL}${API_ENDPOINTS.articles.blockImage(
          'test-article',
          'test-block',
        )}`,
        true,
      );
      expect(form).toBeInstanceOf(FormData);
      expect(form.getAll('image')).toEqual([
        {
          uri: 'content://test/image',
          type: 'image/png',
          name: hasName ? 'test.png' : 'article-block-image.jpg',
        },
      ]);
      expect(form.getAll('imageAlt')).toEqual(['Test image']);
      expect(form.getAll('imageCaption')).toEqual(['Test caption']);
      expect(request.headers).toEqual({
        accept: 'application/json',
        authorization: 'Bearer test-token',
      });
      // The native transport generates multipart/form-data with its boundary.
      expect(request.headers).not.toHaveProperty('content-type');
    },
  );

  it('uses the single-file helper for article covers with the existing fallback name', async () => {
    XHR.replies.push({
      status: 400,
      body: { message: 'Test upload rejected' },
    });
    await expect(
      articlesService.uploadArticleImage('test-article', {
        uri: 'file:///test.jpg',
        type: 'image/jpeg',
      }),
    ).rejects.toMatchObject({ response: { status: 400 } });
    const form = XHR.requests[0].send.mock.calls[0][0] as FormData;
    expect(form.getAll('image')).toEqual([
      {
        uri: 'file:///test.jpg',
        type: 'image/jpeg',
        name: 'article-image.jpg',
      },
    ]);
    expect(form.getParts()).toHaveLength(1);
    expect(XHR.requests[0].open).toHaveBeenCalledWith(
      'POST',
      `${API_CONFIG.baseURL}${API_ENDPOINTS.articles.image('test-article')}`,
      true,
    );
  });
});
