
import Image from "next/image";
import { getPopular, getTopRated, getUpcoming } from "@/lib/data";
import { MovieCarousel } from "@/components/movie-carousel";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

async function PopularMoviesCarousel() {
  const movies = await getPopular('movie');
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
      <MovieCarousel title="Popular Movies" movies={movies} />
    </div>
  );
}

async function TopRatedTvCarousel() {
  const shows = await getTopRated('tv');
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
      <MovieCarousel title="Top Rated TV Shows" movies={shows} />
    </div>
  );
}

async function UpcomingMoviesCarousel() {
  const movies = await getUpcoming('movie');
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
      <MovieCarousel title="Upcoming Movies" movies={movies} />
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="container space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex space-x-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1/5">
            <Skeleton className="aspect-[2/3]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {

  return (
    <div className="space-y-16 pb-16 pt-12">
      <main className="container space-y-12">
        <Suspense fallback={<CarouselSkeleton />}>
          <PopularMoviesCarousel />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <TopRatedTvCarousel />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <UpcomingMoviesCarousel />
        </Suspense>
      </main>
    </div>
  );
}
