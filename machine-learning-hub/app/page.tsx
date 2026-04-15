
import Link from "next/link";

export default function Home() {
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
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          textAlign: "center",
          borderRadius: "1rem",
          padding: "2.5rem",
          background: "rgba(15,23,42,0.9)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          border: "1px solid rgba(148,163,184,0.35)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "1rem",
            letterSpacing: "0.03em",
          }}
        >
          Machine Learning Hub
        </h1>
        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.6,
            color: "#cbd5f5",
            marginBottom: "2rem",
          }}
        >
          A simple platform to explore machine learning concepts, resources, and
          hands-on examples. Sign in to manage your learning journey and access
          curated content.
        </p>
        <Link
          href="/auth"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.9rem 1.8rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#0f172a",
            background:
              "linear-gradient(135deg, #38bdf8 0%, #22c55e 50%, #a855f7 100%)",
            borderRadius: "999px",
            textDecoration: "none",
            boxShadow: "0 10px 30px rgba(59,130,246,0.5)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
        >
          Go to Login / Sign Up
        </Link>
      </div>
    </main>
  );
}