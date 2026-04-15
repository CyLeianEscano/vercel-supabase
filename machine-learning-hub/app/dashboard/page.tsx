"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth"); // not logged in, go back to login
      } else {
        setEmail(data.user.email ?? null);
      }
    };
    getUser();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          padding: "2rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.4)",
          background: "rgba(15,23,42,0.95)",
          minWidth: "320px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>
          Dashboard
        </h1>
        <p style={{ marginBottom: "1.5rem" }}>
          {email
            ? `You are logged in as ${email}.`
            : "Checking your session..."}
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "999px",
            border: "none",
            background: "linear-gradient(135deg, #f97316, #ef4444)",
            color: "#020617",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
    </main>
  );
}