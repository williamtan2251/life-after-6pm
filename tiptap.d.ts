// Tiptap v3 ships source-only (no compiled .d.ts files).
// Webpack aliases in next.config.ts resolve these at build time.
// These declarations let the TypeScript checker find the types.

declare module "@tiptap/react" {
  import type { Editor as CoreEditor } from "@tiptap/core";
  export type JSONContent = {
    type?: string;
    attrs?: Record<string, unknown>;
    content?: JSONContent[];
    marks?: { type: string; attrs?: Record<string, unknown> }[];
    text?: string;
  };
  export type EditorOptions = {
    extensions?: unknown[];
    content?: JSONContent;
    editable?: boolean;
    immediatelyRender?: boolean;
    onUpdate?: (props: { editor: CoreEditor }) => void;
  };
  export function useEditor(options: EditorOptions): CoreEditor | null;
  export function EditorContent(props: {
    editor: CoreEditor | null;
    className?: string;
  }): React.JSX.Element;
  export type { CoreEditor as Editor };
}

declare module "@tiptap/core" {
  export interface Editor {
    chain(): ChainedCommands;
    isActive(name: string, attrs?: Record<string, unknown>): boolean;
    getJSON(): import("@tiptap/react").JSONContent;
  }
  interface ChainedCommands {
    focus(): ChainedCommands;
    toggleBold(): ChainedCommands;
    toggleItalic(): ChainedCommands;
    toggleHeading(attrs: { level: number }): ChainedCommands;
    toggleCode(): ChainedCommands;
    toggleCodeBlock(): ChainedCommands;
    toggleBulletList(): ChainedCommands;
    toggleOrderedList(): ChainedCommands;
    toggleBlockquote(): ChainedCommands;
    setHorizontalRule(): ChainedCommands;
    setImage(attrs: { src: string }): ChainedCommands;
    run(): void;
  }
}

declare module "@tiptap/starter-kit" {
  const StarterKit: unknown;
  export default StarterKit;
}

declare module "@tiptap/extension-image" {
  const Image: unknown;
  export default Image;
}
