"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  score: number;
}

export default function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("search.placeholder")}</h1>
          <nav className="flex items-center gap-4">
            <Link href="/">{t("nav.home")}</Link>
            <Link href="/posts">{t("nav.posts")}</Link>
            <Link href="/search">{t("nav.search")}</Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
          <Input
            type="search"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? t("common.loading") : t("nav.search")}
          </Button>
        </form>

        {results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} {t("search.semanticResults")}
            </p>
            {results.map((result) => (
              <div key={result.id} className="p-4 border rounded-lg">
                <Link href={`/posts/${result.slug}`}>
                  <h3 className="text-lg font-semibold hover:underline">
                    {result.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground mt-2">{result.excerpt}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("search.semanticResults")}: {Math.round(result.score * 100)}%
                </p>
              </div>
            ))}
          </div>
        ) : query && !isLoading ? (
          <p className="text-center text-muted-foreground">
            {t("search.noResults")}
          </p>
        ) : null}
      </section>
    </main>
  );
}