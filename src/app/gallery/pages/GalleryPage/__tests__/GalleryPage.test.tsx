import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GalleryPage from '../GalleryPage';

const colors = [
  'bg',
  'surface',
  'surface-muted',
  'ink',
  'ink-muted',
  'line',
  'control-border',
  'primary',
  'primary-hover',
  'primary-soft',
  'primary-tint',
  'on-primary',
  'income',
  'income-soft',
  'income-surface',
  'credit',
  'credit-soft',
  'error',
  'error-soft',
  'overlay',
];
const textStyles = ['display', 'title', 'heading', 'body-strong', 'body', 'caption', 'small'];
const radii = ['sm', 'md', 'lg', 'xl', 'pill'];
const shadows = ['card', 'raised', 'fab', 'modal'];

const renderGallery = () => {
  render(<GalleryPage />);

  return (name: string) => screen.getByRole('region', { name });
};

describe('GalleryPage', () => {
  it('shows the gallery title', () => {
    renderGallery();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Galería de componentes' }),
    ).toBeInTheDocument();
  });

  it('exposes each section as a region named after its heading', () => {
    const region = renderGallery();

    for (const name of ['Tokens', 'Spinner', 'ErrorMessage', 'ErrorFallback']) {
      expect(region(name)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('region')).toHaveLength(4);
  });

  describe('tokens section', () => {
    it.each([
      ['colors', colors, 'Colores'],
      ['text styles', textStyles, 'Estilos de texto'],
      ['radii', radii, 'Radios'],
      ['shadows', shadows, 'Sombras'],
    ])('shows every token of the %s group by name', (_group, names, heading) => {
      const region = renderGallery();
      const tokens = region('Tokens');
      const group = within(tokens).getByRole('heading', { name: heading }).parentElement;

      for (const name of names) {
        expect(within(group as HTMLElement).getByText(name)).toBeInTheDocument();
      }
      expect(within(group as HTMLElement).getAllByRole('listitem')).toHaveLength(names.length);
    });

    it('shows the utility class that each token is applied with', () => {
      const region = renderGallery();
      const tokens = region('Tokens');

      expect(within(tokens).getByText('bg-primary')).toBeInTheDocument();
      expect(within(tokens).getByText('text-body-strong')).toBeInTheDocument();
      expect(within(tokens).getByText('rounded-pill')).toBeInTheDocument();
      expect(within(tokens).getByText('shadow-fab')).toBeInTheDocument();
    });
  });

  it('shows the spinner with its default label', () => {
    const region = renderGallery();

    expect(within(region('Spinner')).getByRole('status')).toHaveTextContent('Cargando…');
  });

  it('shows the error message with the default title and with a custom one', () => {
    const region = renderGallery();

    const alerts = within(region('ErrorMessage')).getAllByRole('alert');

    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent('Algo salió mal');
    expect(alerts[1]).toHaveTextContent('No se pudo guardar');
  });

  it('shows the page failure notice with its reload button', () => {
    const region = renderGallery();

    const section = within(region('ErrorFallback'));

    expect(section.getByRole('alert')).toBeInTheDocument();
    expect(section.getByRole('button', { name: 'Recargar página' })).toBeInTheDocument();
  });
});
