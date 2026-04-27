"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

type FakeUser = { email: string } | null;
type FakeArticle = { id: string; title: string; slug: string; views: number; content: string };

type FakeBackendContextValue = {
  useFake: boolean;
  user: FakeUser;
  login: (email: string) => void;
  logout: () => void;
  getTopArticles: () => FakeArticle[];
  getAllArticles: () => FakeArticle[];
  getArticleBySlug: (slug: string) => FakeArticle | null;
};

const FakeBackendContext = createContext<FakeBackendContextValue | null>(null);

const seedArticles: FakeArticle[] = [
  {
    id: "1",
    title: "Intro to Linear Regression",
    slug: "intro-linear-regression",
    views: 42,
    content: "This is a dummy article about linear regression.",
  },
  {
    id: "2",
    title: "Understanding Neural Networks",
    slug: "understanding-neural-networks",
    views: 31,
    content: "This is a dummy article about neural networks.",
  },
  {
    id: "3",
    title: "Gradient Descent Basics",
    slug: "gradient-descent-basics",
    views: 18,
    content: "This is a dummy article about gradient descent.",
  },
];

export function FakeBackendProvider({ children }: { children: ReactNode }) {
  const useFake = process.env.NEXT_PUBLIC_FAKE_MODE === "true";

  if (typeof window !== "undefined") {
    // This will show in the browser console on every page
    console.log("Fake mode active?", useFake);
  }

  const [user, setUser] = useState<FakeUser>(
    useFake ? { email: "test@example.com" } : null
  );
  const [articles] = useState<FakeArticle[]>(seedArticles);

  const value: FakeBackendContextValue = useMemo(
    () => ({
      useFake,
      user,
      login: (email: string) => {
        if (!useFake) return;
        setUser({ email });
      },
      logout: () => {
        if (!useFake) return;
        setUser(null);
      },
      getTopArticles: () => {
        if (!useFake) return [];
        return [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
      },
      getAllArticles: () => {
        if (!useFake) return [];
        return articles;
      },
      getArticleBySlug: (slug: string) => {
        if (!useFake) return null;
        return articles.find((a) => a.slug === slug) ?? null;
      },
    }),
    [useFake, user, articles]
  );

  return (
    <FakeBackendContext.Provider value={value}>
      {children}
    </FakeBackendContext.Provider>
  );
}

export function useFakeBackend() {
  const ctx = useContext(FakeBackendContext);
  if (!ctx) {
    throw new Error("useFakeBackend must be used inside FakeBackendProvider");
  }
  return ctx;
}
