'use client';

import type { Movie } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from './auth-context';

const supabase = createClient();

export interface Watchlist {
  id: string;
  name: string;
  movies: Movie[];
}

interface WatchlistContextType {
  watchlists: Watchlist[];
  isInitialized: boolean;
  initializeUserWatchlists: () => Promise<void>;
  createWatchlist: (name: string) => Promise<void>;
  deleteWatchlist: (id: string) => Promise<void>;
  updateWatchlistName: (id: string, newName: string) => Promise<void>;
  addMovieToWatchlist: (watchlistId: string, movie: Movie) => Promise<void>;
  addMoviesToWatchlist: (watchlistId: string, movies: Movie[]) => Promise<void>;
  removeMovieFromWatchlist: (watchlistId: string, movieId: number, mediaType: 'movie' | 'tv') => Promise<void>;
  removeMoviesFromWatchlist: (watchlistId: string, movies: Movie[]) => Promise<void>;
  moveMoviesToWatchlist: (sourceWatchlistId: string, destinationWatchlistId: string, movies: Movie[]) => Promise<void>;
  isMovieInAnyWatchlist: (movieId: number, mediaType: 'movie' | 'tv') => boolean;
  getWatchlistsContainingMovie: (movieId: number, mediaType: 'movie' | 'tv') => string[];
  getWatchlistById: (id: string) => Watchlist | null;
}

