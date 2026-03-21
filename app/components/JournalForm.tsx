'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import Editor from './Editor';
import { extractPreview } from '../lib/extract-preview';
import type { JSONContent } from '@tiptap/react';
import styles from './JournalForm.module.css';

interface Props {
  editId?: string;
  onBack: () => void;
  onSaved: (id: string) => void;
}

export default function JournalForm({ editId, onBack, onSaved }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent | null>(null);
  const [initialContent, setInitialContent] = useState<JSONContent | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    let stale = false;
    supabase
      .from('journals')
      .select('*')
      .eq('id', editId)
      .single()
      .then(({ data, error }) => {
        if (stale) return;
        if (error) {
          setError('Failed to load journal entry.');
        } else if (data) {
          setTitle(data.title);
          setInitialContent(data.content);
          setContent(data.content);
        }
        setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [editId]);

  if (!user) return <p>Please sign in.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  async function handleSave() {
    if (!title.trim() || !content || !user) return;
    setSaving(true);

    if (editId) {
      const { error } = await supabase
        .from('journals')
        .update({
          title: title.trim(),
          content,
          preview: extractPreview(content),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editId)
        .eq('author_id', user.id);

      if (error) {
        console.error('Journal update failed:', error);
        alert('Failed to save. Please try again.');
        setSaving(false);
        return;
      }
      onSaved(editId);
    } else {
      const { data, error } = await supabase
        .from('journals')
        .insert({
          title: title.trim(),
          content,
          preview: extractPreview(content),
          author_id: user.id,
          author_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Author',
        })
        .select('id')
        .single();

      if (error) {
        console.error('Journal create failed:', error);
        alert('Failed to publish. Please try again.');
        setSaving(false);
        return;
      }
      onSaved(data.id);
    }
  }

  return (
    <div>
      <button onClick={onBack} className={styles.back}>
        &larr; Back
      </button>

      <h1 className={styles.heading}>{editId ? 'Edit Entry' : 'New Entry'}</h1>

      <label htmlFor='journal-title' className={styles.srOnly}>
        Title
      </label>
      <input
        id='journal-title'
        type='text'
        placeholder='Title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        className={styles.titleInput}
      />

      <Editor content={initialContent} onChange={setContent} />

      <button
        onClick={handleSave}
        disabled={saving || !title.trim()}
        className={styles.saveButton}
        style={{ opacity: saving || !title.trim() ? 0.5 : 1 }}
      >
        {saving ? 'Saving...' : editId ? 'Save' : 'Publish'}
      </button>
    </div>
  );
}
