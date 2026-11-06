import type { CreatePostRequest, Post, PostResponse } from '../domain/post';

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
