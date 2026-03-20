'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import type { JSONContent } from '@tiptap/react';
import Toolbar from './Toolbar';
import styles from './Editor.module.css';

interface EditorProps {
  content?: JSONContent;
  onChange?: (json: JSONContent) => void;
  editable?: boolean;
}

export default function Editor({ content, onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  if (!editable) {
    return (
      <div className={styles.readOnly}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
}
