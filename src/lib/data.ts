
import type { Movie, TmdbItem, TmdbItemDetails } from './types';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

async function fetchFromTmdb(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  // Read the environment variable directly inside the function
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  url.searchParams.append('api_key', apiKey || '');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Revalidate cache every hour
    });
    if (!response.ok) {
      console.error(`TMDB API Error: ${response.statusText} for URL ${url.toString()}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch from TMDB:', error);
    return null;
  }
}

function normalizeTmdbData(item: TmdbItem, mediaType?: 'movie' | 'tv'): Movie {
  const type = mediaType || item.media_type;
  if (!type) {
    throw new Error('Media type is missing for an item.');
  }

  return {
    id: item.id,
    title: item.title || item.name || 'Unknown Title',
    overview: item.overview,
    poster_path: item.poster_path ? `${IMAGE_BASE_URL}/original${item.poster_path}` : '',
    backdrop_path: item.backdrop_path ? `${IMAGE_BASE_URL}/original${item.backdrop_path}` : '',
    release_date: item.release_date || item.first_air_date || '',
    vote_average: item.vote_average,
    media_type: type,
    genres: item.genres?.map(g => g.name) || [],
  };
}


function normalizeDetailedTmdbData(item: TmdbItemDetails, mediaType: 'movie' | 'tv'): Movie {
  const baseMovie = normalizeTmdbData(item, mediaType);
  return {
    ...baseMovie,
    genres: item.genres.map(g => g.name),
    runtime: 'runtime' in item ? item.runtime : (item.episode_run_time?.[0] || undefined),
    cast: item.credits?.cast.slice(0, 10) || [],
    videos: item.videos?.results.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || [],
    recommendations: item.recommendations?.results.map(r => normalizeTmdbData(r)) || [],
    number_of_seasons: item.number_of_seasons,
    number_of_episodes: item.number_of_episodes,
    imdb_id: item.external_ids?.imdb_id || undefined,
  };
}


export async function getPopular(mediaType: 'movie' | 'tv'): Promise<Movie[]> {
  const data = await fetchFromTmdb(`${mediaType}/popular`);
  return data?.results.map((item: TmdbItem) => normalizeTmdbData(item, mediaType)) || [];
}

export async function getTopRated(mediaType: 'movie' | 'tv'): Promise<Movie[]> {
  const data = await fetchFromTmdb(`${mediaType}/top_rated`);
  return data?.results.map((item: TmdbItem) => normalizeTmdbData(item, mediaType)) || [];
}

export async function getUpcoming(mediaType: 'movie'): Promise<Movie[]> {
  const data = await fetchFromTmdb(`${mediaType}/upcoming`);
  return data?.results.map((item: TmdbItem) => normalizeTmdbData(item, mediaType)) || [];
}

export async function searchAll(query: string): Promise<Movie[]> {
    if (!query) return [];
    
    const data = await fetchFromTmdb('search/multi', { query });
    if (!data?.results) return [];

    const validResults = data.results.filter((item: TmdbItem) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path);
    return validResults.map((item: TmdbItem) => normalizeTmdbData(item));
}

export async function getDetails(mediaType: 'movie' | 'tv', id: string): Promise<Movie | null> {
    if (!id || !mediaType) return null;

    const params = {
        append_to_response: 'credits,videos,recommendations,external_ids'
    };
    const data = await fetchFromTmdb(`${mediaType}/${id}`, params);
    if (!data) return null;

    return normalizeDetailedTmdbData(data, mediaType);
}
