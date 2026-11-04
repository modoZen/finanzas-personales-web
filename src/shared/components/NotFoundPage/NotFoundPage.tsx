import type { FC } from 'react';
import { Link } from 'react-router';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  linkLabel?: string;
  linkTo?: string;
}

const NotFoundPage: FC<NotFoundPageProps> = ({
  title = 'Página no encontrada',
  message = 'La dirección que buscas no existe.',
  linkLabel = 'Volver al inicio',
  linkTo = '/',
}) => (
  <section className='flex flex-col items-center gap-4 py-16 text-center'>
    <h1 className='text-3xl font-bold'>{title}</h1>
    <p className='text-slate-600'>{message}</p>
    <Link to={linkTo} className='text-sky-600 underline hover:text-sky-700'>
      {linkLabel}
    </Link>
  </section>
);

export default NotFoundPage;
