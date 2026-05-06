'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { api, Post, Comment, RecommendationResponse } from '@/lib/api';
import { formatDate, formatDateAr } from '@/lib/utils';

interface PostDetail extends Post {
  category: { name: string; slug: string; color: string } | null;
}

export default function PostPage() {
  const { slug } = useParams() as { slug: string };
  const { language, t } = useLanguage();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ author_name: '', author_email: '', content: '' });

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const [postRes, recRes, commentsRes] = await Promise.all([
          api.posts.get(slug),
          api.recommendations(slug),
          api.comments.getByPost(slug),
        ]);

        setPost(postRes as unknown as PostDetail);
        setRecommendations(recRes.posts || []);
        setComments(commentsRes.comments || []);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    try {
      await api.comments.create({
        ...commentForm,
        post_id: post.id,
      });
      setCommentForm({ author_name: '', author_email: '', content: '' });
      const updated = await api.comments.getByPost(post.id);
      setComments(updated.comments || []);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4 mb-4" />
        <div className="h-4 bg-muted rounded w-1/2 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">{t('المقال غير موجود', 'Post not found')}</h2>
        <Link href="/" className="text-primary hover:underline">
          {t('العودة للرئيسية', 'Back to home')}
        </Link>
      </div>
    );
  }

  const title = language === 'en' && post.title_en ? post.title_en : post.title;
  const content = language === 'en' && post.content_en ? post.content_en : post.content;

  return (
    <div className="max-w-3xl mx-auto">
      <article>
        {post.category && (
          <Link
            href={`/?category=${post.category.slug}`}
            className="inline-block text-sm font-medium mb-4"
            style={{ color: post.category.color }}
          >
            {post.category.name}
          </Link>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <span>
            {post.published_at
              ? language === 'ar'
                ? formatDateAr(post.published_at)
                : formatDate(post.published_at)
              : ''}
          </span>
          <span>&middot;</span>
          <span>{post.read_time} {t('دقائق قراءة', 'min read')}</span>
          <span>&middot;</span>
          <span>{post.views} {t('مشاهدة', 'views')}</span>
        </div>

        {post.cover_image && (
          <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
            <img
              src={post.cover_image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose-custom">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>

      {recommendations.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">
            {t('مقالات ذات صلة', 'Related Articles')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec) => (
              <Link
                key={rec.id}
                href={`/posts/${rec.slug}`}
                className="block p-4 border border-border rounded-lg hover:border-primary transition-colors"
              >
                <h3 className="font-medium mb-1 line-clamp-2">{rec.title}</h3>
                {rec.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{rec.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold mb-6">
          {t('التعليقات', 'Comments')} ({comments.length})
        </h2>

        <form onSubmit={handleCommentSubmit} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={commentForm.author_name}
              onChange={(e) => setCommentForm((prev) => ({ ...prev, author_name: e.target.value }))}
              placeholder={t('الاسم', 'Name')}
              required
              className="px-3 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="email"
              value={commentForm.author_email}
              onChange={(e) => setCommentForm((prev) => ({ ...prev, author_email: e.target.value }))}
              placeholder={t('البريد الإلكتروني', 'Email')}
              className="px-3 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <textarea
            value={commentForm.content}
            onChange={(e) => setCommentForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder={t('اكتب تعليقك...', 'Write your comment...')}
            required
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            {t('إرسال التعليق', 'Submit Comment')}
          </button>
        </form>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{comment.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {language === 'ar' ? formatDateAr(comment.created_at) : formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ms-6 space-y-3 border-s-2 border-border ps-4">
                  {comment.replies.map((reply: any) => (
                    <div key={reply.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{reply.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {language === 'ar' ? formatDateAr(reply.created_at) : formatDate(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              {t('لا توجد تعليقات بعد. كن أول من يعلق!', 'No comments yet. Be the first to comment!')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
