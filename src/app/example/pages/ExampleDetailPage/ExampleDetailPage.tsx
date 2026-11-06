import type { FC } from 'react';
import { Link, useParams } from 'react-router';
import ErrorMessage from '@/shared/components/ErrorMessage/ErrorMessage';
import Spinner from '@/shared/components/Spinner/Spinner';
import { HttpError } from '@/shared/utils/http/http-error';
import { httpStatus } from '@/shared/utils/http/http-status';
import { usePost } from '../../hooks/usePost/usePost';

const ExampleDetailPage: FC = () => {
  const { id = '' } = useParams();
  const { data: post, isPending, error } = usePost(id);

  const errorMessage =
    error instanceof HttpError && error.status === httpStatus.notFound
      ? 'El post no existe.'
      : 'No se pudo cargar el post.';

  return (
    <section className='flex flex-col gap-4'>
      {isPending && <Spinner />}
      {error && <ErrorMessage message={errorMessage} />}
      {post && (
        <>
          <h1 className='text-2xl font-bold'>{post.title}</h1>
          <p>{post.body}</p>
        </>
      )}
      <Link to='..' className='text-sky-600 underline hover:text-sky-700'>
        Volver al listado
      </Link>
    </section>
  );
};

export default ExampleDetailPage;
