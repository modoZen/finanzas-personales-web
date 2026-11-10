import type { CreatePostRequest, Post, PostResponse } from '../domain/post';
import type { PostFormValues } from '../validation/post-form.schema';

export const toPost = ({ id, title, body, userId }: PostResponse): Post => ({
  id,
  title,
  body,
  authorId: userId,
});

export const toCreatePostRequest = ({
  title,
  body,
  authorId,
}: Omit<Post, 'id'>): CreatePostRequest => ({
  title,
  body,
  userId: authorId,
});

export const toNewPost = ({ title, body, authorId }: PostFormValues): Omit<Post, 'id'> => ({
  title,
  body,
  authorId: Number(authorId),
});
