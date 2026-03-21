export type View =
  | { kind: 'list' }
  | { kind: 'detail'; id: string }
  | { kind: 'new' }
  | { kind: 'edit'; id: string };

export function parseHash(hash: string): View {
  const h = hash.replace(/^#\/?/, '');
  if (h.startsWith('journal/')) return { kind: 'detail', id: h.slice(8) };
  if (h.startsWith('edit/')) return { kind: 'edit', id: h.slice(5) };
  if (h === 'new') return { kind: 'new' };
  return { kind: 'list' };
}

export function viewToHash(view: View): string {
  switch (view.kind) {
    case 'detail':
      return `#journal/${view.id}`;
    case 'edit':
      return `#edit/${view.id}`;
    case 'new':
      return '#new';
    case 'list':
      return '';
  }
}
