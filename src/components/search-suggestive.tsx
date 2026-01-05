'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { searchAll } from '@/lib/data';
import type { Movie } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Film, Tv } from 'lucide-react';

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function getYear(dateString: string | undefined) {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
}

export function SearchSuggestive() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length > 1) {
        setIsLoading(true);
        const searchResults = await searchAll(debouncedQuery);
        setResults(searchResults.slice(0, 7)); // Limit to 7 results
        setIsLoading(false);
      } else {
        setResults([]);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setIsFocused(false);
    }
  };

  const handleResultClick = () => {
    setQuery('');
    setIsFocused(false);
  };
  
  const showSuggestions = isFocused && (results.length > 0 || isLoading || query.length > 1);

  return (
    <div className="relative w-full max-w-xs ml-auto" ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search movies, TV shows..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </form>
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full rounded-md border bg-background shadow-lg z-50 overflow-hidden animate-slide-in-from-top">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y">
              {results.map((item, index) => (
                <li key={item.id} className="hover:bg-accent smooth-transition" style={{ animationDelay: `${index * 50}ms` }}>
                  <Link href={`/${item.media_type}/${item.id}`} onClick={handleResultClick} className="flex items-center gap-4 p-3 smooth-transition">
                    <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded-sm bg-muted image-container">
                      {item.poster_path ? (
                        <Image 
                          src={item.poster_path} 
                          alt={item.title} 
                          fill 
                          className="object-cover transition-transform duration-300 ease-out hover:scale-105" 
                          sizes="44px"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Film className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <p className="truncate font-semibold">{item.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {item.media_type === 'movie' ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                            <span>{getYear(item.release_date)}</span>
                        </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No results found for &quot;{query}&quot;</p>
          )}
        </div>
      )}
    </div>
  );
}
