"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { event } from "../lib/analytics";
import styles from "./Auth.module.css";

export default function Auth() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (user) {
    return (
      <div className={styles.authStatus}>
        <span>{user.email}</span>
        <button
          onClick={() => supabase.auth.signOut()}
          className={styles.signOutButton}
        >
          Sign out
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    event("sign_in_attempt");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign-in failed:", error);
      setError("Invalid email or password.");
    } else {
      event("sign_in_success");
    }
    setLoading(false);
  }

  const formContent = (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="current-password"
        className={styles.input}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? "..." : "Sign in"}
      </button>
    </form>
  );

  return (
    <div className={styles.authWrapper} ref={dropdownRef}>
      <div className={styles.desktopForm}>{formContent}</div>
      <div className={styles.mobileDropdown}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={styles.mobileToggle}
          aria-label="Sign in"
        >
          Sign in
        </button>
        {open && <div className={styles.dropdownPanel}>{formContent}</div>}
      </div>
    </div>
  );
}
