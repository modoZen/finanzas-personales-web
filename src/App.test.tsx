import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the counter starting at zero', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /count is 0/i })).toBeInTheDocument();
  });

  it('increments the counter when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /count is/i }));

    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument();
  });
});
