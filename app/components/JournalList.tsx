"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { event } from "../lib/analytics";
import styles from "./JournalList.module.css";

interface Journal {
  id: string;
  title: string;
  preview: string | null;
  created_at: string;
}

interface Props {
  onSelect: (id: string) => void;
}

export default function JournalList({ onSelect }: Props) {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("journals")
      .select("id, title, preview, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError("Failed to load journals.");
        } else {
          setJournals(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <p className={styles.empty}>Loading...</p>;
  if (error) return <p className={styles.empty}>{error}</p>;
  if (journals.length === 0)
    return <p className={styles.empty}>No journal entries yet.</p>;

  return (
    <ul className={styles.list}>
      {journals.map((journal) => (
        <li key={journal.id}>
          <button
            onClick={() => {
              event("entry_select", { journal_id: journal.id });
              onSelect(journal.id);
            }}
            className={styles.entry}
          >
            <time className={styles.date}>
              {new Date(journal.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
            <h2 className={styles.entryTitle}>{journal.title}</h2>
            {journal.preview && (
              <p className={styles.preview}>{journal.preview}</p>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
