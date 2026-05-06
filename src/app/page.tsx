import { Suspense } from 'react';
import HomeContent from '@/components/HomeContent';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />
        ))}
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
