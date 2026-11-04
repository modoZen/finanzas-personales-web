import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

export const renderWithRouter = (ui: ReactElement, { route = '/' }: { route?: string } = {}) =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
