import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouterAndQuery } from '@/shared/test-utils/render-with-router-and-query';
import { HttpError } from '@/shared/utils/http/http-error';
import { httpMethod } from '@/shared/utils/http/http-method';
import { httpStatus } from '@/shared/utils/http/http-status';
import { exampleRoutes } from '../../../example.routes';
import { postMock } from '../../../mocks/post.mock';
import { postProxy } from '../../../proxy/post.proxy';
import ExampleDetailPage from '../ExampleDetailPage';

const renderDetail = () =>
  renderWithRouterAndQuery(
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

const httpError = (status: number): HttpError =>
  new HttpError({
    status,
    statusText: '',
    method: httpMethod.get,
    url: 'https://api.test/posts/2',
    body: undefined,
  });

describe('ExampleDetailPage', () => {
  it('shows the spinner, and no post or error, while loading', () => {
    vi.spyOn(postProxy, 'getById').mockReturnValue(new Promise(() => {}));

    renderDetail();

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('asks for the post in the route and shows its title and body', async () => {
    const getById = vi.spyOn(postProxy, 'getById').mockResolvedValue(postMock);

    renderDetail();

    expect(await screen.findByRole('heading', { level: 1, name: postMock.title })).toBeVisible();
    expect(screen.getByText(postMock.body)).toBeInTheDocument();
    expect(getById).toHaveBeenCalledWith('2', expect.any(AbortSignal));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('says the post does not exist on a 404', async () => {
    vi.spyOn(postProxy, 'getById').mockRejectedValue(httpError(httpStatus.notFound));

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent('El post no existe.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a generic message on any other error', async () => {
    vi.spyOn(postProxy, 'getById').mockRejectedValue(httpError(httpStatus.internalServerError));

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el post.');
    expect(screen.queryByText('El post no existe.')).not.toBeInTheDocument();
  });

  it('links back to the index of the module it is mounted on', () => {
    vi.spyOn(postProxy, 'getById').mockReturnValue(new Promise(() => {}));

    renderDetail();

    expect(screen.getByRole('link', { name: 'Volver al listado' })).toHaveAttribute(
      'href',
      '/example',
    );
  });
});
