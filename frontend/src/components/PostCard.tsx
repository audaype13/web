'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, formatDateAr, cn } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    title_en?: string | null;
    excerpt?: string | null;
    excerpt_en?: string | null;
    cover_image?: string | null;
    read_time: number;
    views: number;
    featured: boolean;
    published_at?: string | null;
    category?: { name: string; slug: string; color?: string } | null;
    tags?: { name: string; slug: string }[];
  };
  className?: string;
}

export default function PostCard({ post, className }: PostCardProps) {
  const { language, t } = useLanguage();

  const title = language === 'en' && post.title_en ? post.title_en : post.title;
  const excerpt = language === 'en' && post.excerpt_en ? post.excerpt_en : post.excerpt;
  const date = post.published_at
    ? language === 'ar'
      ? formatDateAr(post.published_at)
      : formatDate(post.published_at)
    : '';

  return (
    <article
      className={cn(
        'group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      {post.cover_image && (
        <Link href={`/posts/${post.slug}`} className="block relative aspect-video overflow-hidden">
          <Image
            src={post.cover_image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {post.featured && (
            <span className="absolute top-3 start-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {t('مميز', 'Featured')}
            </span>
          )}
        </Link>
      )}

      <div className="p-5">
        {post.category && (
          <Link
            href={`/?category=${post.category.slug}`}
            className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-3"
            style={{
              backgroundColor: post.category.color ? `${post.category.color}20` : '#3b82f620',
              color: post.category.color || '#3b82f6',
            }}
          >
            {language === 'en' ? post.category.name : post.category.name}
          </Link>
        )}

        <Link href={`/posts/${post.slug}`} className="block">
          <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h2>
        </Link>

        {excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{date}</span>
          <span>&middot;</span>
          <span>{post.read_time} min</span>
          <span>&middot;</span>
          <span>{post.views} {t('مشاهدة', 'views')}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.slug}
                className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
