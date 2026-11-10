import { z } from 'zod';

export const postFormSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres.'),
  body: z.string().trim().min(10, 'El texto debe tener al menos 10 caracteres.'),
  authorId: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, 'El autor debe ser un número entero positivo.'),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
