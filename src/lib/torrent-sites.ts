export interface TorrentSite {
    name: string;
    searchUrl: string; // query will be replaced
  }
  
  export const torrentSites: TorrentSite[] = [
    {
      name: '1337x',
      searchUrl: 'https://1337x.to/search/query/1/',
    },
    {
      name: 'The Pirate Bay',
      searchUrl: 'https://thepiratebay.org/search.php?q=query',
    },
    {
      name: 'EZTV',
      searchUrl: 'https://eztv.re/search/query',
    },
    {
      name: 'YTS',
      searchUrl: 'https://yts.mx/browse-movies/query',
    },
    {
      name: 'TorrentGalaxy',
      searchUrl: 'https://torrentgalaxy.to/torrents.php?search=query',
    },
    {
      name: 'LimeTorrents',
      searchUrl: 'https://www.limetorrents.info/search/all/query/',
    }
  ];
  
    