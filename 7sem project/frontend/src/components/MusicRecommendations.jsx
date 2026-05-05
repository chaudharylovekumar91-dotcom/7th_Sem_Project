import { useState, useEffect } from 'react';
import { PlayCircle, ThumbsUp, SkipForward, Repeat, AlertTriangle, Loader2, Music } from 'lucide-react';

export default function MusicRecommendations({ emotion }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!emotion) return;

    const fetchMusic = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/music/recommend-music?emotion=${emotion}&user_id=1`);
        if (response.ok) {
          const data = await response.json();
          setTracks(data.tracks);
          setSource(data.source);
          setFeedbackGiven({});
        } else {
          setError("Failed to fetch recommendations from server.");
        }
      } catch (err) {
        console.error("Failed to fetch music recommendations:", err);
        setError("Network error while fetching music.");
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, [emotion]);

  const handleFeedback = async (track, action) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http:host:80//local00';
      const response = await fetch(`${apiUrl}/feedback/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // Hardcoded for demo
          song_id: track.id,
          genre: track.genre,
          emotion: emotion,
          action: action
        }),
      });

      if (response.ok) {
        setFeedbackGiven(prev => ({ ...prev, [track.id]: action }));
      }
    } catch (err) {
      console.error("Failed to send feedback:", err);
    }
  };

  if (!emotion) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music className="text-indigo-400" /> 
          Playlist for your <span className="text-indigo-400 capitalize">{emotion}</span> mood
        </h3>
      </div>

      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      )}

      {source === 'mock' && !error && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <p>Spotify API not configured. Showing high-quality mock recommendations.</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-indigo-400">
          <Loader2 size={48} className="animate-spin" />
          <p className="font-medium animate-pulse">Curating your personalized playlist...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tracks.map((track) => (
            <div key={track.id} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
              
              {/* Album Art */}
              <div className="aspect-square bg-slate-900 relative">
                {track.album_art ? (
                  <img src={track.album_art} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music size={48} className="text-slate-700" />
                  </div>
                )}
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle size={48} className="text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Song Info */}
              <div className="p-4 flex flex-col h-[180px]">
                <h4 className="font-bold text-white text-lg truncate mb-1" title={track.title}>{track.title}</h4>
                <p className="text-slate-400 text-sm truncate mb-2">{track.artist}</p>
                
                <div className="mt-auto">
                  {track.preview_url ? (
                    <audio controls src={track.preview_url} className="w-full h-8 mb-3 opacity-80 hover:opacity-100 transition-opacity">
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center mb-3 py-1.5">No preview available</p>
                  )}
                  
                  {/* Feedback Buttons */}
                  <div className="flex justify-between gap-2 border-t border-slate-700 pt-3">
                    <button 
                      className={`flex-1 py-1.5 rounded-lg flex justify-center items-center gap-1 text-xs font-semibold transition-all
                        ${feedbackGiven[track.id] === 'like' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white'}
                        ${feedbackGiven[track.id] && feedbackGiven[track.id] !== 'like' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => handleFeedback(track, 'like')}
                      disabled={!!feedbackGiven[track.id]}
                      title="Like this genre"
                    >
                      <ThumbsUp size={14} /> Like
                    </button>
                    <button 
                      className={`flex-1 py-1.5 rounded-lg flex justify-center items-center gap-1 text-xs font-semibold transition-all
                        ${feedbackGiven[track.id] === 'skip' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white'}
                        ${feedbackGiven[track.id] && feedbackGiven[track.id] !== 'skip' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => handleFeedback(track, 'skip')}
                      disabled={!!feedbackGiven[track.id]}
                      title="Show less like this"
                    >
                      <SkipForward size={14} /> Skip
                    </button>
                    <button 
                      className={`flex-1 py-1.5 rounded-lg flex justify-center items-center gap-1 text-xs font-semibold transition-all
                        ${feedbackGiven[track.id] === 'repeat' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white'}
                        ${feedbackGiven[track.id] && feedbackGiven[track.id] !== 'repeat' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => handleFeedback(track, 'repeat')}
                      disabled={!!feedbackGiven[track.id]}
                      title="I love this"
                    >
                      <Repeat size={14} /> Repeat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
