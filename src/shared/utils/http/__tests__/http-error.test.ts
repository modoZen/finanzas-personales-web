import { describe, expect, it } from 'vitest';
import { HttpError } from '../http-error';
import { httpMethod } from '../http-method';

const params = {
  status: 404,
  statusText: 'Not Found',
  method: httpMethod.get,
  url: 'https://api.test/posts/9999',
  body: { message: 'missing' },
};

describe('HttpError', () => {
  it('is an Error and an HttpError', () => {
    const error = new HttpError(params);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
  });

  it('keeps status, statusText, method, url, body and name', () => {
    const error = new HttpError(params);

    expect(error.status).toBe(404);
    expect(error.statusText).toBe('Not Found');
    expect(error.method).toBe('GET');
    expect(error.url).toBe('https://api.test/posts/9999');
    expect(error.body).toEqual({ message: 'missing' });
    expect(error.name).toBe('HttpError');
  });

  it('builds the message with method, url and status', () => {
    expect(new HttpError(params).message).toBe(
      'GET https://api.test/posts/9999 responded with 404 Not Found',
    );
  });

  it('omits the status text from the message when it is empty', () => {
    expect(new HttpError({ ...params, statusText: '' }).message).toBe(
      'GET https://api.test/posts/9999 responded with 404',
    );
  });
});
