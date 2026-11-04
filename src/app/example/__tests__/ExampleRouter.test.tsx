import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/shared/test-utils/render-with-router';
import ExampleRouter from '../ExampleRouter';

const CurrentPath: FC = () => <p data-testid='current-path'>{useLocation().pathname}</p>;

const renderModule = (route: string) =>
  renderWithRouter(
    <>
      <CurrentPath />
      <Routes>
        <Route path='/example/*' element={<ExampleRouter />} />
      </Routes>
    </>,
    { route },
  );

describe('ExampleRouter', () => {
  it('shows the index page on the base route of the module', () => {
    renderModule('/example');

    expect(screen.getByRole('heading', { level: 1, name: 'Ejemplo' })).toBeInTheDocument();
  });

  it('navigates from the index to a detail and back', async () => {
    const user = userEvent.setup();
    renderModule('/example');

    await user.click(screen.getByRole('link', { name: 'Ver detalle 2' }));

    expect(screen.getByTestId('current-path')).toHaveTextContent('/example/detail/2');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Detalle del elemento 2' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Volver al listado' }));

    expect(screen.getByTestId('current-path')).toHaveTextContent(/^\/example$/);
    expect(screen.getByRole('heading', { level: 1, name: 'Ejemplo' })).toBeInTheDocument();
  });

  it('opens a detail directly from its URL', () => {
    renderModule('/example/detail/3');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Detalle del elemento 3' }),
    ).toBeInTheDocument();
  });
});
