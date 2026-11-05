import { screen, within } from '@testing-library/react';
import type { FC } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/shared/test-utils/render-with-router';
import App from '../App';

vi.mock('@/app/example/ExampleRouter', () => {
  const ExampleRouterStub: FC = () => <p>Example module</p>;

  return { default: ExampleRouterStub };
});

describe('App', () => {
  // Must run first: lazy caches the module after its first load, so later tests never see the fallback.
  it('shows the spinner while the module loads and the module afterwards', async () => {
    renderWithRouter(<App />, { route: '/example' });

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
    expect(screen.getByRole('banner')).toBeInTheDocument();

    expect(await screen.findByText('Example module')).toBeInTheDocument();
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
    await screen.findByText('Example module');
  });

  it('redirects the root to the initial module', async () => {
    renderWithRouter(<App />, { route: '/' });

    expect(await screen.findByText('Example module')).toBeInTheDocument();
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
