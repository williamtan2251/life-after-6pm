import { describe, it, expect, vi, beforeEach } from 'vitest';

// GA_ID is captured at module load — must set env before the module evaluates
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
});

import { setPageTitle, pageview, event } from '../analytics';

beforeEach(() => {
  document.title = '';
  window.gtag = vi.fn();
});

describe('setPageTitle', () => {
  it('sets title with site name when given a title', () => {
    setPageTitle('My Entry');
    expect(document.title).toBe('My Entry | Life After 6PM');
  });

  it('sets site name only when no title given', () => {
    setPageTitle();
    expect(document.title).toBe('Life After 6PM');
  });

  it('sets site name only for empty string', () => {
    setPageTitle('');
    expect(document.title).toBe('Life After 6PM');
  });
});

describe('pageview', () => {
  it('sends page_view event with normalized path', () => {
    setPageTitle('Test');
    pageview('/#journal/abc');

    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_location: expect.stringContaining('/journal/abc'),
      page_title: 'Test | Life After 6PM',
    });
  });

  it('normalizes double slashes in path', () => {
    pageview('/#//test');

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        page_location: expect.not.stringContaining('//test'),
      }),
    );
  });

  it('does nothing when gtag is not a function', () => {
    // @ts-expect-error -- testing missing gtag
    window.gtag = undefined;
    expect(() => pageview('/test')).not.toThrow();
  });
});

describe('event', () => {
  it('sends custom event with params', () => {
    event('click', { button: 'save' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'click', { button: 'save' });
  });

  it('sends event without params', () => {
    event('test_event');
    expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', undefined);
  });

  it('does nothing when gtag is not available', () => {
    // @ts-expect-error -- testing missing gtag
    window.gtag = undefined;
    expect(() => event('test')).not.toThrow();
  });
});
