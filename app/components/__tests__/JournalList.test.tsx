import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../lib/analytics', () => ({
  event: vi.fn(),
}));

const mockJournals = [
  { id: '1', title: 'First Post', preview: 'Preview text', created_at: '2026-03-19T12:16:00Z' },
  { id: '2', title: 'Second Post', preview: null, created_at: '2026-03-17T04:57:00Z' },
];

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  then: vi.fn(),
};

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockQuery),
  },
}));

import JournalList from '../JournalList';

beforeEach(() => {
  vi.clearAllMocks();
  mockQuery.select.mockReturnThis();
  mockQuery.order.mockReturnThis();
});

describe('JournalList', () => {
  it('shows loading state initially', () => {
    mockQuery.then.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<JournalList onSelect={vi.fn()} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders journal entries after loading', async () => {
    mockQuery.then.mockImplementation((cb: Function) => {
      cb({ data: mockJournals, error: null });
      return Promise.resolve();
    });

    render(<JournalList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
    });
  });

  it('renders preview text when available', async () => {
    mockQuery.then.mockImplementation((cb: Function) => {
      cb({ data: mockJournals, error: null });
      return Promise.resolve();
    });

    render(<JournalList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Preview text')).toBeInTheDocument();
    });
  });

  it('calls onSelect with journal id when clicked', async () => {
    mockQuery.then.mockImplementation((cb: Function) => {
      cb({ data: mockJournals, error: null });
      return Promise.resolve();
    });

    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<JournalList onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument();
    });

    await user.click(screen.getByText('First Post'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('shows error message on fetch failure', async () => {
    mockQuery.then.mockImplementation((cb: Function) => {
      cb({ data: null, error: { message: 'fail' } });
      return Promise.resolve();
    });

    render(<JournalList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load journals.')).toBeInTheDocument();
    });
  });

  it('shows empty state when no journals', async () => {
    mockQuery.then.mockImplementation((cb: Function) => {
      cb({ data: [], error: null });
      return Promise.resolve();
    });

    render(<JournalList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No journal entries yet.')).toBeInTheDocument();
    });
  });

  it('formats dates with locale string', async () => {
    mockQuery.then.mockImplementation((cb: Function) => {
      cb({
        data: [{ id: '1', title: 'Test', preview: null, created_at: '2026-01-15T14:30:00Z' }],
        error: null,
      });
      return Promise.resolve();
    });

    render(<JournalList onSelect={vi.fn()} />);

    await waitFor(() => {
      // Timezone may shift the day, so just check month and year
      const timeEl = screen.getByText(/January.*2026/);
      expect(timeEl).toBeInTheDocument();
    });
  });
});
