'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { trackScrollDepth, trackReadTime, setPageTitle, pageview } from '../lib/analytics';
import Editor from './Editor';
import Comments from './Comments';
import type { JSONContent } from '@tiptap/react';
import styles from './JournalDetail.module.css';

interface Journal {
  id: string;
  title: string;
  content: JSONContent;
  created_at: string;
  author_id: string;
  author_name?: string;
}

interface Props {
  id: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export default function JournalDetail({ id, onBack, onEdit }: Props) {
  const { user } = useAuth();
  const [fetchedId, setFetchedId] = useState<string | null>(null);
  const [journal, setJournal] = useState<Journal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const loading = fetchedId !== id;

  useEffect(() => {
    let stale = false;

    supabase
      .from('journals')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (stale) return;
        if (error) {
          setError('Failed to load journal entry.');
          setJournal(null);
        } else {
          setError(null);
          setJournal(data);
        }
        setFetchedId(id);
      });

    return () => {
      stale = true;
    };
  }, [id]);

  useEffect(() => {
    if (!journal) return;
    setPageTitle(journal.title);
    pageview(`/#journal/${journal.id}`);
  }, [journal]);

  useEffect(() => {
    if (!journal || !rootRef.current) return;
    return trackScrollDepth(rootRef.current, journal.id);
  }, [journal]);

  useEffect(() => {
    if (!journal) return;
    return trackReadTime(journal.id);
  }, [journal]);

  async function handleDelete() {
    if (!confirm('Delete this entry?')) return;
    if (!user) return;
    setDeleting(true);
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id);
    if (error) {
      console.error('Journal delete failed:', error);
      alert('Failed to delete. Please try again.');
      setDeleting(false);
      return;
    }
    onBack();
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!journal) return <p>Not found.</p>;

  const isAuthor = user?.id === journal.author_id;

  return (
    <div ref={rootRef}>
      <button onClick={onBack} className={styles.back}>
        &larr; Back
      </button>

      <header className={styles.header}>
        <h1 className={styles.title}>{journal.title}</h1>
        <time className={styles.date}>
          {new Date(journal.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
          {journal.author_name && ` | ${journal.author_name}`}
        </time>
        {isAuthor && (
          <div className={styles.actions}>
            <button onClick={() => onEdit(journal.id)} className={styles.editButton}>
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={styles.deleteButton}
              style={{ opacity: deleting ? 0.5 : 1 }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </header>

      <article className={styles.content}>
        <Editor content={journal.content} editable={false} />
      </article>

      <Comments journalId={id} />
    </div>
  );
}
