-- Create torrent_sites table
CREATE TABLE public.torrent_sites (
    id uuid default gen_random_uuid() not null primary key,
    user_id uuid references auth.users not null,
    name text not null,
    "searchUrl" text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RLS for torrent_sites
ALTER TABLE public.torrent_sites enable row level security;
CREATE POLICY "Users can view their own sites." ON public.torrent_sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sites." ON public.torrent_sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sites." ON public.torrent_sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sites." ON public.torrent_sites FOR DELETE USING (auth.uid() = user_id);


-- Create keywords table
CREATE TABLE public.keywords (
    id uuid default gen_random_uuid() not null primary key,
    user_id uuid references auth.users not null,
    keyword text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(user_id, keyword)
);
-- RLS for keywords
ALTER TABLE public.keywords enable row level security;
CREATE POLICY "Users can view their own keywords." ON public.keywords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own keywords." ON public.keywords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own keywords." ON public.keywords FOR DELETE USING (auth.uid() = user_id);


-- Create watchlists table
CREATE TABLE public.watchlists (
    id uuid default gen_random_uuid() not null primary key,
    user_id uuid references auth.users not null,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RLS for watchlists
ALTER TABLE public.watchlists enable row level security;
CREATE POLICY "Users can view their own watchlists." ON public.watchlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own watchlists." ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watchlists." ON public.watchlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlists." ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

-- Create watchlist_items table
CREATE TABLE public.watchlist_items (
    id uuid default gen_random_uuid() not null primary key,
    watchlist_id uuid references public.watchlists on delete cascade not null,
    movie_id integer not null,
    media_type text not null,
    movie_data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(watchlist_id, movie_id, media_type)
);
-- RLS for watchlist_items
ALTER TABLE public.watchlist_items enable row level security;
CREATE POLICY "Users can view their own watchlist items." ON public.watchlist_items FOR SELECT USING (
    auth.uid() = (select user_id from watchlists where id = watchlist_id)
);
CREATE POLICY "Users can insert their own watchlist items." ON public.watchlist_items FOR INSERT WITH CHECK (
    auth.uid() = (select user_id from watchlists where id = watchlist_id)
);
CREATE POLICY "Users can delete their own watchlist items." ON public.watchlist_items FOR DELETE USING (
    auth.uid() = (select user_id from watchlists where id = watchlist_id)
);
