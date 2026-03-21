import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

vi.mock('../../lib/analytics', () => ({
  event: vi.fn(),
}));

vi.mock('../Editor', () => ({
  default: () => <div data-testid='mock-editor'>Editor Mock</div>,
}));

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('../../lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

import JournalForm from '../JournalForm';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('JournalForm', () => {
  it('shows "Please sign in." when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<JournalForm onBack={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByText('Please sign in.')).toBeInTheDocument();
  });

  it('renders form when authenticated (new entry)', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'test@test.com' },
      loading: false,
    });
    render(<JournalForm onBack={vi.fn()} onSaved={vi.fn()} />);

    expect(screen.getByText('New Entry')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    expect(screen.getByText('Publish')).toBeInTheDocument();
  });

  it('shows "Edit Entry" heading when editId is provided', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'test@test.com' },
      loading: false,
    });

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn((cb: Function) => {
        cb({
          data: { id: 'j1', title: 'Test', content: { type: 'doc' } },
          error: null,
        });
        return Promise.resolve();
      }),
    };
    mockFrom.mockReturnValue(mockQuery);

    render(<JournalForm editId='j1' onBack={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByText('Edit Entry')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('disables Publish button when title is empty', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'test@test.com' },
      loading: false,
    });
    render(<JournalForm onBack={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByText('Publish')).toBeDisabled();
  });

  it('calls onBack when back button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'test@test.com' },
      loading: false,
    });
    const onBack = vi.fn();
    render(<JournalForm onBack={onBack} onSaved={vi.fn()} />);

    const { default: ue } = await import('@testing-library/user-event');
    const user = ue.setup();
    await user.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalled();
  });
});
