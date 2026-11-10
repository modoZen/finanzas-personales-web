import { describe, expect, it } from 'vitest';
import { postFormSchema, type PostFormValues } from '../post-form.schema';

const titleMessage = 'El título debe tener al menos 3 caracteres.';
const bodyMessage = 'El texto debe tener al menos 10 caracteres.';
const authorMessage = 'El autor debe ser un número entero positivo.';

const valid: PostFormValues = {
  title: 'Título',
  body: 'Texto suficientemente largo',
  authorId: '1',
};

const messagesFor = (overrides: Partial<PostFormValues>): Record<string, string> => {
  const result = postFormSchema.safeParse({ ...valid, ...overrides });
  if (result.success) {
    return {};
  }
  return Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
};

describe('postFormSchema', () => {
  it('accepts valid values', () => {
    expect(postFormSchema.safeParse(valid)).toMatchObject({ success: true, data: valid });
  });

  it('trims the spaces around every field', () => {
    const result = postFormSchema.parse({
      title: '  abc  ',
      body: '  0123456789  ',
      authorId: ' 1 ',
    });

    expect(result).toEqual({ title: 'abc', body: '0123456789', authorId: '1' });
  });

  describe('title', () => {
    it.each(['', '   ', 'ab', '  ab  '])('rejects %j', (title) => {
      expect(messagesFor({ title })).toEqual({ title: titleMessage });
    });

    it('accepts exactly the minimum length', () => {
      expect(messagesFor({ title: 'abc' })).toEqual({});
    });
  });

  describe('body', () => {
    it.each(['', '          ', '123456789', '  123456789  '])('rejects %j', (body) => {
      expect(messagesFor({ body })).toEqual({ body: bodyMessage });
    });

    it('accepts exactly the minimum length', () => {
      expect(messagesFor({ body: '0123456789' })).toEqual({});
    });
  });

  describe('authorId', () => {
    it.each(['', '   ', 'a', '1a', '1 2', '1.5', '1,5', '0', ' 0 ', '-1', '01'])(
      'rejects %j',
      (authorId) => {
        expect(messagesFor({ authorId })).toEqual({ authorId: authorMessage });
      },
    );

    it.each(['1', '7', '10', '123', ' 7 '])('accepts %j', (authorId) => {
      expect(messagesFor({ authorId })).toEqual({});
    });
  });

  it('reports every invalid field at once', () => {
    expect(messagesFor({ title: '', body: '', authorId: '' })).toEqual({
      title: titleMessage,
      body: bodyMessage,
      authorId: authorMessage,
    });
  });
});
