import { describe, it, expect } from 'vitest';
import { parseHash, viewToHash } from '../routing';

describe('parseHash', () => {
  it('returns list view for empty hash', () => {
    expect(parseHash('')).toEqual({ kind: 'list' });
  });

  it('returns list view for bare #', () => {
    expect(parseHash('#')).toEqual({ kind: 'list' });
  });

  it('returns list view for #/', () => {
    expect(parseHash('#/')).toEqual({ kind: 'list' });
  });

  it('parses journal detail hash', () => {
    expect(parseHash('#journal/abc-123')).toEqual({ kind: 'detail', id: 'abc-123' });
  });

  it('parses journal detail with leading slash', () => {
    expect(parseHash('#/journal/abc-123')).toEqual({ kind: 'detail', id: 'abc-123' });
  });

  it('parses edit hash', () => {
    expect(parseHash('#edit/abc-123')).toEqual({ kind: 'edit', id: 'abc-123' });
  });

  it('parses new hash', () => {
    expect(parseHash('#new')).toEqual({ kind: 'new' });
  });

  it('returns list for unknown hash', () => {
    expect(parseHash('#unknown')).toEqual({ kind: 'list' });
  });
});

describe('viewToHash', () => {
  it('returns empty string for list view', () => {
    expect(viewToHash({ kind: 'list' })).toBe('');
  });

  it('returns journal hash for detail view', () => {
    expect(viewToHash({ kind: 'detail', id: 'abc-123' })).toBe('#journal/abc-123');
  });

  it('returns edit hash for edit view', () => {
    expect(viewToHash({ kind: 'edit', id: 'abc-123' })).toBe('#edit/abc-123');
  });

  it('returns new hash for new view', () => {
    expect(viewToHash({ kind: 'new' })).toBe('#new');
  });
});

describe('parseHash ↔ viewToHash roundtrip', () => {
  it('roundtrips detail view', () => {
    const view = { kind: 'detail' as const, id: 'uuid-here' };
    expect(parseHash(viewToHash(view))).toEqual(view);
  });

  it('roundtrips edit view', () => {
    const view = { kind: 'edit' as const, id: 'uuid-here' };
    expect(parseHash(viewToHash(view))).toEqual(view);
  });

  it('roundtrips new view', () => {
    const view = { kind: 'new' as const };
    expect(parseHash(viewToHash(view))).toEqual(view);
  });
});
