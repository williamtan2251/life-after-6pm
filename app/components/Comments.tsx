"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import styles from "./Comments.module.css";

const RATE_LIMIT_MS = 30_000;

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
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const lastSubmitRef = useRef(0);

  useEffect(() => {
    loadComments();
  }, [journalId]);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("journal_id", journalId)
      .order("created_at", { ascending: false });
    setComments(data ?? []);
    setLoading(false);
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      alert("Failed to delete: " + error.message);
      return;
    }
    loadComments();
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Author";
  const effectiveName = user ? (name.trim() || displayName) : name.trim();
  const effectiveEmail = user ? (user.email ?? "") : email.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveName || !effectiveEmail || !body.trim()) return;

    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      alert("Please wait before posting another comment.");
      return;
    }

    setSubmitting(true);
    lastSubmitRef.current = now;

    const { error } = await supabase.from("comments").insert({
      journal_id: journalId,
      name: effectiveName,
      email: effectiveEmail,
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
                <div className={styles.commentMeta}>
                  <time className={styles.commentDate}>
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                  {user && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className={styles.commentBody}>{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {user ? (
          <p className={styles.commentAs}>Commenting as {displayName}</p>
        ) : (
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
        )}
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
          disabled={submitting || !effectiveName || !effectiveEmail || !body.trim()}
          className={styles.submitButton}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
