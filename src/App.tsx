import { lazy, Suspense } from 'react';
import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { appRoutes } from '@/routes';
import NotFoundPage from '@/shared/components/NotFoundPage/NotFoundPage';
import RootLayout, { type NavItem } from '@/shared/components/RootLayout/RootLayout';
import Spinner from '@/shared/components/Spinner/Spinner';

const ExampleRouter = lazy(() => import('@/app/example/ExampleRouter'));

const navItems: NavItem[] = [{ label: 'Ejemplo', to: appRoutes.example }];

const App: FC = () => (
  <RootLayout appName='Finanzas personales' navItems={navItems}>
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path='/' element={<Navigate to={appRoutes.example} replace />} />
        <Route path={`${appRoutes.example}/*`} element={<ExampleRouter />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </RootLayout>
);

export default App;
