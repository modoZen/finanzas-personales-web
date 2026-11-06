import { describe, expect, it } from 'vitest';
import { postMock, postResponseMock } from '../../mocks/post.mock';
import { toCreatePostRequest, toPost } from '../post.mapper';

describe('post mapper', () => {
  it('maps a response to a Post, turning userId into authorId', () => {
    expect(toPost(postResponseMock)).toEqual(postMock);
  });

  it('maps a new Post to a create request, turning authorId into userId', () => {
    const newPost = { title: postMock.title, body: postMock.body, authorId: postMock.authorId };

    expect(toCreatePostRequest(newPost)).toEqual({
      title: postMock.title,
      body: postMock.body,
      userId: postMock.authorId,
    });
  });
});
