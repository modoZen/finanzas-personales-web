import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/shared/test-utils/render-with-router';
import App from '../App';

describe('App', () => {
  // `lazy` caches the module after its first load, so this test has to run first.
  it('shows the spinner while the module loads and the module afterwards', async () => {
    renderWithRouter(<App />, { route: '/example' });

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
    expect(screen.getByRole('banner')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { level: 1, name: 'Ejemplo' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the app name and the navigation in the header', async () => {
    renderWithRouter(<App />, { route: '/example' });

    const header = screen.getByRole('banner');

    expect(within(header).getByText('Finanzas personales')).toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('link', {
        name: 'Ejemplo',
      }),
    ).toHaveAttribute('href', '/example');
    await screen.findByRole('heading', { level: 1, name: 'Ejemplo' });
  });

  it('redirects the root to the initial module', async () => {
    renderWithRouter(<App />, { route: '/' });

    expect(await screen.findByRole('heading', { level: 1, name: 'Ejemplo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ejemplo' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows the not found page with the header and the navigation on an unknown route', () => {
    renderWithRouter(<App />, { route: '/no-existe' });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
  });
});
