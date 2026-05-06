"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "en", name: "English", dir: "ltr" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (langCode: string) => {
    const lang = languages.find((l) => l.code === langCode);
    if (!lang) return;

    // Change language
    i18n.changeLanguage(langCode);

    // Update document direction
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = langCode;

    // Persist to localStorage
    localStorage.setItem("i18nextLng", langCode);
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            i18n.language === lang.code
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}