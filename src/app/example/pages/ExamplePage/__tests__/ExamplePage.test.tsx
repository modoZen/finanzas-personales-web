import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/shared/test-utils/render-with-router';
import ExamplePage from '../ExamplePage';

describe('ExamplePage', () => {
  it('links every item to its detail under the route it is mounted on', () => {
    renderWithRouter(
      <Routes>
        <Route path='/example' element={<ExamplePage />} />
      </Routes>,
      { route: '/example' },
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Ejemplo' })).toBeInTheDocument();
    [1, 2, 3].forEach((id) => {
      expect(screen.getByRole('link', { name: `Ver detalle ${id}` })).toHaveAttribute(
        'href',
        `/example/detail/${id}`,
      );
    });
  });
});
