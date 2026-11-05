import { screen } from '@testing-library/react';
import type { FC } from 'react';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/shared/test-utils/render-with-router';
import ExampleRouter from '../ExampleRouter';

vi.mock('../pages/ExamplePage/ExamplePage', () => {
  const ExamplePageStub: FC = () => <p>Example page</p>;

  return { default: ExamplePageStub };
});

vi.mock('../pages/ExampleDetailPage/ExampleDetailPage', async () => {
  const { useParams } = await import('react-router');
  const ExampleDetailPageStub: FC = () => {
    const { id } = useParams();

    return <p>Example detail page {id}</p>;
  };

  return { default: ExampleDetailPageStub };
});

const renderModule = (route: string) =>
  renderWithRouter(
    <Routes>
      <Route path='/example/*' element={<ExampleRouter />} />
    </Routes>,
    { route },
  );

describe('ExampleRouter', () => {
  it('routes the base route of the module to the index page', () => {
    renderModule('/example');

    expect(screen.getByText('Example page')).toBeInTheDocument();
    expect(screen.queryByText(/Example detail page/)).not.toBeInTheDocument();
  });

  it('routes a detail URL to the detail page with its id', () => {
    renderModule('/example/detail/3');

    expect(screen.getByText('Example detail page 3')).toBeInTheDocument();
    expect(screen.queryByText('Example page')).not.toBeInTheDocument();
  });
});
