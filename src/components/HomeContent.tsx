'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { api, PostWithCategory, Category } from '@/lib/api';
import PostCard from '@/components/PostCard';
import { cn } from '@/lib/utils';

export default function HomeContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [posts, setPosts] = useState<PostWithCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          api.posts.list({
            page,
            pageSize: 12,
            category: categoryFilter || undefined,
          }),
          api.categories.list(),
        ]);

        setPosts(postsRes.posts || []);
        setTotal(postsRes.total || 0);
        setCategories(categoriesRes.categories || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, categoryFilter]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('مرحباً بك في المدونة الذكية', 'Welcome to the Smart Blog')}
        </h1>
        <p className="text-muted-foreground">
          {t(
            'استكشف مقالات مميزة مدعومة بالذكاء الاصطناعي',
            'Explore AI-powered featured articles'
          )}
        </p>
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('category');
              window.history.pushState({}, '', url.toString());
              window.dispatchEvent(new PopStateEvent('popstate'));
              setPage(1);
            }}
            className={cn(
              'px-3 py-1.5 text-sm rounded-full border transition-colors',
              !categoryFilter
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary'
            )}
          >
            {t('الكل', 'All')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('category', cat.slug);
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
                setPage(1);
              }}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full border transition-colors',
                categoryFilter === cat.slug
                  ? 'border-primary text-primary-foreground'
                  : 'border-border hover:border-primary'
              )}
              style={{
                backgroundColor: categoryFilter === cat.slug ? (cat.color || undefined) : 'transparent',
                color: categoryFilter === cat.slug ? '#fff' : (cat.color || undefined),
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">{t('لا توجد مقالات بعد', 'No posts yet')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {total > 12 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {t('السابق', 'Previous')}
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                {t('صفحة', 'Page')} {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 12 >= total}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {t('التالي', 'Next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
