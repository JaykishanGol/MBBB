
'use client';

import Image from 'next/image';
import { Film } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function MovieCard({ movie }: { movie: Movie }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link href={`/${movie.media_type}/${movie.id}`} className="block h-full w-full group/card">
      <Card className="group-hover/card:border-primary group-hover/card:shadow-xl group-hover/card:-translate-y-1 group-focus-visible/card:ring-2 group-focus-visible/card:ring-ring group-focus-visible/card:ring-offset-2 relative h-full w-full overflow-hidden rounded-lg border-2 border-transparent transition-all duration-300 ease-out aspect-[2/3]">
        <div className="overflow-hidden h-full">
          {movie.poster_path ? (
            <Image
              src={movie.poster_path}
              alt={`Poster for ${movie.title}`}
              fill
              className={cn(
                "h-full w-full object-cover transition-all duration-700 ease-out group-hover/card:scale-105",
                isLoaded ? 'scale-100 opacity-100 blur-none' : 'scale-105 opacity-0 blur-sm'
              )}
              onLoad={() => setIsLoaded(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="aspect-[2/3] w-full bg-muted flex items-center justify-center">
              <Film className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transition-transform duration-300 ease-out group-hover/card:translate-y-0">
          <h3 className="truncate font-headline text-lg font-bold leading-tight">
            {movie.title}
          </h3>
        </div>
      </Card>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return <Skeleton className="h-full w-full rounded-lg aspect-[2/3]" />;
}
