'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

interface KeywordsContextType {
  keywords: string[];
  customKeywords: string[];
  addKeyword: (keyword: string) => Promise<void>;
  deleteKeyword: (keyword: string) => Promise<void>;
}

export const KeywordsContext = createContext<KeywordsContextType | undefined>(undefined);

const DEFAULT_KEYWORDS = ['4K', '2160p', '1080p', '720p', 'HDR'];

export const KeywordsProvider = ({ children }: { children: ReactNode }) => {
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchKeywords = useCallback(async () => {
    if (!user) {
      setCustomKeywords([]);
      return;
    }
    try {
      const { data, error } = await supabase.from('keywords').select('keyword').eq('user_id', user.id);
      if (error) throw error;
      setCustomKeywords(data.map(k => k.keyword));
    } catch (error) {
      console.error('Error fetching keywords', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch custom keywords.' });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchKeywords();
  }, [user, fetchKeywords]);

  const addKeyword = async (keyword: string) => {
    if (!user) return;
    const allKeywords = [...DEFAULT_KEYWORDS, ...customKeywords];
    if (allKeywords.map(k => k.toLowerCase()).includes(keyword.toLowerCase())) {
      toast({ variant: 'default', title: 'Keyword Exists', description: `"${keyword}" is already in your list.` });
      return;
    }
    try {
      const { error } = await supabase.from('keywords').insert({ keyword, user_id: user.id });
      if (error) throw error;
      setCustomKeywords(prev => [...prev, keyword]);
      toast({ title: 'Keyword Added', description: `"${keyword}" has been added.` });
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add keyword.' });
    }
  };

  const deleteKeyword = async (keywordToDelete: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('keywords').delete().eq('user_id', user.id).eq('keyword', keywordToDelete);
      if (error) throw error;
      setCustomKeywords(prev => prev.filter(k => k.toLowerCase() !== keywordToDelete.toLowerCase()));
      toast({ title: 'Keyword Deleted', description: `"${keywordToDelete}" has been deleted.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete keyword.' });
    }
  };

  const value = { 
    keywords: [...DEFAULT_KEYWORDS, ...customKeywords].sort(), 
    customKeywords: customKeywords.sort(),
    addKeyword,
    deleteKeyword
  };

  return (
    <KeywordsContext.Provider value={value}>
      {children}
    </KeywordsContext.Provider>
  );
};
