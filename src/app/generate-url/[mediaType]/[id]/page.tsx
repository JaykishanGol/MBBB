

'use client';

import { getDetails } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ExternalLink, Tv, Film, Plus, Pencil, Trash, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Movie } from '@/lib/types';
import { useTorrentSites } from '@/hooks/use-torrent-sites';
import type { TorrentSite } from '@/contexts/torrent-sites-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useKeywords } from '@/hooks/use-keywords';


function generateSearchUrl(
    site: TorrentSite,
    title: string,
    year: number | string | undefined,
    {
      includeYear,
      season,
      episode,
      keywords,
    }: {
      includeYear: boolean;
      season?: string;
      episode?: string;
      keywords: string[];
    }
  ) {
    let query = title;
  
    if (season) {
      query = `${title} ${season}`;
      if (episode) {
        query += episode;
      }
    } else {
        if (includeYear && year) {
            query += ` ${year}`;
        }
    }

    if (keywords.length > 0) {
      query += ` ${keywords.join(' ')}`;
    }

    return site.searchUrl.replace('query', encodeURIComponent(query));
}

function getYear(dateString: string | undefined) {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
}

export default function GenerateUrlPage() {
    const params = useParams();
    const mediaType = params.mediaType as 'movie' | 'tv';
    const id = params.id as string;

    const [item, setItem] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);

    const { sites, addSite, updateSite, deleteSite } = useTorrentSites();
    const { keywords, customKeywords, addKeyword, deleteKeyword } = useKeywords();

    const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);

    const [currentSite, setCurrentSite] = useState<Partial<TorrentSite>>({});
    const [editingSite, setEditingSite] = useState<TorrentSite | null>(null);
    const [includeYear, setIncludeYear] = useState(mediaType === 'movie');
    
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [customKeywordInput, setCustomKeywordInput] = useState('');

    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);


    useEffect(() => {
        async function fetchDetails() {
            if (mediaType !== 'movie' && mediaType !== 'tv') {
                notFound();
            }

            const details = await getDetails(mediaType, id);
            if (!details) {
                notFound();
            }
            setItem(details);
            setLoading(false);
        }
        fetchDetails();
    }, [mediaType, id]);

    useEffect(() => {
        // Initially select all sites
        setSelectedSiteIds(sites.map(s => s.id));
    }, [sites]);


    const handleSave = () => {
        if (editingSite) {
            // Update existing site
            updateSite(editingSite.id, { name: currentSite.name || '', searchUrl: currentSite.searchUrl || '' });
            setEditDialogOpen(false);
        } else {
            // Add new site
            addSite(currentSite.name || '', currentSite.searchUrl || '');
            setAddDialogOpen(false);
        }
        setCurrentSite({});
        setEditingSite(null);
    };

    const openEditDialog = (site: TorrentSite) => {
        setEditingSite(site);
        setCurrentSite(site);
        setEditDialogOpen(true);
    };
    
    const openAddDialog = () => {
        setEditingSite(null);
        setCurrentSite({});
        setAddDialogOpen(true);
    }
    
    const toggleSiteSelection = (siteId: string) => {
        setSelectedSiteIds(prev =>
          prev.includes(siteId)
            ? prev.filter(id => id !== siteId)
            : [...prev, siteId]
        );
    };

    const toggleKeywordSelection = (keyword: string) => {
        setSelectedKeywords(prev =>
            prev.includes(keyword)
            ? prev.filter(q => q !== keyword)
            : [...prev, keyword]
        );
    };
    
    const handleAddCustomKeyword = () => {
        const newKeyword = customKeywordInput.trim();
        if (newKeyword) {
            addKeyword(newKeyword);
            // Also select the new keyword
            if (!selectedKeywords.includes(newKeyword)) {
                setSelectedKeywords(prev => [...prev, newKeyword]);
            }
        }
        setCustomKeywordInput('');
    };

    const handleSeasonChange = (season: string | null) => {
      setSelectedSeason(prev => (prev === season ? null : season));
      // Reset episode when season changes
      setSelectedEpisode(null);
    };

    const handleEpisodeChange = (episode: string | null) => {
      setSelectedEpisode(prev => (prev === episode ? null : episode));
    };


    const filteredSites = sites.filter(site => selectedSiteIds.includes(site.id));

    if (loading || !item) {
        return <div className="container py-12 text-center">Loading...</div>;
    }
  
    const year = getYear(item.release_date);
    const searchOptions = {
        includeYear,
        season: selectedSeason,
        episode: selectedEpisode,
        keywords: selectedKeywords,
    };
    
    const handleOpenAll = () => {
        filteredSites.forEach(site => {
            const url = generateSearchUrl(site, item.title, year, searchOptions);
            window.open(url, '_blank');
        });
    };

    return (
        <div className="container py-12">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <div className='flex items-center gap-4 text-muted-foreground'>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 p-1 text-primary">
                        {item.media_type === 'movie' ? <Film className='h-5 w-5' /> : <Tv className='h-5 w-5' />}
                        </div>
                        <p className="font-semibold uppercase tracking-widest text-primary">
                            {item.media_type}
                        </p>
                    </div>
                    <div className="flex items-baseline gap-x-4">
                        <h1 className="mt-4 font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                            {item.title}
                        </h1>
                        {year && <span className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">({year})</span>}
                    </div>
                </div>

                <div className="mb-8 space-y-6">
                    {sites.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Selected Sites</h3>
                            <div className="flex flex-wrap gap-2">
                                {sites.map(site => (
                                    <Button
                                    key={site.id}
                                    variant={selectedSiteIds.includes(site.id) ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => toggleSiteSelection(site.id)}
                                    >
                                    {site.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="include-year" checked={includeYear} onCheckedChange={setIncludeYear} />
                            <Label htmlFor="include-year">Include Year in Search</Label>
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Keywords</h3>
                             <div className="flex flex-wrap gap-2">
                                {keywords.map(keyword => (
                                    <Button
                                    key={keyword}
                                    variant={selectedKeywords.includes(keyword) ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => toggleKeywordSelection(keyword)}
                                    >
                                    {keyword}
                                    </Button>
                                ))}
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Input 
                                    placeholder="Add custom keyword..." 
                                    value={customKeywordInput}
                                    onChange={e => setCustomKeywordInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddCustomKeyword()}
                                />
                                <Button onClick={handleAddCustomKeyword}>Add</Button>
                            </div>
                        </div>

                        {item.media_type === 'tv' && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Season</Label>
                                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 rounded-md border p-4">
                                        {Array.from({ length: item.number_of_seasons || 0 }, (_, i) => i + 1).map(seasonNum => {
                                            const seasonStr = `S${String(seasonNum).padStart(2, '0')}`;
                                            return (
                                                <Button key={`season-${seasonNum}`} variant={selectedSeason === seasonStr ? 'default' : 'outline'} size="sm" onClick={() => handleSeasonChange(seasonStr)}>
                                                    {seasonStr}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Episode</Label>
                                    <div className="mt-2 grid grid-cols-4 gap-2 rounded-md border p-4">
                                        {Array.from({ length: 20 }, (_, i) => i + 1).map(epNum => {
                                            const episodeStr = `E${String(epNum).padStart(2, '0')}`;
                                            return (
                                                <Button key={`ep-${epNum}`} variant={selectedEpisode === episodeStr ? 'default' : 'outline'} size="sm" onClick={() => handleEpisodeChange(episodeStr)}>
                                                    {episodeStr}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                <Card className="mb-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Generated Search URLs</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleOpenAll} disabled={filteredSites.length === 0}>
                            <Link2 className="mr-2 h-4 w-4" />
                            Open All
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sites.length > 0 ? (
                           filteredSites.length > 0 ? filteredSites.map(site => (
                            <div key={site.id} className="flex items-center justify-between rounded-md border p-3">
                                <h3 className="font-semibold">{site.name}</h3>
                                <Button asChild variant="secondary" size="sm">
                                    <a href={generateSearchUrl(site, item.title, year, searchOptions)} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2" />
                                        Search now
                                    </a>
                                </Button>
                            </div>
                            )) : (
                                 <p className="text-center text-muted-foreground py-4">No sites selected. Click a site button above to generate links.</p>
                            )
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No sites configured. Add a site in the 'Manage Torrent Sites' section to get started.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="mb-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Manage Torrent Sites</CardTitle>
                        <Button variant="outline" size="sm" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Add Site
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        {sites.length > 0 ? (
                           sites.map(site => (
                            <div key={site.id} className="flex items-center justify-between rounded-md border p-3">
                                <span className="font-semibold">{site.name}</span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(site)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogDescription>
                                                This will permanently delete the &quot;{site.name}&quot; site. This action cannot be undone.
                                            </AlertDialogDescription>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteSite(site.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No sites configured. Click "Add Site" to get started.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Manage Custom Keywords</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {customKeywords.length > 0 ? (
                           customKeywords.map(keyword => (
                            <div key={keyword} className="flex items-center justify-between rounded-md border p-3">
                                <span className="font-semibold">{keyword}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>
                                            This will permanently delete the keyword &quot;{keyword}&quot;. This action cannot be undone.
                                        </AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteKeyword(keyword)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No custom keywords added. Add one above to manage it here.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Dialog */}
                <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={isAddDialogOpen ? setAddDialogOpen : setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSite ? 'Edit Site' : 'Add a New Site'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={currentSite.name || ''} onChange={(e) => setCurrentSite({...currentSite, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="url">Search URL</Label>
                                <Input id="url" value={currentSite.searchUrl || ''} onChange={(e) => setCurrentSite({...currentSite, searchUrl: e.target.value})} placeholder="https://example.com/search?q=query" />
                            </div>
                             <p className="text-sm text-muted-foreground">Use `query` as a placeholder for the movie/show title.</p>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => isAddDialogOpen ? setAddDialogOpen(false) : setEditDialogOpen(false) }>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="mt-8">
                    <Button asChild variant="outline">
                        <Link href={`/${item.media_type}/${item.id}`}>Back to Details</Link>
                    </Button>
                </div>

            </div>
        </div>
    );
}

    

    

    
