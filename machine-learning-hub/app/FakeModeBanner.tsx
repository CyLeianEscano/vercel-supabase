"use client";

import { useFakeBackend } from "./FakeBackendContext";

export default function FakeModeBanner() {
  const { useFake } = useFakeBackend();

  return (
    <div
      style={{
        position: "fixed",
        top: "0.5rem",
        left: "0.5rem",
        padding: "0.25rem 0.6rem",
        borderRadius: "999px",
        fontSize: 11,
        zIndex: 60,
        background: useFake ? "rgba(22,163,74,0.95)" : "rgba(148,163,184,0.9)",
        color: "#0f172a",
        fontWeight: 600,
      }}
    >
      {useFake
        ? "FAKE MODE: Supabase calls are disabled"
        : "REAL MODE: Supabase is active"}
    </div>
  );
}
