import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderHookWithQuery } from '@/shared/test-utils/render-with-query';
import { postListMock } from '../../../mocks/post.mock';
import { postProxy } from '../../../proxy/post.proxy';
import { usePosts } from '../usePosts';

describe('usePosts', () => {
  it('is pending while the posts load', () => {
    vi.spyOn(postProxy, 'getAll').mockReturnValue(new Promise(() => {}));

    const { result } = renderHookWithQuery(usePosts);

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns the posts', async () => {
    vi.spyOn(postProxy, 'getAll').mockResolvedValue(postListMock);

    const { result } = renderHookWithQuery(usePosts);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(postListMock);
  });

  it('returns the error when the request fails', async () => {
    const error = new Error('boom');
    vi.spyOn(postProxy, 'getAll').mockRejectedValue(error);

    const { result } = renderHookWithQuery(usePosts);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
