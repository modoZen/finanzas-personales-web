import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderHookWithQuery } from '@/shared/test-utils/render-with-query';
import { postListMock, postMock } from '../../../mocks/post.mock';
import { postProxy } from '../../../proxy/post.proxy';
import { usePosts } from '../../usePosts/usePosts';
import { useCreatePost } from '../useCreatePost';

const newPost = { title: postMock.title, body: postMock.body, authorId: postMock.authorId };

const renderBoth = () =>
  renderHookWithQuery(() => ({ posts: usePosts(), create: useCreatePost() }));

describe('useCreatePost', () => {
  it('creates the post through the proxy', async () => {
    vi.spyOn(postProxy, 'getAll').mockResolvedValue(postListMock);
    const create = vi.spyOn(postProxy, 'create').mockResolvedValue({ ...postMock, id: 101 });
    const { result } = renderBoth();
    await waitFor(() => expect(result.current.posts.isSuccess).toBe(true));

    await act(() => result.current.create.mutateAsync(newPost));

    expect(create).toHaveBeenCalledWith(newPost);
    await waitFor(() => expect(result.current.create.data).toEqual({ ...postMock, id: 101 }));
  });

  it('requests the list again after a successful creation', async () => {
    const getAll = vi.spyOn(postProxy, 'getAll').mockResolvedValue(postListMock);
    vi.spyOn(postProxy, 'create').mockResolvedValue({ ...postMock, id: 101 });
    const { result } = renderBoth();
    await waitFor(() => expect(result.current.posts.isSuccess).toBe(true));
    expect(getAll).toHaveBeenCalledTimes(1);

    await act(() => result.current.create.mutateAsync(newPost));

    await waitFor(() => expect(getAll).toHaveBeenCalledTimes(2));
  });

  it('does not request the list again when the creation fails', async () => {
    const getAll = vi.spyOn(postProxy, 'getAll').mockResolvedValue(postListMock);
    vi.spyOn(postProxy, 'create').mockRejectedValue(new Error('boom'));
    const { result } = renderBoth();
    await waitFor(() => expect(result.current.posts.isSuccess).toBe(true));

    await act(() => result.current.create.mutateAsync(newPost).catch(() => undefined));

    await waitFor(() => expect(result.current.create.isError).toBe(true));
    expect(getAll).toHaveBeenCalledTimes(1);
    expect(result.current.posts.data).toEqual(postListMock);
  });
});
