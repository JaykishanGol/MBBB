
'use client';

import { getDetails } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calendar, Film, Tv, Clapperboard, Bookmark, Check, Link as LinkIcon } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ExternalLinks } from '@/components/external-links';

interface PageProps {
  params: {
    mediaType: 'movie' | 'tv';
    id: string;
  };
}

function formatRuntime(minutes: number | undefined) {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function getYear(dateString: string | undefined) {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
}

function DetailActions({ item }: { item: Movie }) {
  const { 
    watchlists, 
    addMovieToWatchlist, 
    removeMovieFromWatchlist, 
    isMovieInAnyWatchlist, 
    getWatchlistsContainingMovie 
  } = useWatchlist();
  
  const [open, setOpen] = useState(false);

  const isSaved = isMovieInAnyWatchlist(item.id, item.media_type);

  const handleCheckboxChange = (checked: boolean | 'indeterminate', watchlistId: string) => {
    if (checked) {
      addMovieToWatchlist(watchlistId, item);
    } else {
      removeMovieFromWatchlist(watchlistId, item.id, item.media_type);
    }
  };

  return (
    <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
            <div className="flex flex-col gap-3 w-full">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                    <Button 
                        size="lg" 
                        className="w-full font-semibold border-white/20 bg-white/30 backdrop-blur-md hover:bg-white/40"
                    >
                        {isSaved ? (
                        <>
                            <Check className="mr-2" />
                            On Watchlist
                        </>
                        ) : (
                        <>
                            <Bookmark className="mr-2" />
                            Add to Watchlist
                        </>
                        )}
                    </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add to Watchlist</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="font-semibold text-lg">{item.title}</p>
                        {watchlists.length > 0 ? (
                        <div className="space-y-3">
                            {watchlists.map(list => {
                            const isChecked = getWatchlistsContainingMovie(item.id, item.media_type).includes(list.id);
                            return (
                                <div key={list.id} className="flex items-center space-x-3 rounded-md border p-3">
                                <Checkbox
                                    id={`list-${list.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => handleCheckboxChange(checked, list.id)}
                                />
                                <Label htmlFor={`list-${list.id}`} className="text-base font-medium">
                                    {list.name}
                                </Label>
                                </div>
                            );
                            })}
                        </div>
                        ) : (
                            <p className="text-muted-foreground">You don't have any watchlists yet. Go to the watchlist page to create one.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button>Done</Button>
                        </DialogClose>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Button size="lg" className="w-full font-semibold border-white/20 bg-white/30 backdrop-blur-md hover:bg-white/40" asChild>
                    <Link href={`/generate-url/${item.media_type}/${item.id}`}>
                    <LinkIcon className="mr-2" />
                    Generate URL
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}


export default function DetailsPage() {
  const params = useParams();
  const mediaType = params.mediaType as 'movie' | 'tv';
  const id = params.id as string;

  const [item, setItem] = useState<Movie | null>(null);
  const [isBackdropLoaded, setIsBackdropLoaded] = useState(false);
  const [isPosterLoaded, setIsPosterLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
        if (mediaType !== 'movie' && mediaType !== 'tv') {
            notFound();
        }
        const fetchedItem = await getDetails(mediaType, id);
        if (!fetchedItem) {
            notFound();
        }
        setItem(fetchedItem);
    }
    fetchData();
  }, [mediaType, id]);


  if (!item) {
    // TODO: Add a skeleton loader
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative min-h-screen">
      {item.backdrop_path && (
        <Image
          src={item.backdrop_path}
          alt={`Backdrop for ${item.title}`}
          fill
          className={cn(
            'object-cover object-top transition-all duration-1000 ease-in-out',
            isBackdropLoaded ? 'blur-none' : 'blur-md'
          )}
          onLoad={() => setIsBackdropLoaded(true)}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/70" />

      <div className="container relative z-10 py-12 md:py-24">
        <div className="flex w-full flex-col items-start gap-12 lg:flex-row">
          <aside className="w-full self-start lg:w-72 lg:flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-2xl">
                <Image
                  src={item.poster_path}
                  alt={`Poster for ${item.title}`}
                  fill
                  className={cn(
                    'object-cover transition-all duration-1000 ease-in-out',
                    isPosterLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                  )}
                  onLoad={() => setIsPosterLoaded(true)}
                  priority
                  sizes="(max-width: 1024px) 100vw, 288px"
                />
              </div>
              <DetailActions item={item} />
            </div>
          </aside>

          <main className="flex w-full flex-col">
            <div className="flex h-full flex-col space-y-8">
              <div>
                <div className='flex items-center gap-4'>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 p-1 text-primary">
                    {item.media_type === 'movie' ? <Film className='h-5 w-5' /> : <Tv className='h-5 w-5' />}
                  </div>
                  <p className="font-semibold uppercase tracking-widest text-primary">
                      {item.media_type}
                  </p>
                </div>
                <h1 className="mt-4 font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                  {item.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-lg text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span>{item.vote_average.toFixed(1)} / 10</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{getYear(item.release_date)}</span>
                </div>

                {item.media_type === 'movie' && item.runtime ? (
                  <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{formatRuntime(item.runtime)}</span>
                  </div>
                ) : null}

                {item.media_type === 'tv' && item.number_of_seasons && item.number_of_episodes ? (
                  <>
                    <div className="flex items-center gap-2">
                        <Tv className="h-5 w-5" />
                        <span>{item.number_of_seasons} seasons</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clapperboard className="h-5 w-5" />
                        <span>{item.number_of_episodes} episodes</span>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.genres.map((genre) => (
                    <Badge key={genre} variant="outline" className="border-white/50 bg-white/10 backdrop-blur-sm">
                    {genre}
                    </Badge>
                ))}
              </div>

              <ExternalLinks item={item} />

              <div>
                <h2 className="text-xl font-bold">Overview</h2>
                <p className="mt-2 max-w-3xl text-lg text-foreground/80">
                  {item.overview}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
