import type { HttpMethod } from './http-method';

interface HttpErrorParams {
  status: number;
  statusText: string;
  method: HttpMethod;
  url: string;
  body: unknown;
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  method: HttpMethod;
  url: string;
  body: unknown;

  constructor({ status, statusText, method, url, body }: HttpErrorParams) {
    const state = statusText ? `${status} ${statusText}` : `${status}`;
    super(`${method} ${url} responded with ${state}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.method = method;
    this.url = url;
    this.body = body;
  }
}
