import type { FC } from 'react';
import { generatePath, Link } from 'react-router';
import { exampleRoutes } from '../../example.routes';

const ids = ['1', '2', '3'];

const ExamplePage: FC = () => (
  <section className='flex flex-col gap-4'>
    <h1 className='text-2xl font-bold'>Ejemplo</h1>
    <ul className='flex flex-col gap-2'>
      {ids.map((id) => (
        <li key={id}>
          <Link
            to={generatePath(exampleRoutes.detail, { id })}
            className='text-sky-600 underline hover:text-sky-700'
          >
            Ver detalle {id}
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

export default ExamplePage;
