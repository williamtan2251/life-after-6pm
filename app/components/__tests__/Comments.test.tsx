import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockFrom } = vi.hoisted(() => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn(),
  };
  return { mockFrom: vi.fn(() => ({ ...mockQuery })), mockQuery };
});

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

import Comments from '../Comments';

const mockComments = [
  {
    id: 'c1',
    name: 'Alice',
    email: 'alice@test.com',
    body: 'Great post!',
    created_at: '2026-03-17T22:32:00Z',
  },
];

function setupMockQuery(data: unknown = [], error: unknown = null) {
  const query = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn((cb: Function) => {
      cb({ data, error });
      return Promise.resolve();
    }),
  };
  mockFrom.mockReturnValue(query);
  return query;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Comments', () => {
  it('shows loading state', () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn(() => new Promise(() => {})),
    };
    mockFrom.mockReturnValue(query);
    render(<Comments journalId='j1' />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders comments after loading', async () => {
    setupMockQuery(mockComments);
    render(<Comments journalId='j1' />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Great post!')).toBeInTheDocument();
    });
  });

  it('shows comment count in heading', async () => {
    setupMockQuery(mockComments);
    render(<Comments journalId='j1' />);

    await waitFor(() => {
      expect(screen.getByText('Comments (1)')).toBeInTheDocument();
    });
  });

  it('shows empty state when no comments', async () => {
    setupMockQuery([]);
    render(<Comments journalId='j1' />);

    await waitFor(() => {
      expect(screen.getByText('No comments yet. Be the first!')).toBeInTheDocument();
    });
  });

  it('disables submit when fields are empty', async () => {
    setupMockQuery([]);
    render(<Comments journalId='j1' />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /post comment/i })).toBeDisabled();
    });
  });

  it('enables submit when all fields filled', async () => {
    setupMockQuery([]);

    const user = userEvent.setup();
    render(<Comments journalId='j1' />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Name'), 'Test');
    await user.type(screen.getByPlaceholderText('Email'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Write a comment...'), 'Nice!');

    expect(screen.getByRole('button', { name: /post comment/i })).toBeEnabled();
  });

  it('shows error on fetch failure', async () => {
    setupMockQuery(null, { message: 'fail' });
    render(<Comments journalId='j1' />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load comments.')).toBeInTheDocument();
    });
  });
});
