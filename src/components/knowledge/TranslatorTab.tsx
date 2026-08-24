import React from 'react';
import { Globe } from 'lucide-react';

interface TranslatorTabProps {
  sourceLang: string;
  setSourceLang: (l: string) => void;
  targetLang: string;
  setTargetLang: (l: string) => void;
  translateSource: string;
  setTranslateSource: (t: string) => void;
  translateTarget: string;
  isTranslating: boolean;
  onTranslate: () => void;
}

export const TranslatorTab: React.FC<TranslatorTabProps> = ({
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  translateSource,
  setTranslateSource,
  translateTarget,
  isTranslating,
  onTranslate
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="text-cyan-400" /> Neural AI Translator
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold">
            <select 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-slate-950 text-white border border-white/10 rounded-xl px-3 py-1.5 outline-none"
            >
              <option value="tr">Turkish</option>
              <option value="en">English</option>
              <option value="de">German</option>
              <option value="fr">French</option>
            </select>
            <span className="text-slate-500 font-bold">➔</span>
            <select 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-slate-950 text-white border border-white/10 rounded-xl px-3 py-1.5 outline-none"
            >
              <option value="en">English</option>
              <option value="tr">Turkish</option>
              <option value="de">German</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400">Source Text</span>
            <textarea
              value={translateSource}
              onChange={(e) => setTranslateSource(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400">AI Neural Translation</span>
            <div className="w-full h-36 bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed overflow-y-auto">
              {isTranslating ? 'Translating via Neural Engine...' : translateTarget}
            </div>
          </div>
        </div>

        <button
          onClick={onTranslate}
          disabled={isTranslating || !translateSource.trim()}
          className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-2xl shadow-lg cursor-pointer transition-all"
        >
          Translate Text
        </button>
      </div>
    </div>
  );
};
