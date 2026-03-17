"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import Editor from "./Editor";
import Comments from "./Comments";
import type { JSONContent } from "@tiptap/react";
import styles from "./JournalDetail.module.css";

interface Journal {
  id: string;
  title: string;
  content: JSONContent;
  created_at: string;
  author_id: string;
}

interface Props {
  id: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export default function JournalDetail({ id, onBack, onEdit }: Props) {
  const { user } = useAuth();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("journals")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setJournal(data);
        setLoading(false);
      });
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this entry?")) return;
    await supabase.from("journals").delete().eq("id", id);
    onBack();
  }

  if (loading) return <p>Loading...</p>;
  if (!journal) return <p>Not found.</p>;

  const isAuthor = user?.id === journal.author_id;

  return (
    <div>
      <button onClick={onBack} className={styles.back}>
        &larr; Back
      </button>

      <header className={styles.header}>
        <h1 className={styles.title}>{journal.title}</h1>
        <time className={styles.date}>
          {new Date(journal.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </time>
        {isAuthor && (
          <div className={styles.actions}>
            <button
              onClick={() => onEdit(journal.id)}
              className={styles.editButton}
            >
              Edit
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              Delete
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
