"use client";

import type { Editor } from "@tiptap/react";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? styles.active : ""}
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? styles.active : ""}
        title="Italic"
      >
        <em>I</em>
      </button>

      <span className={styles.divider} />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? styles.active : ""}
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? styles.active : ""}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? styles.active : ""}
        title="Heading 3"
      >
        H3
      </button>

      <span className={styles.divider} />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? styles.active : ""}
        title="Inline code"
      >
        {"<>"}
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? styles.active : ""}
        title="Code block"
      >
        {"{ }"}
      </button>

      <span className={styles.divider} />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? styles.active : ""}
        title="Bullet list"
      >
        &bull; List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? styles.active : ""}
        title="Numbered list"
      >
        1. List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? styles.active : ""}
        title="Blockquote"
      >
        &ldquo;&rdquo;
      </button>

      <span className={styles.divider} />

      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        &mdash;
      </button>

      <span className={styles.divider} />

      <button
        type="button"
        onClick={() => {
          const url = prompt("Image URL:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        title="Insert image"
      >
        IMG
      </button>
    </div>
  );
}
