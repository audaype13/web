'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api, Category, Tag, Post } from '@/lib/api';

export default function EditPostPage() {
  const { slug } = useParams() as { slug: string };
  const { token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    title_en: '',
    content: '',
    content_en: '',
    excerpt: '',
    excerpt_en: '',
    slug: '',
    cover_image: '',
    status: 'draft',
    category_id: '',
    tag_ids: [] as string[],
    read_time: 5,
    featured: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, catRes, tagRes] = await Promise.all([
          api.posts.get(slug),
          api.categories.list(),
          api.tags.list(),
        ]);

        const post = postRes as Post;
        setForm({
          title: post.title || '',
          title_en: post.title_en || '',
          content: post.content || '',
          content_en: post.content_en || '',
          excerpt: post.excerpt || '',
          excerpt_en: post.excerpt_en || '',
          slug: post.slug || '',
          cover_image: post.cover_image || '',
          status: post.status || 'draft',
          category_id: post.category_id || '',
          tag_ids: (post.tag_ids || []).map((id) => String(id)),
          read_time: post.read_time || 5,
          featured: post.featured || false,
        });

        setCategories(catRes.categories || []);
        setTags(tagRes.tags || []);
      } catch {
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      await api.posts.update(slug, {
        ...form,
        category_id: form.category_id || null,
      }, token);
      router.push('/admin');
    } catch (error) {
      alert(t('فشل في حفظ المقال', 'Failed to save post'));
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">{t('جاري التحميل...', 'Loading...')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('تعديل المقال', 'Edit Post')}</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          {t('رجوع', 'Back')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('العنوان (عربي)', 'Title (Arabic)')}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('العنوان (إنجليزي)', 'Title (English)')}</label>
            <input
              type="text"
              value={form.title_en}
              onChange={(e) => update('title_en', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('المحتوى (عربي)', 'Content (Arabic)')}</label>
            <textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              required
              rows={12}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('المحتوى (إنجليزي)', 'Content (English)')}</label>
            <textarea
              value={form.content_en}
              onChange={(e) => update('content_en', e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('الملخص (عربي)', 'Excerpt (Arabic)')}</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('الملخص (إنجليزي)', 'Excerpt (English)')}</label>
            <textarea
              value={form.excerpt_en}
              onChange={(e) => update('excerpt_en', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('الحالة', 'Status')}</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="draft">{t('مسودة', 'Draft')}</option>
              <option value="published">{t('منشور', 'Published')}</option>
              <option value="archived">{t('مؤرشف', 'Archived')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('التصنيف', 'Category')}</label>
            <select
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('بدون', 'None')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('وقت القراءة', 'Read Time')}</label>
            <input
              type="number"
              value={form.read_time}
              onChange={(e) => update('read_time', parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update('featured', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">{t('مميز', 'Featured')}</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('الوسوم (Tags)', 'Tags')}</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  form.tag_ids.includes(String(tag.id))
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:border-primary'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
          </button>
          <Link href={`/posts/${form.slug}`} className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            {t('عرض المقال', 'View Post')}
          </Link>
        </div>
      </form>
    </div>
  );
}
