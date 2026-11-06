import { describe, expect, it } from 'vitest';
import { httpMethod } from '../http-method';

describe('httpMethod', () => {
  it('has the standard HTTP verbs', () => {
    expect(httpMethod).toEqual({
      get: 'GET',
      post: 'POST',
      put: 'PUT',
      patch: 'PATCH',
      delete: 'DELETE',
    });
  });
});
