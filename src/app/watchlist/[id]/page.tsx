
'use client';

import { useParams, notFound } from 'next/navigation';
import { useWatchlist } from '@/hooks/use-watchlist';
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card';
import { Film, Pencil, Move, Trash, X, Upload } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { Watchlist } from '@/contexts/watchlist-context';
import type { Movie } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { searchAll } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type SortOption = 'recently_added' | 'name' | 'release_date';
type FilterOption = 'all' | 'movie' | 'tv';

interface WatchlistPreferences {
  sort: SortOption;
  filter: FilterOption;
}

function capitalizeWords(string: string) {
    if (!string) return '';
    return string.split(/[\s_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Function to get preferences from localStorage
const getPreferences = (watchlistId: string): WatchlistPreferences => {
  if (typeof window === 'undefined') {
    return { sort: 'recently_added', filter: 'all' };
  }
  const savedPrefs = localStorage.getItem(`watchlist_prefs_${watchlistId}`);
  if (savedPrefs) {
    return JSON.parse(savedPrefs);
  }
  return { sort: 'recently_added', filter: 'all' };
};

// Function to set preferences in localStorage
const setPreferences = (watchlistId: string, prefs: WatchlistPreferences) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`watchlist_prefs_${watchlistId}`, JSON.stringify(prefs));
};


export default function SingleWatchlistPage() {
  const { id: watchlistId } = useParams();
  const { getWatchlistById, watchlists, removeMoviesFromWatchlist, moveMoviesToWatchlist, addMoviesToWatchlist, isInitialized } = useWatchlist();
  
  const [watchlist, setWatchlist] = useState<Watchlist | null | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Movie[]>([]);

  const [prefs, setPrefsState] = useState<WatchlistPreferences>({ sort: 'recently_added', filter: 'all' });
  const { sort, filter } = prefs;


  const [isMoveDialogOpen, setMoveDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [destinationWatchlistId, setDestinationWatchlistId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (isInitialized && typeof watchlistId === 'string') {
      const foundWatchlist = getWatchlistById(watchlistId as string);
      setWatchlist(foundWatchlist);
      if (foundWatchlist) {
        setPrefsState(getPreferences(watchlistId as string));
      }
    }
  }, [watchlistId, getWatchlistById, watchlists, isInitialized]);

  const updateAndSavePrefs = (newPrefs: Partial<WatchlistPreferences>) => {
    if (typeof watchlistId !== 'string') return;
    const updatedPrefs = { ...prefs, ...newPrefs };
    setPrefsState(updatedPrefs);
    setPreferences(watchlistId, updatedPrefs);
  };

  const toggleItemSelection = (item: Movie) => {
    setSelectedItems(prev => 
      prev.some(m => m.id === item.id && m.media_type === item.media_type)
        ? prev.filter(m => !(m.id === item.id && m.media_type === item.media_type))
        : [...prev, item]
    );
  };
  
  const filteredAndSortedMovies = useMemo(() => {
    if (!watchlist) return [];
    
    let items = [...watchlist.movies];
    
    // Filtering
    if (filter !== 'all') {
      items = items.filter(movie => movie.media_type === filter);
    }
    
    // Sorting
    switch (sort) {
      case 'name':
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'release_date':
        items.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        break;
      case 'recently_added':
      default:
        // Already sorted by recently added from the context
        break;
    }
    return items;
  }, [watchlist, sort, filter]);

  const handleSelectAll = () => {
    if (selectedItems.length === filteredAndSortedMovies.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAndSortedMovies);
    }
  };

  const handleMassDelete = () => {
    if (typeof watchlistId !== 'string') return;
    removeMoviesFromWatchlist(watchlistId, selectedItems);
    setIsEditMode(false);
    setSelectedItems([]);
  };

  const handleMassMove = () => {
    if (typeof watchlistId !== 'string' || !destinationWatchlistId) return;
    moveMoviesToWatchlist(watchlistId, destinationWatchlistId, selectedItems);
    setMoveDialogOpen(false);
    setIsEditMode(false);
    setSelectedItems([]);
    setDestinationWatchlistId(null);
  }

  const handleImport = async () => {
    if (typeof watchlistId !== 'string' || !importText.trim()) return;

    setIsImporting(true);
    const titles = importText.trim().split('\n').filter(t => t.trim());
    if (titles.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'No titles to import.' });
      setIsImporting(false);
      return;
    }
    
    toast({ title: 'Importing...', description: `Searching for ${titles.length} titles. This may take a moment.` });

    try {
      const searchPromises = titles.map(title => searchAll(title));
      const searchResults = await Promise.all(searchPromises);

      const moviesToAdd: Movie[] = searchResults.map((results, index) => {
        if (results && results.length > 0) {
          return results[0]; // Take the first result
        }
        toast({ variant: 'destructive', title: 'Not Found', description: `Could not find a match for "${titles[index]}".` });
        return null;
      }).filter((movie): movie is Movie => movie !== null);


      if (moviesToAdd.length > 0) {
        await addMoviesToWatchlist(watchlistId, moviesToAdd);
      }
      
      setImportText('');
      setImportDialogOpen(false);
    } catch (error) {
      console.error('Error during import:', error);
      toast({ variant: 'destructive', title: 'Import Failed', description: 'An unexpected error occurred during import.' });
    } finally {
      setIsImporting(false);
    }
  };

  const otherWatchlists = watchlists.filter(w => w.id !== watchlistId);


  if (!isInitialized || watchlist === undefined) {
    return (
        <div className="container py-8">
            <Skeleton className="h-10 w-1/3 mb-4" />
            <Skeleton className="h-8 w-1/4 mb-8" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {[...Array(12)].map((_, i) => (
                    <MovieCardSkeleton key={i} />
                ))}
            </div>
      </div>
    );
  }

  if (watchlist === null) {
    notFound();
  }
  
  const isAllSelected = selectedItems.length > 0 && selectedItems.length === filteredAndSortedMovies.length;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="font-headline text-3xl font-bold">{watchlist.name}</h1>
        <div className="flex items-center gap-2">
            {!isEditMode && (
              <>
                <Dialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" /> Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Titles by Name</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Paste a list of movie or TV show titles below, one title per line.
                      </p>
                      <Textarea
                        placeholder="The Matrix&#x0a;Breaking Bad&#x0a;The Godfather"
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        rows={10}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleImport} disabled={isImporting || !importText.trim()}>
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import Titles
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={() => { setIsEditMode(true); setSelectedItems([]); }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </>
            )}
        </div>
      </div>

      {/* Filters and Sorting */}
      {!isEditMode && watchlist.movies.length > 0 && (
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
                <Button variant={filter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => updateAndSavePrefs({ filter: 'all' })} className="w-24">All</Button>
                <Button variant={filter === 'movie' ? 'default' : 'ghost'} size="sm" onClick={() => updateAndSavePrefs({ filter: 'movie' })} className="w-24">Movies</Button>
                <Button variant={filter === 'tv' ? 'default' : 'ghost'} size="sm" onClick={() => updateAndSavePrefs({ filter: 'tv' })} className="w-24">TV Shows</Button>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                    Sort By: {capitalizeWords(sort)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sort} onValueChange={(v) => updateAndSavePrefs({ sort: v as SortOption })}>
                        <DropdownMenuRadioItem value="recently_added">Recently Added</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="release_date">Release Date</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )}

      {/* Edit Mode Bar */}
      {isEditMode && (
        <div className="sticky top-16 z-40 mb-8 flex flex-col items-start justify-between gap-4 rounded-lg border bg-background/80 p-4 backdrop-blur-sm md:flex-row md:items-center">
            <div className="flex items-center gap-3">
                <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={handleSelectAll} />
                <Label htmlFor="select-all" className="text-base font-medium">
                    {isAllSelected ? 'Deselect All' : 'Select All'} ({selectedItems.length} selected)
                </Label>
            </div>
            <div className="flex items-center gap-2">
                <Dialog open={isMoveDialogOpen} onOpenChange={setMoveDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" disabled={selectedItems.length === 0 || otherWatchlists.length === 0}>
                            <Move className="mr-2" /> Move
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Move {selectedItems.length} items to...</DialogTitle>
                        </DialogHeader>
                         <RadioGroup value={destinationWatchlistId ?? ''} onValueChange={setDestinationWatchlistId} className="my-4 space-y-3">
                            {otherWatchlists.map(list => (
                                <div key={list.id} className="flex items-center space-x-3 rounded-md border p-3">
                                    <RadioGroupItem value={list.id} id={`list-${list.id}`} />
                                    <Label htmlFor={`list-${list.id}`} className="text-base font-medium">
                                        {list.name}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <DialogFooter>
                             <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                             <Button onClick={handleMassMove} disabled={!destinationWatchlistId}>Move Items</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={selectedItems.length === 0}>
                            <Trash className="mr-2" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogDescription>
                            This will permanently delete {selectedItems.length} items from this watchlist. This action cannot be undone.
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleMassDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" onClick={() => setIsEditMode(false)}>
                    <X className="mr-2" /> Done
                </Button>
            </div>
        </div>
      )}

      {/* Grid */}
      {filteredAndSortedMovies.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredAndSortedMovies.map((movie) => (
             <div key={`${movie.id}-${movie.media_type}`} className="relative">
                <MovieCard movie={movie} />
                {isEditMode && (
                    <div className="absolute inset-0 z-10 flex items-start justify-start p-2 bg-black/50 rounded-lg">
                        <Checkbox
                            className="h-6 w-6 border-2"
                            checked={selectedItems.some(m => m.id === movie.id && m.media_type === movie.media_type)}
                            onCheckedChange={() => toggleItemSelection(movie)}
                        />
                    </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">This Watchlist is Empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add some movies and TV shows to see them here.
          </p>
        </div>
      )}
    </div>
  );
}
