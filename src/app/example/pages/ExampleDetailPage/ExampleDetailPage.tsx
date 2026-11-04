import type { FC } from 'react';
import { Link, useParams } from 'react-router';

const ExampleDetailPage: FC = () => {
  const { id } = useParams();

  return (
    <section className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>Detalle del elemento {id}</h1>
      <Link to='..' className='text-sky-600 underline hover:text-sky-700'>
        Volver al listado
      </Link>
    </section>
  );
};

export default ExampleDetailPage;
