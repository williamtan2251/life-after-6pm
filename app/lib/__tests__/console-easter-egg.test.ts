import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../supabase');

vi.mock('../analytics', () => ({
  event: vi.fn(),
}));

vi.mock('../console-chatbot', () => ({
  initConsoleChatbot: vi.fn(),
}));

import { initConsoleEasterEgg } from '../console-easter-egg';
import { initConsoleChatbot } from '../console-chatbot';
import { event } from '../analytics';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('initConsoleEasterEgg', () => {
  it('logs styled messages to console', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    initConsoleEasterEgg();

    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[1][0]).toContain('I knew you will look at console');
    expect(spy.mock.calls[2][0]).toContain('william.tan2251');
    expect(spy.mock.calls[3][0]).toContain("Type irc('hello')");

    spy.mockRestore();
  });

  it('fires analytics event', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    initConsoleEasterEgg();
    expect(event).toHaveBeenCalledWith('console_easter_egg');
  });

  it('initializes the console chatbot', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    initConsoleEasterEgg();
    expect(initConsoleChatbot).toHaveBeenCalled();
  });
});
