
'use client';

import { useContext } from 'react';
import { TorrentSitesContext } from '@/contexts/torrent-sites-context';

export const useTorrentSites = () => {
  const context = useContext(TorrentSitesContext);
  if (context === undefined) {
    throw new Error('useTorrentSites must be used within a TorrentSitesProvider');
  }
  return context;
};
