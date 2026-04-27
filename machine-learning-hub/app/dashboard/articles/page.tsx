"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useNotifications } from "../../NotificationContext";
import { useFakeBackend } from "../../FakeBackendContext";

type Article = {
  id: string;
  title: string;
  slug: string;
  views: number;
};

export default function ArticlesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { useFake, getAllArticles, user: fakeUser, logout: fakeLogout } =
    useFakeBackend();
  const [articles, setArticles] = useState<Article[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (useFake) {
        if (!fakeUser) {
          router.push("/auth");
          return;
        }
        setEmail(fakeUser.email);
        const fakeArticles = getAllArticles();
        setArticles(fakeArticles);
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/auth");
        return;
      }
      setEmail(userData.user.email ?? null);

      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, views")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        addNotification("error", "Failed to load articles.");
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    };

    load();
  }, [addNotification, useFake, getAllArticles, fakeUser, router]);

  const handleLogout = async () => {
    if (useFake) {
      fakeLogout();
      addNotification("success", "Logged out (fake mode).");
      router.push("/");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      addNotification("error", "Failed to log out.");
      return;
    }
    addNotification("success", "Logged out.");
    router.push("/");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#020617",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Top navigation */}
      <header
        style={{
          borderBottom: "1px solid rgba(31,41,55,0.9)",
          padding: "0.75rem 1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(to right, rgba(15,23,42,0.97), rgba(15,23,42,0.9))",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
            ML HUB
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#9ca3af",
              padding: "0.1rem 0.45rem",
              borderRadius: "999px",
              border: "1px solid rgba(55,65,81,0.9)",
            }}
          >
            Articles
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            {email ?? "Checking session..."}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              color: "#020617",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main layout: sidebar + content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            width: 220,
            borderRight: "1px solid rgba(31,41,55,0.9)",
            padding: "1.25rem 1rem",
            background:
              "radial-gradient(circle at top, rgba(15,23,42,0.98), #020617)",
          }}
        >
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              fontSize: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                marginBottom: "0.45rem",
              }}
            >
              Overview
            </span>

            <button
              onClick={() => router.push("/dashboard")}
              style={{
                textAlign: "left",
                padding: "0.45rem 0.75rem",
                borderRadius: "0.55rem",
                border: "none",
                background: "transparent",
                color: "#cbd5f5",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Dashboard home
            </button>

            <button
              style={{
                textAlign: "left",
                padding: "0.45rem 0.75rem",
                borderRadius: "0.55rem",
                border: "none",
                background: "rgba(15,23,42,0.9)",
                color: "#e5e7eb",
                cursor: "default",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Articles</span>
              <span style={{ fontSize: 10, color: "#9ca3af" }}>Feed</span>
            </button>

            <button
              onClick={() => router.push("/dashboard/profile")}
              style={{
                textAlign: "left",
                padding: "0.45rem 0.75rem",
                borderRadius: "0.55rem",
                border: "none",
                background: "transparent",
                color: "#cbd5f5",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Profile
            </button>
          </nav>
        </aside>

        {/* Content area */}
        <section
          style={{
            flex: 1,
            padding: "1.5rem 2rem",
            overflowY: "auto",
            background:
              "radial-gradient(circle at top left, rgba(30,64,175,0.15), transparent 55%), #020617",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <h1
              style={{
                fontSize: "1.7rem",
                fontWeight: 700,
                marginBottom: "0.25rem",
              }}
            >
              Articles feed
            </h1>
            <p style={{ fontSize: 14, color: "#9ca3af" }}>
              All your pieces in reverse chronological order. Click to open an
              article.
            </p>
          </div>

          {loading && (
            <p style={{ fontSize: 14, color: "#9ca3af" }}>
              Loading articles…
            </p>
          )}

          {error && !loading && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                background: "rgba(127,29,29,0.2)",
                border: "1px solid rgba(239,68,68,0.7)",
                color: "#fecaca",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {!loading && articles.length === 0 && !error && (
            <div
              style={{
                padding: "1rem 1.1rem",
                borderRadius: "0.9rem",
                border: "1px dashed rgba(55,65,81,0.9)",
                background: "rgba(15,23,42,0.96)",
                fontSize: 14,
                color: "#9ca3af",
              }}
            >
              No articles yet. Once you start adding content, it will show up
              here as a chronological feed.
            </div>
          )}

          {!loading && articles.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
                marginTop: "0.5rem",
              }}
            >
              {articles.map((a, index) => (
                <article
                  key={a.id}
                  style={{
                    borderRadius: "1rem",
                    border:
                      index === 0
                        ? "1px solid rgba(59,130,246,0.6)"
                        : "1px solid rgba(55,65,81,0.9)",
                    background:
                      index === 0
                        ? "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(17,24,39,0.98))"
                        : "rgba(15,23,42,0.97)",
                    padding: "0.9rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    cursor: "pointer",
                    boxShadow:
                      index === 0
                        ? "0 16px 30px rgba(15,23,42,0.85)"
                        : "none",
                  }}
                  onClick={() => router.push(`/articles/${a.slug}`)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          marginRight: "0.5rem",
                        }}
                      >
                        #{articles.length - index}
                      </span>
                      <h2
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        {a.title}
                      </h2>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.views} views
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    {index === 0
                      ? "Most recently added article."
                      : "Earlier piece from your archive."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
