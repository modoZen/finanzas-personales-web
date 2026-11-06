import type { FC } from 'react';
import { generatePath, Link } from 'react-router';
import ErrorMessage from '@/shared/components/ErrorMessage/ErrorMessage';
import Spinner from '@/shared/components/Spinner/Spinner';
import { exampleRoutes } from '../../example.routes';
import { useCreatePost } from '../../hooks/useCreatePost/useCreatePost';
import { usePosts } from '../../hooks/usePosts/usePosts';

const newPost = {
  title: 'Post de ejemplo',
  body: 'Creado desde la página de ejemplo.',
  authorId: 1,
};

const ExamplePage: FC = () => {
  const { data: posts, isPending, isError } = usePosts();
  const createPost = useCreatePost();

  return (
    <section className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>Ejemplo</h1>
      {isPending && <Spinner />}
      {isError && <ErrorMessage message='No se pudieron cargar los posts.' />}
      {posts && (
        <ul className='flex flex-col gap-2'>
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                to={generatePath(exampleRoutes.detail, { id: String(post.id) })}
                className='text-sky-600 underline hover:text-sky-700'
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className='flex flex-col items-start gap-2'>
        <button
          type='button'
          disabled={createPost.isPending}
          onClick={() => createPost.mutate(newPost)}
          className='rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50'
        >
          Crear post
        </button>
        {createPost.isSuccess && (
          <p>
            Post creado con id {createPost.data.id}. La API de ejemplo no lo guarda, así que no
            aparece en la lista.
          </p>
        )}
        {createPost.isError && <ErrorMessage message='No se pudo crear el post.' />}
      </div>
    </section>
  );
};

export default ExamplePage;
