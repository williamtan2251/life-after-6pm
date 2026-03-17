"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import Editor from "./Editor";
import type { JSONContent } from "@tiptap/react";
import styles from "./JournalForm.module.css";

function extractPreview(json: JSONContent): string {
  let text = "";
  function walk(node: JSONContent) {
    if (node.text) text += node.text;
    if (node.content) node.content.forEach(walk);
  }
  walk(json);
  return text.slice(0, 200);
}

interface Props {
  editId?: string;
  onBack: () => void;
  onSaved: (id: string) => void;
}

export default function JournalForm({ editId, onBack, onSaved }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent | null>(null);
  const [initialContent, setInitialContent] = useState<JSONContent | undefined>(
    undefined
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    supabase
      .from("journals")
      .select("*")
      .eq("id", editId)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setInitialContent(data.content);
          setContent(data.content);
        }
        setLoading(false);
      });
  }, [editId]);

  if (!user) return <p>Please sign in.</p>;
  if (loading) return <p>Loading...</p>;

  async function handleSave() {
    if (!title.trim() || !content || !user) return;
    setSaving(true);

    if (editId) {
      const { error } = await supabase
        .from("journals")
        .update({
          title: title.trim(),
          content,
          preview: extractPreview(content),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editId)
        .eq("author_id", user.id);

      if (error) {
        alert(error.message);
        setSaving(false);
        return;
      }
      onSaved(editId);
    } else {
      const { data, error } = await supabase
        .from("journals")
        .insert({
          title: title.trim(),
          content,
          preview: extractPreview(content),
          author_id: user.id,
        })
        .select("id")
        .single();

      if (error) {
        alert(error.message);
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

      <h1 className={styles.heading}>
        {editId ? "Edit Entry" : "New Entry"}
      </h1>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.titleInput}
      />

      <Editor
        content={initialContent}
        onChange={setContent}
      />

      <button
        onClick={handleSave}
        disabled={saving || !title.trim()}
        className={styles.saveButton}
        style={{ opacity: saving || !title.trim() ? 0.5 : 1 }}
      >
        {saving ? "Saving..." : editId ? "Save" : "Publish"}
      </button>
    </div>
  );
}
