import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { Post } from '../../domain/post';
import { postProxy } from '../../proxy/post.proxy';

export const useCreatePost = (): UseMutationResult<Post, Error, Omit<Post, 'id'>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: Omit<Post, 'id'>) => postProxy.create(post),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });
};
