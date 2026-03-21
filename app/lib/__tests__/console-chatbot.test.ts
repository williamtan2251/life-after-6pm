import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../analytics', () => ({
  event: vi.fn(),
}));

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: mockInvoke,
    },
  },
}));

import { initConsoleChatbot } from '../console-chatbot';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('initConsoleChatbot', () => {
  it('exposes irc function on window', () => {
    initConsoleChatbot();
    expect(typeof window.irc).toBe('function');
  });

  it('irc logs hint when called with empty string', async () => {
    initConsoleChatbot();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    window.irc('');
    await new Promise((r) => setTimeout(r, 0));

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('Pass a message string'),
      expect.any(String),
    );
    spy.mockRestore();
  });

  it('irc logs bot reply on success', async () => {
    mockInvoke.mockResolvedValue({
      data: { reply: 'Hello back!' },
      error: null,
    });

    initConsoleChatbot();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    window.irc('hello');
    await new Promise((r) => setTimeout(r, 10));

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Hello back!'), expect.any(String));
    spy.mockRestore();
  });

  it('irc handles network errors gracefully', async () => {
    mockInvoke.mockRejectedValue(new Error('Network error'));

    initConsoleChatbot();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    window.irc('hello');
    await new Promise((r) => setTimeout(r, 10));

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Network error'), expect.any(String));
    spy.mockRestore();
  });
});
