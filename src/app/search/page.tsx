'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';

export default function SearchPage() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [mode, setMode] = useState<'semantic' | 'keyword' | 'hybrid'>('hybrid');

  useEffect(() => {
    if (!query) return;

    const search = async () => {
      setLoading(true);
      try {
        const data = await api.search(query, mode) as { results: any[] };
        setResults(data.results || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query, mode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', searchQuery.trim());
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('البحث', 'Search')}</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ابحث عن مقالات...', 'Search for articles...')}
            className="flex-1 px-4 py-3 border border-border rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            {t('ابحث', 'Search')}
          </button>
        </div>
      </form>

      <div className="flex gap-2 mb-6">
        {(['hybrid', 'semantic', 'keyword'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              mode === m
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary'
            }`}
          >
            {m === 'hybrid'
              ? t('هجين', 'Hybrid')
              : m === 'semantic'
              ? t('دلالي', 'Semantic')
              : t('كلمات', 'Keyword')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 && query ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">
            {t('لم يتم العثور على نتائج', 'No results found')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t('نتائج البحث', 'Search results')}: {results.length}
          </p>

          {results.map((result, i) => (
            <Link
              key={`${result.id}-${i}`}
              href={`/posts/${result.slug || result.id}`}
              className="block p-5 border border-border rounded-xl hover:border-primary transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                    {language === 'en' && result.title_en
                      ? result.title_en
                      : result.title}
                  </h3>
                  {result.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.excerpt}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    {result.category && <span>{result.category}</span>}
                    {result.search_type && (
                      <span className="px-1.5 py-0.5 bg-muted rounded">
                        {result.search_type === 'semantic'
                          ? t('دلالي', 'Semantic')
                          : t('كلمات', 'Keyword')}
                      </span>
                    )}
                  </div>
                </div>
                {result.score && (
                  <span className="text-xs text-muted-foreground ms-4">
                    {Math.round(result.score * 100)}%
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
