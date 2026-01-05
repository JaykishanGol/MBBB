'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWatchlist } from '@/hooks/use-watchlist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Pencil, Plus, Trash, Film, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from 'lucide-react';

export default function WatchlistPage() {
  const { watchlists, createWatchlist, deleteWatchlist, updateWatchlistName, initializeUserWatchlists, isInitialized } = useWatchlist();
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createWatchlist(newWatchlistName.trim());
      setNewWatchlistName('');
    }
  };

  const handleStartEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleUpdateWatchlist = () => {
    if (editingId && editingName.trim()) {
      updateWatchlistName(editingId, editingName.trim());
      handleCancelEditing();
    }
  };
  
  const handleInitialize = async () => {
    setIsInitializing(true);
    await initializeUserWatchlists();
    setIsInitializing(false);
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="font-headline text-3xl font-bold">My Watchlists</h1>
        {isInitialized && (
            <Dialog>
            <DialogTrigger asChild>
                <Button>
                <Plus className="mr-2" />
                New Watchlist
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Create New Watchlist</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                <Input
                    placeholder="e.g., Sci-Fi Favorites, Must Watch 2024..."
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateWatchlist()}
                />
                </div>
                <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleCreateWatchlist} disabled={!newWatchlistName.trim()}>
                    Create
                    </Button>
                </DialogClose>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        )}
      </div>

      {!isInitialized ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Film className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">Welcome to your Watchlists</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating your first default watchlist.
            </p>
            <Button onClick={handleInitialize} disabled={isInitializing} className="mt-6">
                {isInitializing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing...
                    </>
                ) : "Initialize Watchlists"}
            </Button>
        </div>
      ) : watchlists.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {watchlists.map((list) => (
             <div key={list.id} className="group relative">
                <Link href={`/watchlist/${list.id}`}>
                    <Card className="aspect-square w-full overflow-hidden transition-all hover:border-primary hover:shadow-lg">
                    <CardContent className="flex h-full flex-col items-center justify-center p-6">
                        <span className="font-headline text-5xl font-bold text-primary">{list.movies.length}</span>
                    </CardContent>
                    </Card>
                </Link>
                <div className="mt-2 flex items-start justify-between">
                    <span className="font-semibold">{list.name}</span>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEditing(list.id, list.name)}>
                        <Pencil className="mr-2 h-4 w-4" /> Rename
                        </DropdownMenuItem>
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash className="mr-2 h-4 w-4 text-destructive" /> Delete
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>
                            This will permanently delete the &quot;{list.name}&quot; watchlist. This action cannot be undone.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteWatchlist(list.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Film className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No Watchlists Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                Create your first watchlist to start saving movies and TV shows.
            </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && handleCancelEditing()}>
        <DialogContent>
            <DialogHeader><DialogTitle>Rename Watchlist</DialogTitle></DialogHeader>
            <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateWatchlist()} />
            <DialogFooter>
                <Button variant="ghost" onClick={handleCancelEditing}>Cancel</Button>
                <Button onClick={handleUpdateWatchlist}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
