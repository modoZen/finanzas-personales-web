import type { FC } from 'react';
import { Route, Routes } from 'react-router';
import { exampleRoutes } from './example.routes';
import ExampleDetailPage from './pages/ExampleDetailPage/ExampleDetailPage';
import ExamplePage from './pages/ExamplePage/ExamplePage';

const ExampleRouter: FC = () => (
  <Routes>
    <Route index element={<ExamplePage />} />
    <Route path={exampleRoutes.detail} element={<ExampleDetailPage />} />
  </Routes>
);

export default ExampleRouter;
