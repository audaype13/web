import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">المدونة الشخصية</h1>
          <nav className="flex items-center gap-4">
            <Link href="/" className="hover:underline">
              الرئيسية
            </Link>
            <Link href="/posts" className="hover:underline">
              المقالات
            </Link>
            <Link href="/search" className="hover:underline">
              البحث
            </Link>
          </nav>
        </div>
      </header>
      
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">مدونة شخصية مدعومة بالذكاء الاصطناعي</h2>
        <p className="text-lg text-muted-foreground mb-8">
          اكتشف مقالات مميزة بمساعدة الذكاء الاصطناعي
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/posts" 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            تصفح المقالات
          </Link>
          <Link 
            href="/chat" 
            className="px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent"
          >
            تحدث مع المساعد
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold mb-8 text-center">الميزات الرئيسية</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h4 className="text-xl font-semibold mb-2">توليد المحتوى</h4>
            <p className="text-muted-foreground">
              استخدم الذكاء الاصطناعي لتوليد مسودات مقالاتك
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h4 className="text-xl font-semibold mb-2">تحسين الكتابة</h4>
            <p className="text-muted-foreground">
              حسّن جودة محتواك باستخدام أدوات الذكاء الاصطناعي
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h4 className="text-xl font-semibold mb-2">بحث ذكي</h4>
            <p className="text-muted-foreground">
              ابحث في المقالات باستخدام البحث الدلالي الذكي
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}