import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
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

const newPostButton = () => screen.getByRole('button', { name: 'Nuevo post' });
const submitButton = () => screen.getByRole('button', { name: 'Crear post' });
const isFormShown = (): boolean => screen.queryByLabelText('Título') !== null;

const openForm = (user: UserEvent) => user.click(newPostButton());

const fillForm = async (user: UserEvent): Promise<void> => {
  await user.type(screen.getByLabelText('Título'), 'Un título');
  await user.type(screen.getByLabelText('Texto'), 'Un texto largo');
  await user.type(screen.getByLabelText('Autor'), '3');
};

const renderWithPosts = async () => {
  vi.spyOn(postProxy, 'getAll').mockResolvedValue(postListMock);
  renderPage();
  await screen.findByRole('link', { name: postMock.title });
};

describe('ExamplePage', () => {
  describe('list', () => {
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

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los posts.',
      );
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
  });

  describe('new post form', () => {
    it('starts closed, with only the "Nuevo post" button', async () => {
      await renderWithPosts();

      expect(newPostButton()).toBeInTheDocument();
      expect(isFormShown()).toBe(false);
    });

    it('opens the form and hides the "Nuevo post" button', async () => {
      const user = userEvent.setup();
      await renderWithPosts();

      await openForm(user);

      expect(isFormShown()).toBe(true);
      expect(screen.queryByRole('button', { name: 'Nuevo post' })).not.toBeInTheDocument();
    });

    it('closes the form and shows "Nuevo post" again when cancelling, without creating', async () => {
      const user = userEvent.setup();
      await renderWithPosts();
      const create = vi.spyOn(postProxy, 'create');
      await openForm(user);
      await fillForm(user);

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(isFormShown()).toBe(false);
      expect(newPostButton()).toBeInTheDocument();
      expect(create).not.toHaveBeenCalled();
    });

    it('does not create a post while the form is invalid', async () => {
      const user = userEvent.setup();
      await renderWithPosts();
      const create = vi.spyOn(postProxy, 'create');
      await openForm(user);

      await user.click(submitButton());

      expect(await screen.findByText('El título debe tener al menos 3 caracteres.')).toBeVisible();
      expect(create).not.toHaveBeenCalled();
      expect(isFormShown()).toBe(true);
    });

    describe('when the creation succeeds', () => {
      const createSuccessfully = async (user: UserEvent) => {
        await renderWithPosts();
        const create = vi.spyOn(postProxy, 'create').mockResolvedValue({ ...postMock, id: 101 });
        await openForm(user);
        await fillForm(user);
        await user.click(submitButton());
        return create;
      };

      it('creates the converted model, closes the form, shows "Nuevo post" and says it is not stored', async () => {
        const user = userEvent.setup();
        const create = await createSuccessfully(user);

        expect(await screen.findByText(/Post creado con id 101/)).toHaveTextContent(
          'La API de ejemplo no lo guarda',
        );
        expect(create).toHaveBeenCalledWith({
          title: 'Un título',
          body: 'Un texto largo',
          authorId: 3,
        });
        expect(isFormShown()).toBe(false);
        expect(newPostButton()).toBeInTheDocument();
      });

      it('reopens the form empty and without the previous notice', async () => {
        const user = userEvent.setup();
        await createSuccessfully(user);
        await screen.findByText(/Post creado con id 101/);

        await openForm(user);

        expect(screen.getByLabelText('Título')).toHaveValue('');
        expect(screen.getByLabelText('Texto')).toHaveValue('');
        expect(screen.getByLabelText('Autor')).toHaveValue('');
        expect(screen.queryByText(/Post creado con id/)).not.toBeInTheDocument();
      });
    });

    describe('when the creation fails', () => {
      const failToCreate = async (user: UserEvent) => {
        await renderWithPosts();
        vi.spyOn(postProxy, 'create').mockRejectedValue(new Error('boom'));
        await openForm(user);
        await fillForm(user);
        await user.click(submitButton());
        await screen.findByRole('alert');
      };

      it('shows the error and keeps the form open with what was written', async () => {
        const user = userEvent.setup();
        await failToCreate(user);

        expect(screen.getByRole('alert')).toHaveTextContent('No se pudo crear el post.');
        expect(screen.getByLabelText('Título')).toHaveValue('Un título');
        expect(screen.getByLabelText('Texto')).toHaveValue('Un texto largo');
        expect(screen.getByLabelText('Autor')).toHaveValue('3');
        await waitFor(() => expect(submitButton()).toBeEnabled());
        expect(screen.getByRole('link', { name: postMock.title })).toBeInTheDocument();
      });

      it('shows no previous error after cancelling and reopening the form', async () => {
        const user = userEvent.setup();
        await failToCreate(user);

        await user.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        await openForm(user);

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Título')).toHaveValue('');
      });
    });
  });
});
