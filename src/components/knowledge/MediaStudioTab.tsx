import React from 'react';
import { Film, Play, Pause, Music } from 'lucide-react';
import { MediaTrack, FileItem } from '../KnowledgeWorkspace';

interface MediaStudioTabProps {
  mediaTracks: MediaTrack[];
  mediaPlaying: boolean;
  activeMediaId: string;
  setActiveMediaId: (id: string) => void;
  setMediaPlaying: (p: boolean) => void;
}

export const MediaStudioTab: React.FC<MediaStudioTabProps> = ({
  mediaTracks,
  mediaPlaying,
  activeMediaId,
  setActiveMediaId,
  setMediaPlaying
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Film className="text-purple-400" /> Media & Podcast Player Studio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mediaTracks.map(track => (
            <div key={track.id} className="bg-slate-950/80 border border-white/10 p-4 rounded-2xl flex gap-4 items-center shadow-lg">
              <img src={track.cover} alt={track.title} className="w-16 h-16 object-cover rounded-xl border border-white/10 shrink-0" />
              <div className="flex-1 space-y-1">
                <h3 className="text-xs font-bold text-white">{track.title}</h3>
                <p className="text-[10px] text-slate-400">{track.artist} • {track.duration}</p>
                <button 
                  onClick={() => {
                    setActiveMediaId(track.id);
                    setMediaPlaying(!mediaPlaying || activeMediaId !== track.id);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  {mediaPlaying && activeMediaId === track.id ? <Pause size={12} /> : <Play size={12} />}
                  <span>{mediaPlaying && activeMediaId === track.id ? 'Pause' : 'Play'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
