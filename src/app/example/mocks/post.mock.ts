import type { Post, PostResponse } from '../domain/post';

export const postResponseMock: PostResponse = {
  id: 1,
  userId: 1,
  title: 'sunt aut facere repellat provident',
  body: 'quia et suscipit suscipit recusandae consequuntur',
};

export const postResponseListMock: PostResponse[] = [
  postResponseMock,
  {
    id: 2,
    userId: 1,
    title: 'qui est esse',
    body: 'est rerum tempore vitae sequi sint nihil',
  },
];

export const postMock: Post = {
  id: 1,
  authorId: 1,
  title: 'sunt aut facere repellat provident',
  body: 'quia et suscipit suscipit recusandae consequuntur',
};

export const postListMock: Post[] = [
  postMock,
  {
    id: 2,
    authorId: 1,
    title: 'qui est esse',
    body: 'est rerum tempore vitae sequi sint nihil',
  },
];
