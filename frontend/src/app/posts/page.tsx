"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  category: {
    name: string;
    nameEn: string;
  };
  tags: string[];
  readTime: number;
  publishedAt: string;
}

// Mock data - will be replaced with API calls
const mockPosts: Post[] = [];

export default function PostsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isArabic ? "المقالات" : "Articles"}
          </h1>
          <nav className="flex items-center gap-4">
            <Link href="/" className="hover:underline">
              {isArabic ? "الرئيسية" : "Home"}
            </Link>
            <Link href="/posts" className="hover:underline">
              {isArabic ? "المقالات" : "Posts"}
            </Link>
            <Link href="/search" className="hover:underline">
              {isArabic ? "البحث" : "Search"}
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {isArabic 
                  ? "لم يتم العثور على مقالات. قريباً سيتم إضافة مقالات جديدة." 
                  : "No posts found. New articles coming soon."}
              </p>
            </div>
          ) : (
            mockPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                {post.coverImage && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={isArabic ? post.title : post.titleEn}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>
                    <Link href={`/posts/${post.slug}`} className="hover:underline">
                      {isArabic ? post.title : post.titleEn}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? post.excerpt : post.excerptEn}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{post.author.name}</span>
                    <span>·</span>
                    <span>{post.readTime} {isArabic ? "دقيقة" : "min read"}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/posts/${post.slug}`}>
                    <Button variant="outline">
                      {isArabic ? "اقرأ المزيد" : "Read More"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>
    </main>
  );
}