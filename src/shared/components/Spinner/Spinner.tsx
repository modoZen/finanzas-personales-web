import type { FC } from 'react';

interface SpinnerProps {
  label?: string;
}

const Spinner: FC<SpinnerProps> = ({ label = 'Cargando…' }) => (
  <div role='status' className='flex justify-center py-16'>
    <div
      aria-hidden='true'
      className='h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500 motion-reduce:animate-none'
    />
    <span className='sr-only'>{label}</span>
  </div>
);

export default Spinner;
