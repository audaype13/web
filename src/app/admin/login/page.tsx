'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register({ email: form.email, password: form.password, name: form.name });
      } else {
        await login(form.email, form.password);
      }
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || t('خطأ في تسجيل الدخول', 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isRegister ? t('إنشاء حساب', 'Create Account') : t('تسجيل الدخول', 'Login')}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('الاسم', 'Name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required={isRegister}
                className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{t('البريد الإلكتروني', 'Email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('كلمة المرور', 'Password')}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading
              ? t('جاري...', 'Loading...')
              : isRegister
              ? t('إنشاء حساب', 'Create Account')
              : t('تسجيل الدخول', 'Login')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isRegister ? (
            <p>
              {t('عندك حساب؟', 'Already have an account?')}{' '}
              <button onClick={() => setIsRegister(false)} className="text-primary hover:underline">
                {t('سجّل دخولك', 'Login')}
              </button>
            </p>
          ) : (
            <p>
              {t('ما عندك حساب؟', 'No account?')}{' '}
              <button onClick={() => setIsRegister(true)} className="text-primary hover:underline">
                {t('سجّل الآن', 'Register now')}
              </button>
            </p>
          )}
        </div>

        <Link href="/" className="block mt-4 text-center text-sm text-muted-foreground hover:text-primary">
          {t('← العودة للمدونة', '← Back to blog')}
        </Link>
      </div>
    </div>
  );
}