export const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchWatchlists = useCallback(async () => {
    if (!user) {
        setWatchlists([]);
        setIsInitialized(false);
        return;
    };

    try {
        const { data, error, count } = await supabase
            .from('watchlists')
            .select('*, watchlist_items(*, movie_data)', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { foreignTable: 'watchlist_items', ascending: false });


        if (error) throw error;
        
        const formattedWatchlists = data.map(list => ({
            id: list.id,
            name: list.name,
            movies: list.watchlist_items.map((item: any) => item.movie_data)
        }));
        setWatchlists(formattedWatchlists);
        if (count !== null) {
            setIsInitialized(true);
        }

    } catch (error) {
        console.error("Error fetching watchlists:", error)
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch watchlists.' });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchWatchlists();
  }, [user, fetchWatchlists]);

  const initializeUserWatchlists = async () => {
    if (!user) return;
    try {
        const { error } = await supabase
            .from('watchlists')
            .insert({ name: 'My Watchlist', user_id: user.id });
        if (error) throw error;

        await fetchWatchlists();
        toast({ title: 'Success', description: 'Your first watchlist has been created.' });
    } catch (error) {
        console.error("Error initializing watchlist:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create a default watchlist.' });
    }
  };


  const createWatchlist = async (name: string) => {
    if (!user) return;
    try {
        const { data, error } = await supabase
            .from('watchlists')
            .insert({ name, user_id: user.id })
            .select();
            
        if (error) throw error;

        if (data && data.length > 0) {
            setWatchlists(prev => [...prev, {...data[0], movies:[]}]);
            toast({ title: 'Watchlist Created', description: `"${name}" has been created.` });
        } else {
            throw new Error('No data returned after insert');
        }
    } catch (error) {
        console.error('Error creating watchlist:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create watchlist.' });
    }
  };

  const deleteWatchlist = async (id: string) => {
    const listToDelete = watchlists.find(w => w.id === id);
    if (!listToDelete) return;

    try {
        const { error } = await supabase.from('watchlists').delete().eq('id', id);
        if (error) throw error;
        setWatchlists(prev => prev.filter(w => w.id !== id));
        toast({ title: 'Watchlist Deleted', description: `"${listToDelete.name}" has been deleted.` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete watchlist.' });
    }
  };

  const updateWatchlistName = async (id: string, newName: string) => {
    try {
        const { error } = await supabase.from('watchlists').update({ name: newName }).eq('id', id);
        if (error) throw error;
        setWatchlists(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
        toast({ title: 'Watchlist Updated', description: `Watchlist has been renamed to "${newName}".` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not rename watchlist.' });
    }
  };

  const addMovieToWatchlist = async (watchlistId: string, movie: Movie) => {
    const list = watchlists.find(w => w.id === watchlistId);
    if (!list) return;

    if (list.movies.some(m => m.id === movie.id && m.media_type === movie.media_type)) {
      toast({ variant: 'default', title: 'Already in Watchlist', description: `${movie.title} is already in "${list.name}".` });
      return;
    }

    try {
        const { error } = await supabase.from('watchlist_items').insert({
            watchlist_id: watchlistId,
            movie_id: movie.id,
            media_type: movie.media_type,
            movie_data: movie,
        });
        if (error) throw error;
        // Re-fetch all lists to get correct sorting
        await fetchWatchlists();
        toast({ title: 'Added to Watchlist', description: `${movie.title} has been added to "${list.name}".` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add movie to watchlist.' });
    }
  };

  const addMoviesToWatchlist = async (watchlistId: string, movies: Movie[]) => {
    const list = watchlists.find(w => w.id === watchlistId);
    if (!list || movies.length === 0) return;

    const newMovies = movies.filter(movie => 
      !list.movies.some(m => m.id === movie.id && m.media_type === movie.media_type)
    );

    if (newMovies.length === 0) {
      toast({ title: 'All Items Exist', description: 'All the imported items are already in this watchlist.' });
      return;
    }

    const itemsToInsert = newMovies.map(movie => ({
      watchlist_id: watchlistId,
      movie_id: movie.id,
      media_type: movie.media_type,
      movie_data: movie
    }));

    try {
      const { error } = await supabase.from('watchlist_items').insert(itemsToInsert);
      if (error) throw error;

      await fetchWatchlists();
      toast({ title: 'Import Successful', description: `${newMovies.length} new items have been added to "${list.name}".` });
    } catch(error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not import items.' });
      console.error("Error batch adding movies:", error);
    }
  }

  const removeMovieFromWatchlist = async (watchlistId: string, movieId: number, mediaType: 'movie' | 'tv') => {
    const list = watchlists.find(w => w.id === watchlistId);
    const movie = list?.movies.find(m => m.id === movieId && m.media_type === mediaType);
    if (!list || !movie) return;

    try {
        const { error } = await supabase.from('watchlist_items').delete()
            .eq('watchlist_id', watchlistId)
            .eq('movie_id', movieId)
            .eq('media_type', mediaType);
        if (error) throw error;
        setWatchlists(prev => prev.map(w => w.id === watchlistId ? { ...w, movies: w.movies.filter(m => !(m.id === movieId && m.media_type === mediaType)) } : w));
        toast({ title: 'Removed from Watchlist', description: `${movie.title} has been removed from "${list.name}".` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not remove movie from watchlist.' });
    }
  };

  const removeMoviesFromWatchlist = async (watchlistId: string, moviesToRemove: Movie[]) => {
    const list = watchlists.find(w => w.id === watchlistId);
    if (!list) return;

    const movieIdsToRemove = moviesToRemove.map(m => m.id);

    try {
      const { error } = await supabase.from('watchlist_items').delete()
        .eq('watchlist_id', watchlistId)
        .in('movie_id', movieIdsToRemove);

      if (error) throw error;

      setWatchlists(prev => prev.map(w => w.id === watchlistId 
        ? { ...w, movies: w.movies.filter(m => !movieIdsToRemove.includes(m.id)) } 
        : w
      ));
      toast({ title: 'Items Removed', description: `${moviesToRemove.length} items have been removed from "${list.name}".` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not remove items from watchlist.' });
    }
  };
  
  const moveMoviesToWatchlist = async (sourceWatchlistId: string, destinationWatchlistId: string, moviesToMove: Movie[]) => {
    const sourceList = watchlists.find(w => w.id === sourceWatchlistId);
    const destList = watchlists.find(w => w.id === destinationWatchlistId);
    if (!sourceList || !destList) return;

    const itemsToInsert = moviesToMove.map(movie => ({
      watchlist_id: destinationWatchlistId,
      movie_id: movie.id,
      media_type: movie.media_type,
      movie_data: movie,
    }));
    
    try {
      // Upsert into destination to handle potential duplicates
      const { error: upsertError } = await supabase.from('watchlist_items').upsert(itemsToInsert, {
        onConflict: 'watchlist_id,movie_id,media_type'
      });
      if (upsertError) throw upsertError;

      // Delete from source
      const movieIdsToRemove = moviesToMove.map(m => m.id);
      const { error: deleteError } = await supabase.from('watchlist_items').delete()
        .eq('watchlist_id', sourceWatchlistId)
        .in('movie_id', movieIdsToRemove);
      if (deleteError) throw deleteError;

      // Re-fetch for data consistency
      await fetchWatchlists();
      toast({ title: 'Items Moved', description: `${moviesToMove.length} items moved to "${destList.name}".` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not move items.' });
    }
  };


  const isMovieInAnyWatchlist = useCallback((movieId: number, mediaType: 'movie' | 'tv') => {
    return watchlists.some(w => w.movies.some(m => m.id === movieId && m.media_type === mediaType));
  }, [watchlists]);

  const getWatchlistsContainingMovie = useCallback((movieId: number, mediaType: 'movie' | 'tv') => {
    return watchlists
      .filter(w => w.movies.some(m => m.id === movieId && m.media_type === mediaType))
      .map(w => w.id);
  }, [watchlists]);
  
  const getWatchlistById = useCallback((id: string) => {
    return watchlists.find(w => w.id === id) || null;
  }, [watchlists]);


  const value = {
    watchlists,
    isInitialized,
    initializeUserWatchlists,
    createWatchlist,
    deleteWatchlist,
    updateWatchlistName,
    addMovieToWatchlist,
    addMoviesToWatchlist,
    removeMovieFromWatchlist,
    removeMoviesFromWatchlist,
    moveMoviesToWatchlist,
    isMovieInAnyWatchlist,
    getWatchlistsContainingMovie,
    getWatchlistById,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};
