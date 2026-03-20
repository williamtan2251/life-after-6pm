'use client';

import type { Editor } from '@tiptap/react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  return (
    <div className={styles.toolbar} role='toolbar' aria-label='Text formatting'>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? styles.active : ''}
        title='Bold'
        aria-label='Bold'
        aria-pressed={editor.isActive('bold')}
      >
        B
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? styles.active : ''}
        title='Italic'
        aria-label='Italic'
        aria-pressed={editor.isActive('italic')}
      >
        <em>I</em>
      </button>

      <span className={styles.divider} />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? styles.active : ''}
        title='Heading 1'
        aria-label='Heading 1'
        aria-pressed={editor.isActive('heading', { level: 1 })}
      >
        H1
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}
        title='Heading 2'
        aria-label='Heading 2'
        aria-pressed={editor.isActive('heading', { level: 2 })}
      >
        H2
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? styles.active : ''}
        title='Heading 3'
        aria-label='Heading 3'
        aria-pressed={editor.isActive('heading', { level: 3 })}
      >
        H3
      </button>

      <span className={styles.divider} />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? styles.active : ''}
        title='Inline code'
        aria-label='Inline code'
        aria-pressed={editor.isActive('code')}
      >
        {'<>'}
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? styles.active : ''}
        title='Code block'
        aria-label='Code block'
        aria-pressed={editor.isActive('codeBlock')}
      >
        {'{ }'}
      </button>

      <span className={styles.divider} />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? styles.active : ''}
        title='Bullet list'
        aria-label='Bullet list'
        aria-pressed={editor.isActive('bulletList')}
      >
        &bull; List
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? styles.active : ''}
        title='Numbered list'
        aria-label='Numbered list'
        aria-pressed={editor.isActive('orderedList')}
      >
        1. List
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? styles.active : ''}
        title='Blockquote'
        aria-label='Blockquote'
        aria-pressed={editor.isActive('blockquote')}
      >
        &ldquo;&rdquo;
      </button>

      <span className={styles.divider} />

      <button
        type='button'
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title='Horizontal rule'
        aria-label='Horizontal rule'
      >
        &mdash;
      </button>

      <span className={styles.divider} />

      <button
        type='button'
        onClick={() => {
          const url = prompt('Image URL:');
          if (url) {
            try {
              const parsed = new URL(url);
              if (parsed.protocol !== 'https:') {
                alert('Only https URLs are allowed.');
                return;
              }
              editor.chain().focus().setImage({ src: parsed.href }).run();
            } catch {
              alert('Invalid URL.');
            }
          }
        }}
        title='Insert image'
        aria-label='Insert image'
      >
        IMG
      </button>
    </div>
  );
}
