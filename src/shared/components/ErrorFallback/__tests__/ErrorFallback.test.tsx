import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorFallback from '../ErrorFallback';

describe('ErrorFallback', () => {
  it('is announced as an alert with a fixed message', () => {
    render(<ErrorFallback />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ocurrió un error al mostrar esta página. Recarga la página para volver a intentarlo.',
    );
  });

  it('offers a single button to reload the page', () => {
    render(<ErrorFallback />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Recargar página' })).toBeInTheDocument();
  });

  it('reloads the page once when the button is pressed', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    // jsdom does not allow spying on window.location.reload, so the whole location is replaced.
    vi.stubGlobal('location', { ...window.location, reload });
    render(<ErrorFallback />);

    await user.click(screen.getByRole('button', { name: 'Recargar página' }));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
