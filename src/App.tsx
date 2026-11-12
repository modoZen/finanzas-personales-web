import { lazy, Suspense } from 'react';
import type { FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { appRoutes } from '@/routes';
import ErrorFallback from '@/shared/components/ErrorFallback/ErrorFallback';
import NotFoundPage from '@/shared/components/NotFoundPage/NotFoundPage';
import RootLayout, { type NavItem } from '@/shared/components/RootLayout/RootLayout';
import Spinner from '@/shared/components/Spinner/Spinner';

const ExampleRouter = lazy(() => import('@/app/example/ExampleRouter'));

const navItems: NavItem[] = [{ label: 'Ejemplo', to: appRoutes.example }];

const App: FC = () => {
  const { pathname } = useLocation();

  return (
    <RootLayout appName='Finanzas personales' navItems={navItems}>
      <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[pathname]}>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path='/' element={<Navigate to={appRoutes.example} replace />} />
            <Route path={`${appRoutes.example}/*`} element={<ExampleRouter />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </RootLayout>
  );
};

export default App;
