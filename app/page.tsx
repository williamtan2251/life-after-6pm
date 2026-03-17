"use client";

import { useState } from "react";
import { useAuth } from "./lib/auth-context";
import Auth from "./components/Auth";
import JournalList from "./components/JournalList";
import JournalDetail from "./components/JournalDetail";
import JournalForm from "./components/JournalForm";
import styles from "./page.module.css";

type View =
  | { kind: "list" }
  | { kind: "detail"; id: string }
  | { kind: "new" }
  | { kind: "edit"; id: string };

export default function Home() {
  const { user } = useAuth();
  const [view, setView] = useState<View>({ kind: "list" });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          onClick={() => setView({ kind: "list" })}
          className={styles.title}
        >
          Life After 6PM
        </button>
        <div className={styles.headerRight}>
          {user && view.kind === "list" && (
            <button
              onClick={() => setView({ kind: "new" })}
              className={styles.newButton}
            >
              + New Entry
            </button>
          )}
          <Auth />
        </div>
      </header>

      <main className={styles.main}>
        {view.kind === "list" && (
          <JournalList onSelect={(id) => setView({ kind: "detail", id })} />
        )}
        {view.kind === "detail" && (
          <JournalDetail
            id={view.id}
            onBack={() => setView({ kind: "list" })}
            onEdit={(id) => setView({ kind: "edit", id })}
          />
        )}
        {view.kind === "new" && (
          <JournalForm
            onBack={() => setView({ kind: "list" })}
            onSaved={(id) => setView({ kind: "detail", id })}
          />
        )}
        {view.kind === "edit" && (
          <JournalForm
            editId={view.id}
            onBack={() => setView({ kind: "detail", id: view.id })}
            onSaved={(id) => setView({ kind: "detail", id })}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>2026 &copy; William Tan</p>
      </footer>
    </div>
  );
}
