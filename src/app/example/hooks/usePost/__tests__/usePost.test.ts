import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/shared/utils/http/http-error';
import { httpMethod } from '@/shared/utils/http/http-method';
import { renderHookWithQuery } from '@/shared/test-utils/render-with-query';
import { postMock } from '../../../mocks/post.mock';
import { postProxy } from '../../../proxy/post.proxy';
import { usePost } from '../usePost';

describe('usePost', () => {
  it('is pending while the post loads', () => {
    vi.spyOn(postProxy, 'getById').mockReturnValue(new Promise(() => {}));

    const { result } = renderHookWithQuery(() => usePost('1'));

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns the post asked for by id', async () => {
    const getById = vi.spyOn(postProxy, 'getById').mockResolvedValue(postMock);

    const { result } = renderHookWithQuery(() => usePost('1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(postMock);
    expect(getById).toHaveBeenCalledWith('1', expect.any(AbortSignal));
  });

  it('returns the error when the request fails', async () => {
    const error = new Error('boom');
    vi.spyOn(postProxy, 'getById').mockRejectedValue(error);

    const { result } = renderHookWithQuery(() => usePost('1'));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it('exposes an HttpError 404 as the error', async () => {
    const notFound = new HttpError({
      status: 404,
      statusText: 'Not Found',
      method: httpMethod.get,
      url: 'https://api.test/posts/9999',
      body: {},
    });
    vi.spyOn(postProxy, 'getById').mockRejectedValue(notFound);

    const { result } = renderHookWithQuery(() => usePost('9999'));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(HttpError);
    expect((result.current.error as HttpError).status).toBe(404);
  });
});
