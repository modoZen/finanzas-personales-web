import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '../../../test-utils/render-with-router';
import RootLayout, { type NavItem } from '../RootLayout';

const navItems: NavItem[] = [
  { label: 'Ejemplo', to: '/example' },
  { label: 'Otro', to: '/otro' },
];

const renderLayout = (route = '/example') =>
  renderWithRouter(
    <RootLayout appName='Finanzas personales' navItems={navItems}>
      <p>Contenido</p>
    </RootLayout>,
    { route },
  );

describe('RootLayout', () => {
  it('shows the app name in the header', () => {
    renderLayout();

    expect(within(screen.getByRole('banner')).getByText('Finanzas personales')).toBeInTheDocument();
  });

  it('renders one link per nav item inside a named navigation', () => {
    renderLayout();

    const nav = screen.getByRole('navigation', { name: 'Principal' });

    expect(within(nav).getByRole('link', { name: 'Ejemplo' })).toHaveAttribute('href', '/example');
    expect(within(nav).getByRole('link', { name: 'Otro' })).toHaveAttribute('href', '/otro');
  });

  it('marks only the link of the active route as the current page', () => {
    renderLayout('/example');

    expect(screen.getByRole('link', { name: 'Ejemplo' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Otro' })).not.toHaveAttribute('aria-current');
  });

  it('renders the children below the header', () => {
    renderLayout();

    expect(within(screen.getByRole('main')).getByText('Contenido')).toBeInTheDocument();
    expect(within(screen.getByRole('banner')).queryByText('Contenido')).not.toBeInTheDocument();
  });
});
