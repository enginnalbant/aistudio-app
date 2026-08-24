import React from 'react';
import { Compass, RefreshCw, Wand2, Network } from 'lucide-react';

interface DeepResearchTabProps {
  researchQuery: string;
  setResearchQuery: (v: string) => void;
  researchOutput: string | null;
  isSynthesizing: boolean;
  onSynthesize: () => void;
}

export const DeepResearchTab: React.FC<DeepResearchTabProps> = ({
  researchQuery,
  setResearchQuery,
  researchOutput,
  isSynthesizing,
  onSynthesize
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="text-cyan-400" /> Deep AI Research Assistant
          </h2>
          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30 font-bold">
            Live Vector Embeddings
          </span>
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            value={researchQuery}
            onChange={(e) => setResearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSynthesize()}
            placeholder="Enter research topic..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
          />
          <button 
            onClick={onSynthesize}
            disabled={isSynthesizing}
            className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            {isSynthesizing ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
            <span>Synthesize</span>
          </button>
        </div>

        {researchOutput && (
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            {researchOutput}
          </div>
        )}
      </div>

      {/* Knowledge Graph Preview */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-3 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Network className="text-indigo-400" /> Neural Knowledge Connections
        </h3>
        <div className="h-64 bg-slate-950 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center p-4">
          <div className="w-20 h-20 rounded-full bg-indigo-600/40 border border-indigo-400 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_30px_rgba(99,102,241,0.6)] z-10 animate-pulse">
            Apex Research
          </div>
          {[
            { name: 'RAG Vector Store', top: '15%', left: '20%' },
            { name: 'LLM Agents', top: '20%', right: '20%' },
            { name: 'PDF Citations', bottom: '20%', left: '25%' },
            { name: 'ArXiv Feeds', bottom: '15%', right: '25%' }
          ].map((nod, idx) => (
            <div key={idx} className="absolute text-xs font-bold bg-slate-900 text-slate-200 border border-white/20 px-3 py-1 rounded-full shadow-lg" style={{ top: nod.top, left: nod.left, right: nod.right, bottom: nod.bottom }}>
              {nod.name}
            </div>
          ))}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-indigo-500/30 stroke-[1]">
            <line x1="50%" y1="50%" x2="25%" y2="25%" />
            <line x1="50%" y1="50%" x2="75%" y2="30%" />
            <line x1="50%" y1="50%" x2="30%" y2="75%" />
            <line x1="50%" y1="50%" x2="70%" y2="80%" />
          </svg>
        </div>
      </div>
    </div>
  );
};
