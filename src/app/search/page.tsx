'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { searchAll } from '@/lib/data';
import type { Movie } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { SearchX, Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSearch() {
      if (query) {
        setLoading(true);
        const searchResults = await searchAll(query);
        setResults(searchResults);
        setLoading(false);
      } else {
        setResults([]);
      }
    }
    fetchSearch();
  }, [query]);

  if (loading) {
    return <SearchResultsSkeleton />;
  }

  if (!query) {
    return (
      <div className="text-center text-muted-foreground">
        Please enter a search term to begin.
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-8 font-headline text-3xl font-bold">
        Results for <span className="text-primary">&quot;{query}&quot;</span>
      </h1>
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((movie) => (
            <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No Results Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                We couldn&apos;t find any movies or TV shows matching your search.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                Please try a different search term.
            </p>
        </div>
      )}
    </>
  );
}

function SearchResultsSkeleton() {
    return (
      <div>
        <Skeleton className="h-10 w-1/2 mb-8" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
            ))}
        </div>
      </div>
    )
}

export default function SearchPage() {
    return (
        <div className="container py-8">
            <Suspense fallback={<SearchResultsSkeleton />}>
                <SearchResults />
            </Suspense>
        </div>
    )
}
