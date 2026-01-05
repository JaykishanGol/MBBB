
import type { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';

const ImdbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img"
        className="h-6 w-6">
        <path
            d="M22.4 0H1.6C.7 0 0 .7 0 1.6v20.8c0 .9.7 1.6 1.6 1.6h20.8c.9 0 1.6-.7 1.6-1.6V1.6c0-.9-.7-1.6-1.6-1.6zM7.2 19.2H4.8V8h2.4v11.2zm6.6 0h-2.4V8h2.4v11.2zm6.5 0h-2.4V8h2.4v11.2z" />
    </svg>
);

const RottenTomatoesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"
        className="h-6 w-6">
        <path
            d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" />
        <path
            d="M135.2,149.33l-5.36-5.36a28,28,0,1,0-17.68,17.68l5.36,5.36a8,8,0,0,0,11.32-11.32ZM99.18,104.82a12,12,0,1,1,17,17l-3.69,3.69-17-17Z" />
    </svg>
);

const RedditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
        className="h-6 w-6">
        <path
            d="M12,0C5.373,0,0,5.373,0,12c0,4.845,2.83,9.015,6.84,10.941c0.033,0,0.067-0.006,0.101-0.006c0.034,0,0.066,0.006,0.1,0.006c0.16,0,0.31-0.03,0.451-0.082C7.5,22.956,7.5,23,7.5,23l0.316-1.583c0.417-0.05,0.825-0.121,1.223-0.211c-0.187-0.205-0.364-0.42-0.529-0.643c-0.34-0.457-0.612-0.978-0.781-1.542c-0.034-0.113-0.072-0.223-0.104-0.336c-1.282-0.547-2.22-1.393-2.613-2.64c-0.32-1.011,0.138-1.956,0.223-2.186c0.004-0.01,0.007-0.018,0.011-0.027c0.09-0.244,0.569-1.2,2.73-1.428c0.012-0.273,0.02-0.55,0.02-0.83c0-2.457,1.385-4.449,3.1-4.449c1.716,0,3.1,1.992,3.1,4.449c0,0.28-0.008,0.557-0.02,0.83c2.162,0.229,2.64,1.184,2.73,1.428c0.004,0.009,0.007,0.017,0.011,0.027c0.084,0.23,0.543,1.175,0.223,2.186c-0.393,1.247-1.331,2.093-2.613,2.64c-0.031,0.113-0.071,0.223-0.104,0.336c-0.169,0.564-0.441,1.085-0.781,1.542c-0.165,0.223-0.342,0.438-0.529,0.643c0.398,0.09,0.806,0.161,1.223,0.211L16.5,23c0,0-0.001-0.044,0.009-0.049c0.141,0.051,0.291,0.082,0.451,0.082c0.034,0,0.066-0.006,0.1-0.006c0.034,0,0.068,0.006,0.101,0.006C21.17,21.015,24,16.845,24,12C24,5.373,18.627,0,12,0z M8.995,9.652c-0.828,0-1.5,0.671-1.5,1.5s0.672,1.5,1.5,1.5c0.829,0,1.5-0.671,1.5-1.5S9.824,9.652,8.995,9.652z M12,6c0.552,0,1,0.447,1,1s-0.448,1-1,1s-1-0.447-1-1S11.448,6,12,6z M15.005,9.652c-0.828,0-1.5,0.671-1.5,1.5s0.672,1.5,1.5,1.5c0.828,0,1.5-0.671,1.5-1.5S15.833,9.652,15.005,9.652z M17.438,15.312c-0.783-0.699-2.28-1.077-3.936-1.127c0.009,0.038,0.015,0.076,0.015,0.116c0,0.398-0.07,0.781-0.199,1.139c0.81,0.43,1.336,1.261,1.336,2.21c0,1.381-1.119,2.5-2.5,2.5c-1.381,0-2.5-1.119-2.5-2.5c0-0.949,0.526-1.78,1.336-2.21c-0.129-0.358-0.199-0.741-0.199-1.139c0-0.04,0.006-0.078,0.015-0.116c-1.656,0.05-3.153,0.428-3.936,1.127c-0.22,0.196-0.543,0.176-0.738-0.043c-0.196-0.22-0.176-0.543,0.043-0.738c0.912-0.814,2.673-1.289,4.632-1.289c1.959,0,3.72,0.475,4.632,1.289c0.22,0.196,0.239,0.519,0.043,0.738C17.981,15.488,17.658,15.508,17.438,15.312z" />
    </svg>
);

export function ExternalLinks({ item }: { item: Movie }) {
  const imdbUrl = item.imdb_id ? `https://www.imdb.com/title/${item.imdb_id}` : null;
  const rottenTomatoesUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(item.title)}`;
  const redditSearchTerm = `${item.title} ${item.media_type === 'movie' ? 'movie' : 'tv series'} discussion`;
  const redditUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(redditSearchTerm)}`;

  return (
    <div className="flex items-center gap-3">
      {imdbUrl && (
        <Button asChild className="w-full font-semibold border-white/20 bg-white/30 backdrop-blur-md hover:bg-white/40">
          <a href={imdbUrl} target="_blank" rel="noopener noreferrer" aria-label="IMDb">
            <span>IMDb</span>
          </a>
        </Button>
      )}
      <Button asChild className="w-full font-semibold border-white/20 bg-white/30 backdrop-blur-md hover:bg-white/40">
        <a href={rottenTomatoesUrl} target="_blank" rel="noopener noreferrer" aria-label="Rotten Tomatoes">
           <span>Rotten Tomatoes</span>
        </a>
      </Button>
      <Button asChild className="w-full font-semibold border-white/20 bg-white/30 backdrop-blur-md hover:bg-white/40">
        <a href={redditUrl} target="_blank" rel="noopener noreferrer" aria-label="Reddit">
          <span>Reddit</span>
        </a>
      </Button>
    </div>
  );
}
