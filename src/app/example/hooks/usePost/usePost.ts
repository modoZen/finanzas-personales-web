import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Post } from '../../domain/post';
import { postProxy } from '../../proxy/post.proxy';

export const usePost = (id: string): UseQueryResult<Post, Error> =>
  useQuery({
    queryKey: ['posts', 'detail', id],
    queryFn: ({ signal }) => postProxy.getById(id, signal),
  });
