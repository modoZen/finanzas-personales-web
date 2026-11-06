import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Post } from '../../domain/post';
import { postProxy } from '../../proxy/post.proxy';

export const usePosts = (): UseQueryResult<Post[], Error> =>
  useQuery({
    queryKey: ['posts', 'list'],
    queryFn: ({ signal }) => postProxy.getAll(signal),
  });
