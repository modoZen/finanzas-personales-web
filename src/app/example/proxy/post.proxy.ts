import { fetchJson } from '@/shared/utils/http/fetch-json';
import { httpMethod } from '@/shared/utils/http/http-method';
import type { Post, PostResponse } from '../domain/post';
import { toCreatePostRequest, toPost } from '../mappers/post.mapper';

const getAll = async (signal?: AbortSignal): Promise<Post[]> => {
  const posts = await fetchJson<PostResponse[]>('/posts?_limit=10', { signal });
  return posts.map(toPost);
};

const getById = async (id: string, signal?: AbortSignal): Promise<Post> =>
  toPost(await fetchJson<PostResponse>(`/posts/${id}`, { signal }));

const create = async (post: Omit<Post, 'id'>): Promise<Post> =>
  toPost(
    await fetchJson<PostResponse>('/posts', {
      method: httpMethod.post,
      body: toCreatePostRequest(post),
    }),
  );

export const postProxy = { getAll, getById, create } as const;
