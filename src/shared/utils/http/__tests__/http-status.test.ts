import { describe, expect, it } from 'vitest';
import { httpStatus } from '../http-status';

describe('httpStatus', () => {
  it('has the common status codes', () => {
    expect(httpStatus).toEqual({
      ok: 200,
      created: 201,
      noContent: 204,
      badRequest: 400,
      unauthorized: 401,
      forbidden: 403,
      notFound: 404,
      conflict: 409,
      unprocessableEntity: 422,
      internalServerError: 500,
    });
  });
});
