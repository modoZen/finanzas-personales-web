import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('is announced as an alert with the message', () => {
    render(<ErrorMessage message='No se pudo cargar.' />);

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar.');
  });

  it('shows the default title', () => {
    render(<ErrorMessage message='No se pudo cargar.' />);

    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal');
  });

  it('shows a custom title instead of the default one', () => {
    render(<ErrorMessage title='Error al guardar' message='Inténtalo de nuevo.' />);

    expect(screen.getByRole('alert')).toHaveTextContent('Error al guardar');
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();
  });

  it('has no buttons', () => {
    render(<ErrorMessage message='No se pudo cargar.' />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
