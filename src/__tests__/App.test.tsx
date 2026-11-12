import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/shared/test-utils/render-with-router';
import App from '../App';

const moduleState = vi.hoisted(() => ({ shouldThrow: false }));

vi.mock('@/app/example/ExampleRouter', () => {
  const ExampleRouterStub: FC = () => {
    if (moduleState.shouldThrow) {
      throw new Error('boom');
    }

    return <p>Example module</p>;
  };

  return { default: ExampleRouterStub };
});

describe('App', () => {
  beforeEach(() => {
    moduleState.shouldThrow = false;
  });

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

  describe('when the module fails to render', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('shows the fallback with the header and the navigation still visible', async () => {
      moduleState.shouldThrow = true;
      renderWithRouter(<App />, { route: '/example' });

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Recargar página' })).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
      expect(screen.queryByText('Example module')).not.toBeInTheDocument();
    });

    it('removes the fallback when a header link leads to another route', async () => {
      const user = userEvent.setup();
      moduleState.shouldThrow = true;
      renderWithRouter(<App />, { route: '/example/detalle' });
      expect(await screen.findByRole('alert')).toBeInTheDocument();

      moduleState.shouldThrow = false;
      await user.click(screen.getByRole('link', { name: 'Ejemplo' }));

      expect(await screen.findByText('Example module')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('keeps the fallback when a header link leads to the current route', async () => {
      const user = userEvent.setup();
      moduleState.shouldThrow = true;
      renderWithRouter(<App />, { route: '/example' });
      expect(await screen.findByRole('alert')).toBeInTheDocument();

      moduleState.shouldThrow = false;
      await user.click(screen.getByRole('link', { name: 'Ejemplo' }));

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText('Example module')).not.toBeInTheDocument();
    });
  });
});
