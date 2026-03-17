"use client";

import { useCallback, useEffect, useState } from "react";
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

function parseHash(hash: string): View {
  const h = hash.replace(/^#\/?/, "");
  if (h.startsWith("journal/")) return { kind: "detail", id: h.slice(8) };
  if (h.startsWith("edit/")) return { kind: "edit", id: h.slice(5) };
  if (h === "new") return { kind: "new" };
  return { kind: "list" };
}

function viewToHash(view: View): string {
  switch (view.kind) {
    case "detail": return `#journal/${view.id}`;
    case "edit": return `#edit/${view.id}`;
    case "new": return "#new";
    case "list": return "";
  }
}

export default function Home() {
  const { user } = useAuth();
  const [view, setView] = useState<View>({ kind: "list" });

  // Read initial hash on mount
  useEffect(() => {
    setView(parseHash(window.location.hash));
  }, []);

  // Listen for back/forward navigation
  useEffect(() => {
    function onHashChange() {
      setView(parseHash(window.location.hash));
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Update hash when view changes
  const navigate = useCallback((v: View) => {
    const hash = viewToHash(v);
    if (hash) {
      window.location.hash = hash;
    } else {
      // Remove hash without adding history entry for going home
      history.replaceState(null, "", window.location.pathname);
      setView(v);
    }
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          onClick={() => navigate({ kind: "list" })}
          className={styles.title}
        >
          <img src="/life-after-6pm/favicon.svg" alt="" className={styles.titleIcon} />
          Life After 6PM
        </button>
        <div className={styles.headerRight}>
          {user && view.kind === "list" && (
            <button
              onClick={() => navigate({ kind: "new" })}
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
          <JournalList onSelect={(id) => navigate({ kind: "detail", id })} />
        )}
        {view.kind === "detail" && (
          <JournalDetail
            id={view.id}
            onBack={() => navigate({ kind: "list" })}
            onEdit={(id) => navigate({ kind: "edit", id })}
          />
        )}
        {view.kind === "new" && (
          <JournalForm
            onBack={() => navigate({ kind: "list" })}
            onSaved={(id) => navigate({ kind: "detail", id })}
          />
        )}
        {view.kind === "edit" && (
          <JournalForm
            editId={view.id}
            onBack={() => navigate({ kind: "detail", id: view.id })}
            onSaved={(id) => navigate({ kind: "detail", id })}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>2026 &copy; William Tan</p>
      </footer>
    </div>
  );
}
