"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { useNotifications } from "../../NotificationContext";
import { useFakeBackend } from "../../FakeBackendContext";

type Article = {
  id: string;
  title: string;
  content: string;
  views: number;
  slug: string;
};

type Comment = {
  id: string;
  author: string;
  body: string;
  created_at: string;
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { useFake, getArticleBySlug, user: fakeUser } = useFakeBackend();

  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const initUserName = async () => {
      if (useFake) {
        if (fakeUser?.email) {
          // use fake user email as default name
          setNewAuthor((prev) => prev || fakeUser.email);
        }
        return;
      }

      // real supabase user: try profile.full_name, fall back to email
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      let displayName: string | null = null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
        .catch(() => ({ data: null as any }));

      if (profile?.full_name) {
        displayName = profile.full_name as string;
      } else if (user.email) {
        displayName = user.email;
      }

      if (displayName) {
        setNewAuthor((prev) => prev || displayName);
      }
    };

    const load = async () => {
      if (useFake) {
        const fake = getArticleBySlug(String(slug));
        if (!fake) {
          setError("Article not found (fake mode).");
        } else {
          setArticle(fake as Article);
        }
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .select("id, title, content, views, slug")
        .eq("slug", slug)
        .single();

      if (error) {
        setError(error.message);
        addNotification("error", "Failed to load article.");
      } else if (data) {
        setArticle(data);

        const { error: updateError } = await supabase
          .from("articles")
          .update({ views: (data.views ?? 0) + 1 })
          .eq("id", data.id);

        if (updateError) {
          console.error("Failed to increment views:", updateError);
        }

        // load comments after we have article.id
        loadComments(data.id);
      }
    };

    const loadComments = async (articleId: string) => {
      setCommentsLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("id, author, body, created_at")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load comments", error);
      } else {
        setComments((data || []) as Comment[]);
      }
      setCommentsLoading(false);
    };

    initUserName();
    load();
  }, [slug, addNotification, useFake, getArticleBySlug, fakeUser]);

  const handleAddComment = async () => {
    if (!article || useFake) {
      addNotification("error", "Comments are disabled in fake mode.");
      return;
    }
    if (!newAuthor.trim() || !newBody.trim()) {
      addNotification("error", "Please fill in your name and comment.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          article_id: article.id,
          author: newAuthor.trim(),
          body: newBody.trim(),
        })
        .select("id, author, body, created_at")
        .single();

      if (error) throw error;

      setComments((prev) => [data as Comment, ...prev]);
      setNewAuthor("");
      setNewBody("");
      addNotification("success", "Comment posted.");
    } catch (err: any) {
      console.error(err);
      addNotification("error", err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          color: "#e5e7eb",
        }}
      >
        <p>{error}</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          color: "#e5e7eb",
        }}
      >
        <p>Loading article…</p>
      </main>
    );
  }

  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(article.title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };

  const renderedParagraphs = article.content
    ? article.content.split(/\n{2,}/).map((block, idx) => (
        <p
          key={idx}
          style={{
            marginBottom: "1.1rem",
            fontSize: 15,
            lineHeight: 1.7,
            color: "#e5e7eb",
          }}
        >
          {block}
        </p>
      ))
    : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(30,64,175,0.15), transparent 55%), #020617",
        color: "#e5e7eb",
        padding: "1.5rem 1rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 820,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: "1rem",
            padding: "0.4rem 0.9rem",
            borderRadius: "999px",
            border: "1px solid #4b5563",
            background: "transparent",
            color: "#e5e7eb",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Back
        </button>

        <article
          style={{
            borderRadius: "1.25rem",
            border: "1px solid rgba(55,65,81,0.9)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.97))",
            padding: "1.75rem 1.9rem",
            boxShadow: "0 24px 45px rgba(15,23,42,0.9)",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            {article.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: 13,
              color: "#9ca3af",
              marginBottom: "1rem",
            }}
          >
            <span>{article.views} views</span>
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: "999px",
                background: "#4b5563",
              }}
            />
            <span>Machine Learning Hub</span>
          </div>

          <div
            style={{
              marginBottom: "1.25rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, color: "#9ca3af" }}>Share:</span>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 13,
                color: "#38bdf8",
                textDecoration: "underline",
              }}
            >
              Twitter
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 13,
                color: "#38bdf8",
                textDecoration: "underline",
              }}
            >
              Facebook
            </a>
            <a
              href={shareLinks.reddit}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 13,
                color: "#38bdf8",
                textDecoration: "underline",
              }}
            >
              Reddit
            </a>
          </div>

          <div>{renderedParagraphs}</div>
        </article>

        {/* Comments section */}
        <section
          style={{
            borderRadius: "1rem",
            border: "1px solid rgba(31,41,55,0.9)",
            background: "rgba(15,23,42,0.96)",
            padding: "1.25rem 1.4rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Comments
          </h2>

          {/* Add comment form */}
          <div
            style={{
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(31,41,55,0.9)",
            }}
          >
            {useFake && (
              <p
                style={{
                  fontSize: 12,
                  color: "#f97316",
                  marginBottom: "0.5rem",
                }}
              >
                Comments are disabled in fake mode (no Supabase).
              </p>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <input
                type="text"
                placeholder="Your name"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                disabled={useFake || submitting}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "#e5e7eb",
                  fontSize: 13,
                }}
              />
              <textarea
                placeholder="Write a comment..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                disabled={useFake || submitting}
                rows={3}
                style={{
                  padding: "0.6rem 0.75rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "#e5e7eb",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleAddComment}
                  disabled={useFake || submitting}
                  style={{
                    padding: "0.45rem 0.9rem",
                    borderRadius: "999px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #22c55e, #38bdf8)",
                    color: "#020617",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor:
                      useFake || submitting ? "default" : "pointer",
                    opacity: useFake || submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Posting..." : "Post comment"}
                </button>
              </div>
            </div>
          </div>

          {/* Comments list */}
          {commentsLoading && (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              Loading comments…
            </p>
          )}

          {!commentsLoading && comments.length === 0 && (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              No comments yet. Be the first to share your thoughts.
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "0.6rem 0.75rem",
                  borderRadius: "0.9rem",
                  background: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(31,41,55,0.9)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.2rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#e5e7eb",
                    }}
                  >
                    {c.author}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                    }}
                  >
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#e5e7eb",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
