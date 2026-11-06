export const httpMethod = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE',
} as const;

export type HttpMethod = (typeof httpMethod)[keyof typeof httpMethod];
