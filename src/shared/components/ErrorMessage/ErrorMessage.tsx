import type { FC } from 'react';

interface ErrorMessageProps {
  message: string;
  title?: string;
}

const ErrorMessage: FC<ErrorMessageProps> = ({ message, title = 'Algo salió mal' }) => (
  <div role='alert' className='rounded-md border border-red-200 bg-red-50 p-4 text-red-800'>
    <p className='font-semibold'>{title}</p>
    <p>{message}</p>
  </div>
);

export default ErrorMessage;
