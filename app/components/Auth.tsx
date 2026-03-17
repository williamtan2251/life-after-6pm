"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import styles from "./Auth.module.css";

export default function Auth() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        className={styles.input}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? "..." : isSignUp ? "Sign up" : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className={styles.toggleButton}
      >
        {isSignUp ? "Have an account? Sign in" : "Need an account? Sign up"}
      </button>
    </form>
  );
}
