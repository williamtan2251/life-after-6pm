import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../lib/analytics', () => ({
  event: vi.fn(),
}));

const { mockSignIn, mockSignOut } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
    },
  },
}));

import Auth from '../Auth';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Auth (signed out)', () => {
  it('renders email and password inputs on desktop', () => {
    render(<Auth />);
    const emailInputs = screen.getAllByPlaceholderText('Email');
    const passwordInputs = screen.getAllByPlaceholderText('Password');
    expect(emailInputs.length).toBeGreaterThanOrEqual(1);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Sign in button', () => {
    render(<Auth />);
    const buttons = screen.getAllByRole('button', { name: /sign in/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows error on failed sign-in', async () => {
    mockSignIn.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });

    const user = userEvent.setup();
    render(<Auth />);

    const emailInputs = screen.getAllByPlaceholderText('Email');
    const passwordInputs = screen.getAllByPlaceholderText('Password');
    const submitButtons = screen.getAllByRole('button', { name: /sign in/i });

    await user.type(emailInputs[0], 'bad@test.com');
    await user.type(passwordInputs[0], 'wrongpassword');
    await user.click(submitButtons[0]);

    const errors = await screen.findAllByText('Invalid email or password.');
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('calls signInWithPassword on submit', async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null });

    const user = userEvent.setup();
    render(<Auth />);

    const emailInputs = screen.getAllByPlaceholderText('Email');
    const passwordInputs = screen.getAllByPlaceholderText('Password');
    const submitButtons = screen.getAllByRole('button', { name: /sign in/i });

    await user.type(emailInputs[0], 'test@test.com');
    await user.type(passwordInputs[0], 'password123');
    await user.click(submitButtons[0]);

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });
});
