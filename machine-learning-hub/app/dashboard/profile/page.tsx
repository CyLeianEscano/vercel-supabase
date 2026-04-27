"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useNotifications } from "../../NotificationContext";
import { useFakeBackend } from "../../FakeBackendContext";

export default function ProfilePage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { useFake } = useFakeBackend();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (useFake) {
        // In fake mode, skip Supabase and just allow editing local state
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, bio")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        setError(error.message);
      } else if (data) {
        setFullName(data.full_name ?? "");
        setBio(data.bio ?? "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, useFake]);

  const saveProfile = async () => {
    if (useFake) {
      // Just pretend it saved, no backend
      setMessage("Profile saved locally (fake mode, not persisted).");
      addNotification("success", "Profile saved locally (fake mode).");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        bio,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setError(error.message);
      addNotification("error", "Failed to save profile.");
    } else {
      setMessage("Profile saved.");
      addNotification("success", "Profile saved successfully!");
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#e5e7eb",
        }}
      >
        <p>Loading profile…</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          padding: "2rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.4)",
          background: "rgba(15,23,42,0.95)",
          minWidth: "320px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Profile</h1>

        <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
          Full name
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "0.75rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #4b5563",
            background: "#020617",
            color: "#e5e7eb",
          }}
        />

        <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            marginBottom: "0.75rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #4b5563",
            background: "#020617",
            color: "#e5e7eb",
          }}
        />

        {error && (
          <div style={{ color: "#fca5a5", marginBottom: "0.75rem", fontSize: 13 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ color: "#bbf7d0", marginBottom: "0.75rem", fontSize: 13 }}>
            {message}
          </div>
        )}

        <button
          onClick={saveProfile}
          disabled={loading}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "999px",
            border: "none",
            background: "linear-gradient(135deg, #22c55e, #38bdf8)",
            color: "#020617",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            marginRight: "0.5rem",
          }}
        >
          {loading ? "Saving…" : "Save"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "999px",
            border: "1px solid #4b5563",
            background: "transparent",
            color: "#e5e7eb",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Back to dashboard
        </button>
      </div>
    </main>
  );
}
