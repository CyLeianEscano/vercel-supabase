"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(
          "Sign-up successful. If email confirmation is enabled, check your email."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Login successful!");
        setTimeout(() => router.push("/dashboard"), 1000);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        padding: "1.5rem",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2rem",
          borderRadius: "1rem",
          background: "rgba(15,23,42,0.95)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          border: "1px solid rgba(148,163,184,0.4)",
        }}
      >
        <h1
          style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}
        >
          {mode === "signup" ? "Create an account" : "Welcome back"}
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "1.5rem", fontSize: 14 }}>
          {mode === "signup"
            ? "Sign up to start using Machine Learning Hub."
            : "Log in to continue your ML learning journey."}
        </p>

        <label
          style={{ display: "block", fontSize: 14, marginBottom: "0.25rem" }}
        >
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: "0.5rem",
            border: "1px solid #4b5563",
            background: "#020617",
            color: "#e5e7eb",
            marginBottom: "0.9rem",
            fontSize: 14,
          }}
        />

        <label
          style={{ display: "block", fontSize: 14, marginBottom: "0.25rem" }}
        >
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: "0.5rem",
            border: "1px solid #4b5563",
            background: "#020617",
            color: "#e5e7eb",
            marginBottom: "1.2rem",
            fontSize: 14,
          }}
        />

        {error && (
          <div
            style={{
              marginBottom: "0.8rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              fontSize: 13,
              background: "rgba(239,68,68,0.1)",
              color: "#fca5a5",
              border: "1px solid rgba(248,113,113,0.6)",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              marginBottom: "0.8rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              fontSize: 13,
              background: "rgba(34,197,94,0.08)",
              color: "#bbf7d0",
              border: "1px solid rgba(74,222,128,0.6)",
            }}
          >
            {message}
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.7rem 1rem",
            borderRadius: "999px",
            border: "none",
            cursor: loading ? "default" : "pointer",
            fontWeight: 600,
            fontSize: 15,
            background:
              mode === "signup"
                ? "linear-gradient(135deg, #22c55e, #38bdf8)"
                : "linear-gradient(135deg, #38bdf8, #6366f1)",
            color: "#020617",
            opacity: loading ? 0.7 : 1,
            marginBottom: "0.75rem",
          }}
        >
          {loading
            ? mode === "signup"
              ? "Creating account..."
              : "Logging in..."
            : mode === "signup"
            ? "Sign Up"
            : "Login"}
        </button>

        <button
          type="button"
          onClick={() =>
            setMode((prev) => (prev === "signup" ? "login" : "signup"))
          }
          style={{
            width: "100%",
            padding: "0.55rem 1rem",
            borderRadius: "999px",
            border: "1px solid #4b5563",
            background: "transparent",
            color: "#e5e7eb",
            fontSize: 13,
            cursor: "pointer",
            marginBottom: "0.5rem",
          }}
        >
          {mode === "signup"
            ? "Already have an account? Switch to Login"
            : "Need an account? Switch to Sign Up"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            padding: "0.45rem 1rem",
            borderRadius: "999px",
            border: "none",
            background: "transparent",
            color: "#9ca3af",
            fontSize: 13,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Back to Landing Page
        </button>
      </div>
    </main>
  );
}