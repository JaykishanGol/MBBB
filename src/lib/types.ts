export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  genres: string[];
  runtime?: number;
  cast?: CastMember[];
  videos?: Video[];
  recommendations?: Movie[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  imdb_id?: string;
}

// Represents the raw item from TMDB API lists
export interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
}


// Represents the detailed item from TMDB API
export interface TmdbItemDetails extends TmdbItem {
  genres: { id: number; name: string }[];
  runtime?: number; // For movies
  episode_run_time?: number[]; // For TV
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: Video[];
  };
  recommendations?: {
    results: TmdbItem[];
  };
  external_ids?: {
    imdb_id: string | null;
  };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: 'YouTube' | string;
  type: 'Trailer' | 'Teaser' | string;
}