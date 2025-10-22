import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

// Define types (can be moved to a types file later)
interface Artist { name: string; }
interface Album { title: string; }
interface Track { id: number; title: string; artist: Artist; album: Album; } // No preview needed here
interface PlaylistDetails {
  id: number;
  name: string;
  tracks: Track[];
}

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>(); // Get playlist ID from URL parameter
  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      if (!id) return; // Should not happen with proper routing

      setLoading(true);
      setError('');
      try {
        const response = await api.get<PlaylistDetails>(`/playlists/${id}`);
        setPlaylist(response.data);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError('Playlist not found.');
        } else if (err.response && err.response.status === 403) {
            setError('You are not authorized to view this playlist.');
        }
        else {
          setError('Failed to load playlist details.');
        }
        console.error("Fetch playlist details error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [id]); // Re-fetch if the ID changes

  // --- Function to remove a track ---
  const handleRemoveTrack = async (trackId: number) => {
    if (!playlist) return;

    // Optimistic UI update (optional but good UX)
    // Immediately remove the track from the displayed list
    const originalTracks = playlist.tracks;
    setPlaylist({
        ...playlist,
        tracks: playlist.tracks.filter(track => track.id !== trackId)
    });

    try {
      // Call the backend endpoint to remove the track
      await api.delete(`/playlists/${playlist.id}/tracks/${trackId}`);
      // If successful, we don't need to do anything else because of optimistic update
    } catch (err) {
      console.error('Failed to remove track:', err);
      alert('Failed to remove track.');
      // Revert the UI change if the API call fails
      setPlaylist({ ...playlist, tracks: originalTracks });
    }
  };


  if (loading) return <p>Loading playlist...</p>;
  if (error) return <p style={{ color: 'red' }}>{error} <Link to="/">Go Home</Link></p>;
  if (!playlist) return <p>Playlist data not available. <Link to="/">Go Home</Link></p>; // Should not happen if no error

  return (
    <div>
      <h2>Playlist: {playlist.name}</h2>
      {playlist.tracks.length > 0 ? (
        playlist.tracks.map(track => (
          <div key={track.id} className="track-item" style={{justifyContent: 'space-between'}}>
            <div>
              <strong>{track.title}</strong>
              <p>{track.artist.name} - {track.album.title}</p>
            </div>
            <button
              onClick={() => handleRemoveTrack(track.id)}
              style={{ backgroundColor: '#dc3545' }} // Red button for remove
            >
              Remove
            </button>
          </div>
        ))
      ) : (
        <p className="empty-state">This playlist is empty.</p>
      )}
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default PlaylistPage;