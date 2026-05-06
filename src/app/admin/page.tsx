'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api, Post, Comment, Category, Tag } from '@/lib/api';

export default function AdminPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'categories' | 'tags'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', name_en: '', slug: '', color: '#3B82F6' });
  const [newTag, setNewTag] = useState({ name: '', slug: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      try {
        const [postsRes, catsRes, tagsRes] = await Promise.all([
          api.posts.list({ page: 1, pageSize: 100 }),
          api.categories.list(),
          api.tags.list(),
        ]);
        setPosts(postsRes.posts || []);
        setCategories(catsRes.categories || []);
        setTags(tagsRes.tags || []);
      } catch {}

      try {
        const commentsRes = await api.comments.getByPost('all');
        setPendingComments((commentsRes.comments || []).filter((c) => c.status === 'pending'));
      } catch {}

      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const handleDeletePost = async (slug: string) => {
    if (!confirm(t('متأكد تحذف هذا المقال؟', 'Are you sure you want to delete this post?')) || !token) return;
    try {
      await api.posts.delete(slug, token);
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch {}
  };

  const handleCreateCategory = async () => {
    if (!token) return;
    try {
      await api.post('/categories/', newCategory, token);
      const catsRes = await api.categories.list();
      setCategories(catsRes.categories || []);
      setNewCategory({ name: '', name_en: '', slug: '', color: '#3B82F6' });
      setShowCategoryForm(false);
    } catch {}
  };

  const handleCreateTag = async () => {
    if (!token) return;
    try {
      await api.post('/tags/', newTag, token);
      const tagsRes = await api.tags.list();
      setTags(tagsRes.tags || []);
      setNewTag({ name: '', slug: '' });
      setShowTagForm(false);
    } catch {}
  };

  const handleApproveComment = async (id: string) => {
    if (!token) return;
    try {
      await api.post(`/comments/${id}/approve`, {}, token);
      setPendingComments((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  const handleRejectComment = async (id: string) => {
    if (!token) return;
    try {
      await api.post(`/comments/${id}/reject`, {}, token);
      setPendingComments((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  if (authLoading || !user) return null;

  const tabs = [
    { key: 'posts' as const, ar: 'المقالات', en: 'Posts', count: posts.length },
    { key: 'comments' as const, ar: 'التعليقات', en: 'Comments', count: pendingComments.length },
    { key: 'categories' as const, ar: 'التصنيفات', en: 'Categories', count: categories.length },
    { key: 'tags' as const, ar: 'الوسوم', en: 'Tags', count: tags.length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('لوحة التحكم', 'Admin Dashboard')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('مرحباً', 'Welcome')}, {user.name} ({user.role})
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            + {t('مقال جديد', 'New Post')}
          </Link>
          <Link
            href="/"
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            {t('عرض الموقع', 'View Site')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground text-sm">{t('المقالات', 'Posts')}</p>
          <p className="text-3xl font-bold mt-1">{posts.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground text-sm">{t('بانتظار الموافقة', 'Pending')}</p>
          <p className="text-3xl font-bold mt-1 text-amber-500">{pendingComments.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground text-sm">{t('التصنيفات', 'Categories')}</p>
          <p className="text-3xl font-bold mt-1">{categories.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground text-sm">{t('الوسوم', 'Tags')}</p>
          <p className="text-3xl font-bold mt-1">{tags.length}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(tab.ar, tab.en)}
            {tab.count > 0 && (
              <span className={`ms-1 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'posts' && (
            <div className="space-y-3">
              {posts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{t('لا توجد مقالات بعد', 'No posts yet')}</p>
                  <Link href="/admin/new" className="text-primary hover:underline mt-2 inline-block">
                    {t('أنشئ أول مقال', 'Create your first post')}
                  </Link>
                </div>
              )}
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{post.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-500/10 text-green-500'
                          : post.status === 'draft'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {t(post.status === 'published' ? 'منشور' : post.status === 'draft' ? 'مسودة' : 'مؤرشف', post.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.views} {t('مشاهدة', 'views')} · {post.read_time} min
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/posts/${post.slug}`} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
                      {t('عرض', 'View')}
                    </Link>
                    <Link href={`/admin/edit/${post.slug}`} className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                      {t('تعديل', 'Edit')}
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post.slug)}
                      className="px-3 py-1.5 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      {t('حذف', 'Delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-3">
              {pendingComments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{t('لا توجد تعليقات بانتظار الموافقة', 'No pending comments')}</p>
                </div>
              )}
              {pendingComments.map((comment) => (
                <div key={comment.id} className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{comment.author_name}</span>
                      {comment.author_email && (
                        <span className="text-sm text-muted-foreground ms-2">{comment.author_email}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mb-3">{comment.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveComment(comment.id)}
                      className="px-3 py-1.5 text-sm bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      {t('موافقة', 'Approve')}
                    </button>
                    <button
                      onClick={() => handleRejectComment(comment.id)}
                      className="px-3 py-1.5 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      {t('رفض', 'Reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="mb-4 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                + {t('إضافة تصنيف', 'Add Category')}
              </button>

              {showCategoryForm && (
                <div className="mb-6 p-4 border border-border rounded-lg bg-card space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder={t('اسم التصنيف (عربي)', 'Category name (Arabic)')}
                      className="px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={newCategory.name_en}
                      onChange={(e) => setNewCategory((prev) => ({ ...prev, name_en: e.target.value }))}
                      placeholder={t('اسم التصنيف (إنجليزي)', 'Category name (English)')}
                      className="px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="slug"
                      className="px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, color: e.target.value }))}
                        className="w-10 h-10 border-0 cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">{t('اللون', 'Color')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreateCategory} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                      {t('حفظ', 'Save')}
                    </button>
                    <button onClick={() => setShowCategoryForm(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-accent">
                      {t('إلغاء', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-border" style={{ backgroundColor: cat.color || undefined }} />
                      <span className="font-medium">{cat.name}</span>
                      {cat.name_en && <span className="text-muted-foreground text-sm">({cat.name_en})</span>}
                    </div>
                    <code className="text-sm text-muted-foreground">{cat.slug}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div>
              <button
                onClick={() => setShowTagForm(!showTagForm)}
                className="mb-4 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                + {t('إضافة وسم', 'Add Tag')}
              </button>

              {showTagForm && (
                <div className="mb-6 p-4 border border-border rounded-lg bg-card space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newTag.name}
                      onChange={(e) => setNewTag((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder={t('اسم الوسم', 'Tag name')}
                      className="px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={newTag.slug}
                      onChange={(e) => setNewTag((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="slug"
                      className="px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreateTag} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                      {t('حفظ', 'Save')}
                    </button>
                    <button onClick={() => setShowTagForm(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-accent">
                      {t('إلغاء', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-muted/80 cursor-default"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
