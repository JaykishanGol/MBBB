import type { Movie } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { MovieCard } from './movie-card';

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 font-headline text-2xl font-bold">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: movies.length > 6, // Only loop if there are enough items
        }}
        className="w-full"
      >
        <CarouselContent>
          {movies.map((movie) => (
            <CarouselItem
              key={`${movie.id}-${movie.media_type}`}
              className="basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <div className="p-1">
                <MovieCard movie={movie} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-12" />
        <CarouselNext className="mr-12" />
      </Carousel>
    </section>
  );
}
