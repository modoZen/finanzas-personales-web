import type { FC } from 'react';
import { Route, Routes } from 'react-router';
import GalleryPage from './pages/GalleryPage/GalleryPage';

const GalleryRouter: FC = () => (
  <Routes>
    <Route index element={<GalleryPage />} />
  </Routes>
);

export default GalleryRouter;
