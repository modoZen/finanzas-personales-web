import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PostForm from '../PostForm';

const titleMessage = 'El título debe tener al menos 3 caracteres.';
const bodyMessage = 'El texto debe tener al menos 10 caracteres.';
const authorMessage = 'El autor debe ser un número entero positivo.';

const renderForm = (props: { isPending?: boolean } = {}) => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(<PostForm onSubmit={onSubmit} onCancel={onCancel} isPending={props.isPending ?? false} />);
  return { onSubmit, onCancel };
};

const submit = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Crear post' }));

const fillValid = async (user: UserEvent): Promise<void> => {
  await user.type(screen.getByLabelText('Título'), '  Un título  ');
  await user.type(screen.getByLabelText('Texto'), ' Un texto largo ');
  await user.type(screen.getByLabelText('Autor'), ' 3 ');
};

const messageOf = (field: HTMLElement): HTMLElement | null =>
  document.getElementById(field.getAttribute('aria-describedby') ?? '');

describe('PostForm', () => {
  it('shows the three fields, each with its label, and the two buttons', () => {
    renderForm();

    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByLabelText('Texto')).toBeInTheDocument();
    expect(screen.getByLabelText('Autor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear post' })).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveAttribute('type', 'button');
  });

  it('shows no error before the first submit', () => {
    renderForm();

    expect(screen.getByLabelText('Título')).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText(titleMessage)).not.toBeInTheDocument();
  });

  describe('validation', () => {
    it('does not submit an empty form and shows each message linked to its field', async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();

      await submit(user);

      for (const [label, message] of [
        ['Título', titleMessage],
        ['Texto', bodyMessage],
        ['Autor', authorMessage],
      ]) {
        const field = await screen.findByLabelText(label);
        expect(field).toHaveAttribute('aria-invalid', 'true');
        expect(messageOf(field)).toHaveTextContent(message);
      }
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('focuses the first invalid field', async () => {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText('Título'), 'Un título');

      await submit(user);

      await waitFor(() => expect(screen.getByLabelText('Texto')).toHaveFocus());
    });

    it('removes the message of a field as soon as it is corrected, without submitting again', async () => {
      const user = userEvent.setup();
      renderForm();
      await submit(user);
      await screen.findByText(titleMessage);

      await user.type(screen.getByLabelText('Título'), 'abc');

      await waitFor(() => expect(screen.queryByText(titleMessage)).not.toBeInTheDocument());
      expect(screen.getByLabelText('Título')).not.toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText(bodyMessage)).toBeInTheDocument();
      expect(screen.getByText(authorMessage)).toBeInTheDocument();
    });
  });

  describe('submit', () => {
    it('calls onSubmit once with the converted model, with the spaces trimmed', async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();
      await fillValid(user);

      await submit(user);

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Un título',
        body: 'Un texto largo',
        authorId: 3,
      });
      expect(screen.queryByText(titleMessage)).not.toBeInTheDocument();
    });
  });

  describe('while pending', () => {
    it('disables both buttons', () => {
      renderForm({ isPending: true });

      expect(screen.getByRole('button', { name: 'Crear post' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });

    it('keeps both buttons enabled otherwise', () => {
      renderForm();

      expect(screen.getByRole('button', { name: 'Crear post' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled();
    });
  });

  describe('cancel', () => {
    it('calls onCancel and not onSubmit, even if the form is invalid', async () => {
      const user = userEvent.setup();
      const { onSubmit, onCancel } = renderForm();

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByText(titleMessage)).not.toBeInTheDocument();
    });

    it('does not submit a valid form either', async () => {
      const user = userEvent.setup();
      const { onSubmit, onCancel } = renderForm();
      await fillValid(user);

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
