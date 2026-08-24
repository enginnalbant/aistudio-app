import React from 'react';
import { Rss, ExternalLink } from 'lucide-react';
import { RssArticle } from '../KnowledgeWorkspace';

interface RssReaderTabProps {
  rssArticles: RssArticle[];
  selectedFeed: string;
  setSelectedFeed: (v: string) => void;
}

export const RssReaderTab: React.FC<RssReaderTabProps> = ({
  rssArticles,
  selectedFeed,
  setSelectedFeed
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <Rss className="text-amber-400" size={20} />
          <h2 className="text-lg font-bold text-white">RSS Live Reader Streams</h2>
        </div>
        <div className="flex gap-2">
          {['TechCrunch', 'Hacker News', 'MIT Tech Review'].map(f => (
            <button
              key={f}
              onClick={() => setSelectedFeed(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFeed === f ? 'bg-amber-500 text-black shadow-md' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rssArticles.map(art => (
          <div key={art.id} className="bg-slate-900/60 border border-white/10 p-5 rounded-3xl space-y-3 shadow-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-amber-400">{art.feed}</span>
              <span className="text-slate-500 font-mono">{art.published}</span>
            </div>
            <h3 className="text-base font-bold text-white leading-snug">{art.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{art.summary}</p>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
              <a href={art.url} target="_blank" rel="noreferrer" className="text-indigo-400 font-bold flex items-center gap-1 hover:underline">
                <span>Read Source</span> <ExternalLink size={12} />
              </a>
              <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400">
                Live Feed
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
