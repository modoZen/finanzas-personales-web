import type { FC } from 'react';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

const reloadPage = (): void => {
  window.location.reload();
};

const ErrorFallback: FC = () => (
  <div className='flex flex-col items-start gap-4'>
    <ErrorMessage message='Ocurrió un error al mostrar esta página. Recarga la página para volver a intentarlo.' />
    <button
      type='button'
      onClick={reloadPage}
      className='rounded-md bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700'
    >
      Recargar página
    </button>
  </div>
);

export default ErrorFallback;
