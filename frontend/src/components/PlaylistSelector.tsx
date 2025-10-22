import React, { useState } from 'react';

interface Playlist {
  id: number;
  name: string;
}

interface PlaylistSelectorProps {
  playlists: Playlist[];
  trackId: number;
  onAddToPlaylist: (playlistId: number, trackId: number) => Promise<void>; // Make it async
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ playlists, trackId, onAddToPlaylist }) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(''); // Store ID as string
  const [isAdding, setIsAdding] = useState(false); // State to disable button during API call
  const [error, setError] = useState('');

  const handleAddClick = async () => {
    setError('');
    if (!selectedPlaylistId) {
      setError('Please select a playlist.');
      return;
    }

    setIsAdding(true);
    try {
      // Call the async function passed from the parent
      await onAddToPlaylist(parseInt(selectedPlaylistId, 10), trackId);
      // Reset selection after successful add (optional)
      setSelectedPlaylistId('');
    } catch (err) {
      setError('Failed to add.');
      // Error handling is likely done in the parent, but we can show a local message
      console.error("Error in selector:", err);
    } finally {
      setIsAdding(false);
    }
  };

  if (playlists.length === 0) {
    return <small>Create a playlist first!</small>; // Show message if no playlists
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <select
        value={selectedPlaylistId}
        onChange={(e) => {
            setSelectedPlaylistId(e.target.value);
            setError(''); // Clear error on selection change
        }}
        style={{ padding: '0.3rem' }}
      >
        <option value="" disabled>Select Playlist</option>
        {playlists.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddClick}
        disabled={!selectedPlaylistId || isAdding} // Disable if no selection or during add
        style={{ backgroundColor: '#6c757d', padding: '0.3rem 0.6rem', fontSize: '0.9em' }}
      >
        {isAdding ? 'Adding...' : 'Add'}
      </button>
      {error && <small style={{ color: 'red', marginLeft: '0.5rem' }}>{error}</small>}
    </div>
  );
};

export default PlaylistSelector;