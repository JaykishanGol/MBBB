
'use client';

import { useContext } from 'react';
import { KeywordsContext } from '@/contexts/keywords-context';

export const useKeywords = () => {
  const context = useContext(KeywordsContext);
  if (context === undefined) {
    throw new Error('useKeywords must be used within a KeywordsProvider');
  }
  return context;
};
