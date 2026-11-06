import { HttpError } from './http-error';
import { httpMethod, type HttpMethod } from './http-method';
import { httpStatus } from './http-status';

interface FetchJsonOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

const absoluteUrlPattern = /^https?:\/\//;

const resolveUrl = (path: string): string => {
  if (absoluteUrlPattern.test(path)) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_API_URL;
  if (!baseUrl) {
    throw new Error(`VITE_API_URL is not defined: cannot resolve the relative path "${path}"`);
  }

  return `${baseUrl}${path}`;
};

const parseErrorBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const fetchJson = async <T>(
  path: string,
  { method = httpMethod.get, body, signal }: FetchJsonOptions = {},
): Promise<T> => {
  const url = resolveUrl(path);
  const hasBody = body !== undefined;

  const response = await fetch(url, {
    method,
    signal,
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new HttpError({
      status: response.status,
      statusText: response.statusText,
      method,
      url,
      body: await parseErrorBody(response),
    });
  }

  if (response.status === httpStatus.noContent) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
