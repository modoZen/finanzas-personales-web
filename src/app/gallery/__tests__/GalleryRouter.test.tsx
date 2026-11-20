import { screen } from '@testing-library/react';
import type { FC } from 'react';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/shared/test-utils/render-with-router';
import GalleryRouter from '../GalleryRouter';

vi.mock('../pages/GalleryPage/GalleryPage', () => {
  const GalleryPageStub: FC = () => <p>Gallery page</p>;

  return { default: GalleryPageStub };
});

const renderModule = (route: string) =>
  renderWithRouter(
    <Routes>
      <Route path='/gallery/*' element={<GalleryRouter />} />
    </Routes>,
    { route },
  );

describe('GalleryRouter', () => {
  it('routes the base route of the module to the gallery page', () => {
    renderModule('/gallery');

    expect(screen.getByText('Gallery page')).toBeInTheDocument();
  });

  it('shows nothing for a route the module does not define', () => {
    renderModule('/gallery/otra');

    expect(screen.queryByText('Gallery page')).not.toBeInTheDocument();
  });
});
