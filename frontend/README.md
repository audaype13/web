# AI-Powered Personal Blog - Frontend

Next.js 14 frontend for the AI-powered personal blog application.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components (base setup)
- **i18n Support** for Arabic and English
- **RTL/LTR** support for bilingual content
- **Dark/Light Mode** theming
- **Chat Interface** for AI chatbot

## Project Structure

```
frontend/
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   ├── posts/         # Posts listing page
│   │   ├── search/        # Search page
│   │   └── chat/          # Chat interface
│   ├── components/
│   │   ├── ui/            # shadcn/ui base components
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── language-switcher.tsx
│   │   └── i18n-provider.tsx
│   ├── lib/
│   │   ├── utils.ts       # Utility functions
│   │   └── i18n.ts        # i18n configuration
│   └── locales/           # Translation files
│       ├── ar.json        # Arabic translations
│       └── en.json        # English translations
├── public/                # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm start
```

## Configuration

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
# Add OAuth credentials...
```

## Requirements Met

- Requirement 19.1: Mobile responsive design (via Tailwind CSS)
- Requirement 19.2: Tablet responsive design 
- Requirement 19.3: Desktop responsive design
- Requirement 19.4: Cross-device usability

## Notes

- This is the frontend-only setup. The backend is a separate Python/FastAPI application.
- Components use CSS variables for theming that integrate with shadcn/ui
- i18n defaults to Arabic (RTL) as the primary language
- API integration points are prepared but require backend connection