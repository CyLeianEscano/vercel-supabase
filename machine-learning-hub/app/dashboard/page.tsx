"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useNotifications } from "../NotificationContext";
import { useFakeBackend } from "../FakeBackendContext";

type TopArticle = { id: string; title: string; views: number };

export default function Dashboard() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { useFake, user: fakeUser, logout: fakeLogout, getTopArticles } =
    useFakeBackend();
  const [email, setEmail] = useState<string | null>(null);
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);

  useEffect(() => {
    const load = async () => {
      if (useFake) {
        if (!fakeUser) {
          router.push("/auth");
          return;
        }
        setEmail(fakeUser.email);
        const fakeTop = getTopArticles();
        setTopArticles(fakeTop);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth");
        return;
      }
      setEmail(data.user.email ?? null);

      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, views")
        .order("views", { ascending: false })
        .limit(5);

      setTopArticles(articles || []);
    };
    load();
  }, [router, useFake, fakeUser, getTopArticles]);

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
            Dashboard
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            {email ? email : "Checking session..."}
          </span>
          <button
            onClick={async () => {
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
            }}
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
              <span>Dashboard home</span>
              <span style={{ fontSize: 10, color: "#9ca3af" }}>Now</span>
            </button>

            <button
              onClick={() => router.push("/dashboard/articles")}
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
              Articles
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
          {/* Page title + subheading */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                marginBottom: "0.25rem",
              }}
            >
              Your reading overview
            </h1>
            <p style={{ fontSize: 14, color: "#9ca3af" }}>
              Track what&apos;s getting attention and dive deeper into ML topics.
            </p>
          </div>

          {/* Two-column news-like layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
              gap: "1.5rem",
            }}
          >
            {/* Left: Top 5 (hero-style first article) */}
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#9ca3af",
                  marginBottom: "0.75rem",
                }}
              >
                Top 5 articles
              </h2>

              {topArticles.length === 0 ? (
                <div
                  style={{
                    borderRadius: "0.9rem",
                    border: "1px dashed rgba(75,85,99,0.9)",
                    padding: "1.25rem",
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))",
                    fontSize: 14,
                    color: "#9ca3af",
                  }}
                >
                  No articles yet. Once you add some content, your most viewed
                  pieces will show up here.
                </div>
              ) : (
                <>
                  {/* Hero top article */}
                  {topArticles[0] && (
                    <div
                      style={{
                        marginBottom: "1.25rem",
                        borderRadius: "1rem",
                        padding: "1.25rem 1.4rem",
                        border: "1px solid rgba(59,130,246,0.5)",
                        background:
                          "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(17,24,39,0.98))",
                        boxShadow:
                          "0 20px 40px rgba(15,23,42,0.8), 0 0 0 1px rgba(30,64,175,0.3)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          color: "#93c5fd",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Top story
                      </div>
                      <h3
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 600,
                          marginBottom: "0.35rem",
                        }}
                      >
                        {topArticles[0].title}
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#9ca3af",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {topArticles[0].views} total views · Most popular on your
                        hub right now.
                      </p>
                      <button
                        onClick={() =>
                          router.push("/dashboard/articles")
                        }
                        style={{
                          padding: "0.45rem 0.85rem",
                          borderRadius: "999px",
                          border: "none",
                          background:
                            "linear-gradient(135deg, #38bdf8, #6366f1)",
                          color: "#020617",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View article page
                      </button>
                    </div>
                  )}

                  {/* Remaining top list */}
                  {topArticles.length > 1 && (
                    <div
                      style={{
                        borderRadius: "0.9rem",
                        border: "1px solid rgba(55,65,81,0.9)",
                        background: "rgba(15,23,42,0.98)",
                        padding: "0.9rem 1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9ca3af",
                          marginBottom: "0.35rem",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>More top articles</span>
                        <span>Views</span>
                      </div>
                      <ol
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          fontSize: 14,
                        }}
                      >
                        {topArticles.slice(1).map((a, idx) => (
                          <li
                            key={a.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.45rem 0",
                              borderTop:
                                idx === 0
                                  ? "1px solid rgba(31,41,55,0.9)"
                                  : "1px solid rgba(17,24,39,0.9)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.45rem",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#9ca3af",
                                  width: 18,
                                }}
                              >
                                #{idx + 2}
                              </span>
                              <span>{a.title}</span>
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                minWidth: 60,
                                textAlign: "right",
                              }}
                            >
                              {a.views}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right: More articles / actions */}
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#9ca3af",
                  marginBottom: "0.75rem",
                }}
              >
                Explore
              </h2>

              <div
                style={{
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(55,65,81,0.9)",
                  background: "rgba(15,23,42,0.98)",
                  padding: "1rem 1.1rem",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  Articles overview
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    marginBottom: "0.7rem",
                  }}
                >
                  See all your content, including pieces that haven&apos;t hit
                  the top 5 yet.
                </p>
                <button
                  onClick={() => router.push("/dashboard/articles")}
                  style={{
                    padding: "0.45rem 0.8rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(75,85,99,0.9)",
                    background: "transparent",
                    color: "#e5e7eb",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Open articles page
                </button>
              </div>

              <div
                style={{
                  borderRadius: "0.9rem",
                  border: "1px dashed rgba(55,65,81,0.9)",
                  background:
                    "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,64,175,0.18))",
                  padding: "1rem 1.1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  Complete your profile
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#cbd5f5",
                    marginBottom: "0.7rem",
                  }}
                >
                  Add a name and bio so your content feels more like a real ML
                  publication.
                </p>
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  style={{
                    padding: "0.45rem 0.8rem",
                    borderRadius: "999px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #22c55e, #38bdf8)",
                    color: "#020617",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Edit profile
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}