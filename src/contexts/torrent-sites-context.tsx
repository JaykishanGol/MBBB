
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export interface TorrentSite {
  id: string;
  name: string;
  searchUrl: string;
  user_id?: string;
}

interface TorrentSitesContextType {
  sites: TorrentSite[];
  addSite: (name: string, searchUrl: string) => Promise<void>;
  updateSite: (id: string, updatedSite: { name: string; searchUrl: string }) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
  initializeUserSites: () => Promise<void>;
  isInitialized: boolean;
}

export const TorrentSitesContext = createContext<TorrentSitesContextType | undefined>(undefined);

export const TorrentSitesProvider = ({ children }: { children: ReactNode }) => {
  const [sites, setSites] = useState<TorrentSite[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSites = useCallback(async () => {
    if (!user) {
      setSites([]);
      setIsInitialized(false);
      return;
    }
    try {
      const { data, error, count } = await supabase
        .from('torrent_sites')
        .select('id, name, searchUrl', { count: 'exact' })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSites(data.map(d => ({...d, searchUrl: d.searchUrl || ''})));

      if (count !== null) {
        setIsInitialized(true);
      }
    } catch (error: any) {
      console.error('Error fetching torrent sites:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch your saved sites.',
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
        fetchSites();
    } else {
        setSites([]);
        setIsInitialized(false);
    }
  }, [user, fetchSites]);

  const initializeUserSites = async () => {
    if (!user) return;

    try {
        const { data: defaultSites } = await import('@/lib/torrent-sites');
        const sitesToInsert = defaultSites.map(site => ({
            name: site.name,
            searchUrl: site.searchUrl,
            user_id: user.id
        }));

        const { error } = await supabase
            .from('torrent_sites')
            .insert(sitesToInsert);
        
        if (error) throw error;
        
        await fetchSites();
        toast({ title: 'Success', description: 'Your default torrent sites have been added.' });

    } catch (error: any) {
        console.error('Error initializing torrent sites:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not create default sites.',
        });
    }
  };


  const addSite = async (name: string, searchUrl: string) => {
    if (!user) {
        toast({ title: 'Please sign in', description: 'You must be logged in to add a new site.'});
        return;
    }
     if (!searchUrl.includes('query')) {
        toast({
          variant: 'destructive',
          title: 'Invalid URL Format',
          description: 'The Search URL must contain `query` as a placeholder.',
        });
        return;
    }
    try {
        const { data, error } = await supabase
            .from('torrent_sites')
            .insert({ name, searchUrl, user_id: user.id })
            .select()

        if (error) throw error;

        if (data && data.length > 0) {
            setSites(prev => [...prev, data[0]]);
            toast({ title: 'Site Added', description: `"${name}" has been added.` });
        } else {
            throw new Error('No data returned from insert');
        }
    } catch (error) {
      console.error('Error adding site:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add site.' });
    }
  };

  const updateSite = async (id: string, updatedSite: { name: string; searchUrl: string }) => {
    if (!user) {
        toast({ title: 'Please sign in', description: 'You must be logged in to update a site.'});
        return;
    }
     if (!updatedSite.searchUrl.includes('query')) {
        toast({
          variant: 'destructive',
          title: 'Invalid URL Format',
          description: 'The Search URL must contain `query` as a placeholder.',
        });
        return;
    }
    try {
        const { error } = await supabase
            .from('torrent_sites')
            .update({ name: updatedSite.name, searchUrl: updatedSite.searchUrl })
            .eq('id', id);
        if (error) throw error;
        setSites(prev => prev.map(site => (site.id === id ? { ...site, ...updatedSite } : site)));
        toast({ title: 'Site Updated', description: `"${updatedSite.name}" has been updated.` });
    } catch (error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not update site.' });
    }
  };

  const deleteSite = async (id: string) => {
    if (!user) {
        toast({ title: 'Please sign in', description: 'You must be logged in to delete a site.'});
        return;
    }
    const siteToDelete = sites.find(s => s.id === id);
    if (!siteToDelete) return;
    
    try {
        const { error } = await supabase.from('torrent_sites').delete().eq('id', id);
        if (error) throw error;
        setSites(prev => prev.filter(s => s.id !== id));
        toast({ title: 'Site Deleted', description: `"${siteToDelete.name}" has been deleted.` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete site.' });
    }
  };

  const value = { sites, addSite, updateSite, deleteSite, isInitialized, initializeUserSites };

  return (
    <TorrentSitesContext.Provider value={value}>
      {children}
    </TorrentSitesContext.Provider>
  );
};
