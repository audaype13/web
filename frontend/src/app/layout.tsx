import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI-Powered Personal Blog",
  description: "A bilingual personal blog with AI enhancement features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}