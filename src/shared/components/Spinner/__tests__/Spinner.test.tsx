import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Spinner from '../Spinner';

describe('Spinner', () => {
  it('is announced as a status with the default label', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
  });

  it('shows a custom label', () => {
    render(<Spinner label='Guardando…' />);

    expect(screen.getByRole('status')).toHaveTextContent('Guardando…');
    expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
  });

  it('hides the label visually but keeps it for assistive technology', () => {
    render(<Spinner />);

    expect(screen.getByText('Cargando…')).toHaveClass('sr-only');
  });

  it('spins, unless the user asks for reduced motion', () => {
    const { container } = render(<Spinner />);

    const ring = container.querySelector('[aria-hidden="true"]');

    expect(ring).toHaveClass('animate-spin', 'motion-reduce:animate-none');
  });

  it('centers the ring in its container', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveClass('flex', 'justify-center');
  });
});
