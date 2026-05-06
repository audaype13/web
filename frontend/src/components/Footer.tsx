'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">{t('عن المدونة', 'About the Blog')}</h3>
            <p className="text-muted-foreground text-sm">
              {t(
                'مدونة شخصية ذكية تجمع بين الكتابة البشرية والتعزيز بالذكاء الاصطناعي.',
                'A smart personal blog combining human writing with AI enhancement.'
              )}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">{t('روابط سريعة', 'Quick Links')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">{t('الرئيسية', 'Home')}</a></li>
              <li><a href="/search" className="text-muted-foreground hover:text-primary transition-colors">{t('البحث', 'Search')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">{t('تقنيات الذكاء الاصطناعي', 'AI Features')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('توليد المسودات', 'Draft Generation')}</li>
              <li>{t('البحث الدلالي', 'Semantic Search')}</li>
              <li>{t('بوت الأسئلة', 'Chatbot')}</li>
              <li>{t('تحسين SEO', 'SEO Enhancement')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t('مدونة ذكية. جميع الحقوق محفوظة.', 'Smart Blog. All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
}
