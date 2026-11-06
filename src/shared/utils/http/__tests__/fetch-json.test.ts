import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchJson } from '../fetch-json';
import { HttpError } from '../http-error';
import { httpMethod } from '../http-method';

const baseUrl = 'https://api.test';

const jsonResponse = (data: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(data), init);

describe('fetchJson', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('VITE_API_URL', baseUrl);
  });

  it('joins a relative path to VITE_API_URL', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await fetchJson('/posts');

    expect(fetchMock.mock.calls[0][0]).toBe(`${baseUrl}/posts`);
  });

  it('uses an absolute path as is', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await fetchJson('https://other.test/posts');

    expect(fetchMock.mock.calls[0][0]).toBe('https://other.test/posts');
  });

  it('fails without calling fetch when VITE_API_URL is missing', async () => {
    vi.stubEnv('VITE_API_URL', '');

    await expect(fetchJson('/posts')).rejects.toThrow('VITE_API_URL');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses GET by default', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await fetchJson('/posts');

    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
  });

  it('returns the parsed JSON body', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }));

    await expect(fetchJson<{ id: number }>('/posts/1')).resolves.toEqual({ id: 1 });
  });

  it('serializes the body and sets Content-Type only when there is a body', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 101 }, { status: 201 }));

    await fetchJson('/posts', { method: httpMethod.post, body: { title: 'a' } });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"title":"a"}');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('sends no body and no Content-Type without a body', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await fetchJson('/posts');

    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBeUndefined();
    expect(init.headers).toBeUndefined();
  });

  it('passes the signal to fetch', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    const controller = new AbortController();

    await fetchJson('/posts', { signal: controller.signal });

    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('returns undefined on a 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(fetchJson('/posts/1', { method: httpMethod.delete })).resolves.toBeUndefined();
  });

  it('throws an HttpError with the request data and the parsed JSON body', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: 'missing' }, { status: 404, statusText: 'Not Found' }),
    );

    const error = await fetchJson('/posts/9999').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      status: 404,
      statusText: 'Not Found',
      method: 'GET',
      url: `${baseUrl}/posts/9999`,
      body: { message: 'missing' },
    });
  });

  it('keeps a non-JSON error body as text', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));

    const error = await fetchJson('/posts').catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 500, body: 'boom' });
  });

  it('leaves the error body undefined when it is empty', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    const error = await fetchJson('/posts').catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 404, body: undefined });
  });

  it('lets network failures through', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetchMock.mockRejectedValue(networkError);

    await expect(fetchJson('/posts')).rejects.toBe(networkError);
  });
});
