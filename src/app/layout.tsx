
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { WatchlistProvider } from '@/contexts/watchlist-context';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/contexts/theme-context';
import { TorrentSitesProvider } from '@/contexts/torrent-sites-context';
import { KeywordsProvider } from '@/contexts/keywords-context';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'MovieSpot - Discover Movies & TV Shows',
  description: 'Browse, search, and bookmark your favorite movies and TV shows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DNS prefetch and preconnect for faster image loading */}
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background flex flex-col')}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <TorrentSitesProvider>
              <WatchlistProvider>
                <KeywordsProvider>
                  <Header />
                  <main className="flex-grow">{children}</main>
                </KeywordsProvider>
              </WatchlistProvider>
            </TorrentSitesProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
