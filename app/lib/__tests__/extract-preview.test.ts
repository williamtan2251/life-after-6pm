import { describe, it, expect } from 'vitest';
import { extractPreview } from '../extract-preview';

describe('extractPreview', () => {
  it('extracts text from simple paragraph', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    };
    expect(extractPreview(json)).toBe('Hello world');
  });

  it('concatenates text from multiple paragraphs', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'First.' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Second.' }],
        },
      ],
    };
    expect(extractPreview(json)).toBe('First.Second.');
  });

  it('extracts text from nested content (headings, bold, etc.)', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Title' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Normal ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
          ],
        },
      ],
    };
    expect(extractPreview(json)).toBe('TitleNormal bold');
  });

  it('truncates to 200 characters', () => {
    const longText = 'A'.repeat(300);
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: longText }],
        },
      ],
    };
    expect(extractPreview(json)).toHaveLength(200);
  });

  it('returns empty string for empty doc', () => {
    expect(extractPreview({ type: 'doc' })).toBe('');
  });

  it('handles nodes without text (images, horizontal rules)', () => {
    const json = {
      type: 'doc',
      content: [
        { type: 'horizontalRule' },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'After rule' }],
        },
      ],
    };
    expect(extractPreview(json)).toBe('After rule');
  });
});
