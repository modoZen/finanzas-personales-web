import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/shared/test-utils/render-with-router';
import { exampleRoutes } from '../../../example.routes';
import ExampleDetailPage from '../ExampleDetailPage';

const renderDetail = () =>
  renderWithRouter(
    <Routes>
      <Route
        path='/example/*'
        element={
          <Routes>
            <Route path={exampleRoutes.detail} element={<ExampleDetailPage />} />
          </Routes>
        }
      />
    </Routes>,
    { route: '/example/detail/2' },
  );

describe('ExampleDetailPage', () => {
  it('shows the id received in the route', () => {
    renderDetail();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Detalle del elemento 2' }),
    ).toBeInTheDocument();
  });

  it('links back to the index of the module it is mounted on', () => {
    renderDetail();

    expect(screen.getByRole('link', { name: 'Volver al listado' })).toHaveAttribute(
      'href',
      '/example',
    );
  });
});
