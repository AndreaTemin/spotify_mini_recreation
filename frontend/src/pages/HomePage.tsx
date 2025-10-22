import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';

// --- Types (no change) ---
interface Artist {
  name: string;
}
interface Album {
  title: string;
}
interface Track {
  id: number;
  title: string;
  artist: Artist;
  album: Album;
  preview_url: string;
}
interface Playlist {
  id: number;
  name: string;
}

const HomePage = () => {
  const [allTracks, setAllTracks] = useState<Track[]>([]); // Renamed from 'tracks'
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- NEW: Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  // --- Audio player state (no change) ---
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // This function now only fetches the initial data
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const [tracksResponse, playlistsResponse] = await Promise.all([
          api.get('/tracks/'),
          api.get('/playlists/')
        ]);
        setAllTracks(tracksResponse.data);
        setPlaylists(playlistsResponse.data);
      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- Audio playback effect (no change) ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentPreviewUrl) {
        if (audioRef.current.src !== currentPreviewUrl) {
          audioRef.current.src = currentPreviewUrl;
        }
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentPreviewUrl]);

  // --- togglePlay function (no change) ---
  const togglePlay = (previewUrl: string) => {
    if (currentPreviewUrl === previewUrl) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPreviewUrl(previewUrl);
      setIsPlaying(true);
    }
  };

  // --- NEW: Search handler ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 3) {
      setSearchResults([]); // Clear results if query is too short
      return;
    }
    try {
      const response = await api.get('/tracks/search', {
        params: { q: searchQuery }
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // --- NEW: Logic to decide which tracks to display ---
  const tracksToDisplay = searchQuery.trim().length > 0 ? searchResults : allTracks;

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <audio ref={audioRef} />

      {/* --- Playlist section (no change) --- */}
      <div style={{ flex: 1 }}>
        <h2>My Playlists</h2>
        {playlists.length > 0 ? (
          <ul>
            {playlists.map(playlist => (
              <li key={playlist.id}>{playlist.name}</li>
            ))}
          </ul>
        ) : (
          <p>You haven't created any playlists yet.</p>
        )}
      </div>

      <div style={{ flex: 2 }}>
        {/* --- NEW: Search Form --- */}
        <h2>All Tracks</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by track or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '300px', padding: '0.5rem' }}
          />
          <button type="submit" style={{ marginLeft: '0.5rem' }}>Search</button>
        </form>

        {/* --- UPDATED: Track List --- */}
        {tracksToDisplay.map(track => {
          const isCurrentTrack = currentPreviewUrl === track.preview_url;
          return (
            <div key={track.id} style={{ border: '1px solid #eee', padding: '0.5rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
              <strong>{track.title}</strong>
              <p>{track.artist.name} - {track.album.title}</p>
              <button onClick={() => togglePlay(track.preview_url)}>
                {isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          );
        })}
        {/* Show a message if search yields no results */}
        {searchQuery.length > 0 && tracksToDisplay.length === 0 && (
          <p>No results found for "{searchQuery}".</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;