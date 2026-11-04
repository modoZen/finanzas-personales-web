import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '../../../test-utils/render-with-router';
import NotFoundPage from '../NotFoundPage';

describe('NotFoundPage', () => {
  it('shows the default texts and a link to the home page', () => {
    renderWithRouter(<NotFoundPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByText('La dirección que buscas no existe.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });

  it('lets the texts and the link be overridden', () => {
    renderWithRouter(
      <NotFoundPage
        title='Sin resultados'
        message='Prueba con otra búsqueda.'
        linkLabel='Ir al listado'
        linkTo='/example'
      />,
    );

    expect(screen.getByRole('heading', { name: 'Sin resultados' })).toBeInTheDocument();
    expect(screen.getByText('Prueba con otra búsqueda.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al listado' })).toHaveAttribute('href', '/example');
    expect(screen.queryByText('Página no encontrada')).not.toBeInTheDocument();
  });
});
