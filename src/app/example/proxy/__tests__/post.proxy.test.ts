import { fetchJson } from '@/shared/utils/http/fetch-json';
import { describe, expect, it, vi } from 'vitest';
import {
  postListMock,
  postMock,
  postResponseListMock,
  postResponseMock,
} from '../../mocks/post.mock';
import { postProxy } from '../post.proxy';

vi.mock('@/shared/utils/http/fetch-json');

describe('postProxy', () => {
  describe('getAll', () => {
    it('requests the list with a limit and maps userId to authorId', async () => {
      vi.mocked(fetchJson).mockResolvedValue(postResponseListMock);
      const { signal } = new AbortController();

      const posts = await postProxy.getAll(signal);

      expect(fetchJson).toHaveBeenCalledWith('/posts?_limit=10', { signal });
      expect(posts).toEqual(postListMock);
    });
  });

  describe('getById', () => {
    it('requests the post by id and maps userId to authorId', async () => {
      vi.mocked(fetchJson).mockResolvedValue(postResponseMock);
      const { signal } = new AbortController();

      const post = await postProxy.getById('1', signal);

      expect(fetchJson).toHaveBeenCalledWith('/posts/1', { signal });
      expect(post).toEqual(postMock);
    });
  });

  describe('create', () => {
    it('posts the mapped body (authorId as userId) and maps the echo back', async () => {
      vi.mocked(fetchJson).mockResolvedValue({ ...postResponseMock, id: 101 });
      const newPost = { title: postMock.title, body: postMock.body, authorId: postMock.authorId };

      const created = await postProxy.create(newPost);

      expect(fetchJson).toHaveBeenCalledWith('/posts', {
        method: 'POST',
        body: { title: postMock.title, body: postMock.body, userId: postMock.authorId },
      });
      expect(created).toEqual({ ...postMock, id: 101 });
    });
  });
});
