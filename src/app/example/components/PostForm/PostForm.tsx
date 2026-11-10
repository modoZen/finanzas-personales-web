import { zodResolver } from '@hookform/resolvers/zod';
import { useId, type FC } from 'react';
import { useForm } from 'react-hook-form';
import type { Post } from '../../domain/post';
import { toNewPost } from '../../mappers/post.mapper';
import { postFormSchema } from '../../validation/post-form.schema';

interface PostFormProps {
  onSubmit: (post: Omit<Post, 'id'>) => void;
  onCancel: () => void;
  isPending: boolean;
}

const PostForm: FC<PostFormProps> = ({ onSubmit, onCancel, isPending }) => {
  const formId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postFormSchema),
    defaultValues: { title: '', body: '', authorId: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(toNewPost(values)))}
      className='flex flex-col gap-4'
    >
      <div className='flex flex-col gap-1'>
        <label htmlFor={`${formId}-title`} className='font-medium'>
          Título
        </label>
        <input
          id={`${formId}-title`}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? `${formId}-title-error` : undefined}
          className='rounded-md border border-slate-300 px-3 py-2'
          {...register('title')}
        />
        {errors.title && (
          <p id={`${formId}-title-error`} className='text-sm text-red-700'>
            {errors.title.message}
          </p>
        )}
      </div>

      <div className='flex flex-col gap-1'>
        <label htmlFor={`${formId}-body`} className='font-medium'>
          Texto
        </label>
        <textarea
          id={`${formId}-body`}
          rows={4}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? `${formId}-body-error` : undefined}
          className='rounded-md border border-slate-300 px-3 py-2'
          {...register('body')}
        />
        {errors.body && (
          <p id={`${formId}-body-error`} className='text-sm text-red-700'>
            {errors.body.message}
          </p>
        )}
      </div>

      <div className='flex flex-col gap-1'>
        <label htmlFor={`${formId}-authorId`} className='font-medium'>
          Autor
        </label>
        <input
          id={`${formId}-authorId`}
          aria-invalid={errors.authorId ? true : undefined}
          aria-describedby={errors.authorId ? `${formId}-authorId-error` : undefined}
          className='rounded-md border border-slate-300 px-3 py-2'
          {...register('authorId')}
        />
        {errors.authorId && (
          <p id={`${formId}-authorId-error`} className='text-sm text-red-700'>
            {errors.authorId.message}
          </p>
        )}
      </div>

      <div className='flex gap-2'>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50'
        >
          Crear post
        </button>
        <button
          type='button'
          disabled={isPending}
          onClick={onCancel}
          className='rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100 disabled:opacity-50'
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default PostForm;
