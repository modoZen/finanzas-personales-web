import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouterAndQuery } from '@/shared/test-utils/render-with-router-and-query';
import { postListMock, postMock } from '../../../mocks/post.mock';
import { postProxy } from '../../../proxy/post.proxy';
import ExamplePage from '../ExamplePage';

const renderPage = () =>
  renderWithRouterAndQuery(
    <Routes>
      <Route path='/example' element={<ExamplePage />} />
    </Routes>,
    { route: '/example' },
  );

describe('ExamplePage', () => {
  it('shows the spinner, and no list or error, while loading', () => {
    vi.spyOn(postProxy, 'getAll').mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an error, and no list or spinner, when loading fails', async () => {
    vi.spyOn(postProxy, 'getAll').mockRejectedValue(new Error('boom'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los posts.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('lists the posts, each title linking to its detail under the mounted route', async () => {
    vi.spyOn(postProxy, 'getAll').mockResolvedValue(postListMock);

    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Ejemplo' })).toBeInTheDocument();
    for (const post of postListMock) {
      expect(await screen.findByRole('link', { name: post.title })).toHaveAttribute(
        'href',
        `/example/detail/${post.id}`,
      );
    }
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('creates a post and says the example API does not store it', async () => {
    vi.spyOn(postProxy, 'getAll').mockResolvedValue(postListMock);
    const create = vi.spyOn(postProxy, 'create').mockResolvedValue({ ...postMock, id: 101 });
    renderPage();
    await screen.findByRole('link', { name: postMock.title });

    await userEvent.click(screen.getByRole('button', { name: 'Crear post' }));

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ authorId: 1 }));
    expect(await screen.findByText(/Post creado con id 101/)).toHaveTextContent(
      'La API de ejemplo no lo guarda',
    );
  });

  it('shows an error and keeps the list when the creation fails', async () => {
    vi.spyOn(postProxy, 'getAll').mockResolvedValue(postListMock);
    vi.spyOn(postProxy, 'create').mockRejectedValue(new Error('boom'));
    renderPage();
    await screen.findByRole('link', { name: postMock.title });

    await userEvent.click(screen.getByRole('button', { name: 'Crear post' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo crear el post.');
    expect(screen.getByRole('link', { name: postMock.title })).toBeInTheDocument();
  });
});
