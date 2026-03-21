import type { JSONContent } from '@tiptap/react';

export function extractPreview(json: JSONContent): string {
  let text = '';
  function walk(node: JSONContent) {
    if (node.text) text += node.text;
    if (node.content) node.content.forEach(walk);
  }
  walk(json);
  return text.slice(0, 200);
}
