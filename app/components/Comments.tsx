"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "./Comments.module.css";

interface Comment {
  id: string;
  name: string;
  email: string;
  body: string;
  created_at: string;
}

interface Props {
  journalId: string;
}

export default function Comments({ journalId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [journalId]);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("journal_id", journalId)
      .order("created_at", { ascending: true });
    setComments(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !body.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      journal_id: journalId,
      name: name.trim(),
      email: email.trim(),
      body: body.trim(),
    });

    if (error) {
      alert(error.message);
      setSubmitting(false);
      return;
    }

    setBody("");
    setSubmitting(false);
    loadComments();
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>
        Comments{!loading && comments.length > 0 && ` (${comments.length})`}
      </h3>

      {loading ? (
        <p className={styles.empty}>Loading...</p>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>No comments yet. Be the first!</p>
      ) : (
        <ul className={styles.list}>
          {comments.map((c) => (
            <li key={c.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <strong>{c.name}</strong>
                <time className={styles.commentDate}>
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className={styles.commentBody}>{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <textarea
          placeholder="Write a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          className={styles.textarea}
        />
        <button
          type="submit"
          disabled={submitting || !name.trim() || !email.trim() || !body.trim()}
          className={styles.submitButton}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
