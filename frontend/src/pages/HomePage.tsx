import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import api from '../api/axios';
import PlaylistSelector from '../components/PlaylistSelector'; // Import the selector

// --- Types ---
interface Artist { name: string; }
interface Album { title: string; }
interface Track { id: number; title: string; artist: Artist; album: Album; preview_url: string; }
interface Playlist { id: number; name: string; }

const HomePage = () => {
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistError, setPlaylistError] = useState('');


  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("Starting fetchInitialData...");
      setLoading(true);
      setError('');
      try {
        console.log("Inside try block, before API calls...");
        const [tracksResponse, playlistsResponse] = await Promise.all([
          api.get('/tracks/'),
          api.get('/playlists/')
        ]);
        console.log("API calls successful:", tracksResponse.data, playlistsResponse.data);
        setAllTracks(tracksResponse.data);
        setPlaylists(playlistsResponse.data);
      } catch (err) {
        console.error("Error in fetchInitialData:", err);
        setError('Failed to fetch data.');
      } finally {
        console.log("Inside finally block...");
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- Audio Playback Effect ---
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

  // --- togglePlay function ---
  const togglePlay = (previewUrl: string) => {
    if (currentPreviewUrl === previewUrl) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPreviewUrl(previewUrl);
      setIsPlaying(true);
    }
  };

  // --- handleSearch function ---
  const handleSearch = async (e: React.FormEvent) => {
    // Prevent the form from reloading the page
    e.preventDefault();
  };

  // --- handleCreatePlaylist function ---
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaylistError('');
    if (!newPlaylistName.trim()) {
      setPlaylistError('Playlist name cannot be empty.');
      return;
    }
    try {
      const response = await api.post('/playlists/', { name: newPlaylistName });
      setPlaylists([...playlists, response.data]);
      setNewPlaylistName('');
    } catch (err) {
      setPlaylistError('Failed to create playlist.');
      console.error('Create playlist error:', err);
    }
  };

  // --- handleAddTrackToPlaylist function ---
  const handleAddTrackToPlaylist = async (playlistId: number, trackId: number) => {
    console.log(`Attempting to add track ${trackId} to playlist ${playlistId}`);

    try {
      const response = await api.post(`/playlists/${playlistId}/tracks/${trackId}`);
      console.log('Track added successfully to playlist:', response.data);
      const playlistName = playlists.find(p => p.id === playlistId)?.name || 'the playlist';
      alert(`Track added to "${playlistName}"!`);
      // NOTE: Still not visually updating the playlist state here.
    } catch (err) {
      console.error('Failed to add track to playlist:', err);
      alert('Failed to add track.');
      // Re-throw error for the selector component
      throw err;
    }
  };


  // --- Render Logic ---
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // Filter tracks based on the search query for a live search experience
  const tracksToDisplay = allTracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <> {/* Use fragment */}
      <audio ref={audioRef} />

      {/* --- Playlist section --- */}
      <div className="playlist-section">
        <h2>My Playlists</h2>
        <form onSubmit={handleCreatePlaylist} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="New playlist name..."
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <button type="submit" style={{ marginLeft: '0.5rem' }}>Create</button>
          {playlistError && <p style={{ color: 'red', fontSize: '0.9em', marginTop: '0.25rem' }}>{playlistError}</p>}
        </form>
        {playlists.length > 0 ? (
          <ul className="playlist-list">
            {playlists.map(playlist => (
              <li key={playlist.id} className="playlist-item">
                {/* Wrap name in Link */}
                <Link to={`/playlist/${playlist.id}`}>
                  {playlist.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">You haven't created any playlists yet.</p>
        )}
      </div>

      {/* --- Track section --- */}
      <div className="track-section">
        <h2>All Tracks</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by track or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {tracksToDisplay.map(track => {
          const isCurrentTrack = currentPreviewUrl === track.preview_url;
          return (
            <div key={track.id} className="track-item">
              <div>
                <strong>{track.title}</strong>
                <p>{track.artist.name} - {track.album.title}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}> {/* Container */}
                <button onClick={() => togglePlay(track.preview_url)}>
                  {isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
                </button>
                {/* --- USE PlaylistSelector --- */}
                <PlaylistSelector
                    playlists={playlists}
                    trackId={track.id}
                    onAddToPlaylist={handleAddTrackToPlaylist}
                />
              </div>
            </div>
          );
        })} {/* Closing parenthesis and brace for map */}

        {searchQuery.length > 0 && tracksToDisplay.length === 0 && (
          <p className="empty-state">No results found for "{searchQuery}".</p>
        )}
      </div>
    </>
  );
};

export default HomePage;