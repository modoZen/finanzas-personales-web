import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, type RenderHookResult } from '@testing-library/react';
import type { FC, ReactNode } from 'react';

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

export const renderHookWithQuery = <Result,>(
  hook: () => Result,
): RenderHookResult<Result, unknown> & { queryClient: QueryClient } => {
  const queryClient = createTestQueryClient();
  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { ...renderHook(hook, { wrapper }), queryClient };
};
