'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { api, Category, Tag } from '@/lib/api';

export default function NewPostPage() {
  const { t } = useLanguage();
  const { token, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.categories.list(),
          api.tags.list(),
        ]);
        setCategories(catRes?.categories || []);
        setTags(tagRes?.tags || []);
      } catch {}
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.posts.create({
        ...form,
        author_id: user?.id,
        category_id: form.category_id || null,
      }, token!);
      router.push('/admin');
    } catch (error) {
      alert(t('فشل في إنشاء المقال', 'Failed to create post'));
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'title' && !form.slug) {
      const slug = value.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('مقال جديد', 'New Post')}</h1>
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

        <div>
          <label className="block text-sm font-medium mb-1">{t('الرابط (Slug)', 'URL Slug')}</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium mb-1">{t('الحالة', 'Status')}</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="draft">{t('مسودة', 'Draft')}</option>
              <option value="published">{t('منشور', 'Published')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('وقت القراءة (دقائق)', 'Read Time (min)')}</label>
            <input
              type="number"
              value={form.read_time}
              onChange={(e) => update('read_time', parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
                  form.tag_ids.includes(tag.id)
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
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? t('جاري الحفظ...', 'Saving...') : t('حفظ المقال', 'Save Post')}
          </button>
        </div>
      </form>
    </div>
  );
}
