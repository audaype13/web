import { Suspense } from 'react';
import SearchContent from '@/components/SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded-xl animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
