import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'inline';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'compact' }) => {
  const { language, setLanguage, t } = useLanguage();

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
        <button
          type="button"
          onClick={() => setLanguage('tr')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            language === 'tr' 
              ? 'bg-focus-neon/20 text-focus-neon font-bold border border-focus-neon/30 shadow-sm' 
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🇹🇷</span>
          <span>TR</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            language === 'en' 
              ? 'bg-focus-neon/20 text-focus-neon font-bold border border-focus-neon/30 shadow-sm' 
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary flex items-center gap-2">
          <Globe size={14} className="text-focus-neon" />
          <span>{t('common.language', 'Dil Seçimi')}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLanguage('tr')}
            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
              language === 'tr'
                ? 'bg-focus-neon/10 border-focus-neon text-white font-bold'
                : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🇹🇷</span>
              <div>
                <div className="text-xs font-semibold text-white">Türkçe</div>
                <div className="text-[10px] text-text-secondary">TR</div>
              </div>
            </div>
            {language === 'tr' && <Check size={16} className="text-focus-neon" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
              language === 'en'
                ? 'bg-focus-neon/10 border-focus-neon text-white font-bold'
                : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🇬🇧</span>
              <div>
                <div className="text-xs font-semibold text-white">English</div>
                <div className="text-[10px] text-text-secondary">EN</div>
              </div>
            </div>
            {language === 'en' && <Check size={16} className="text-focus-neon" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-7 sm:h-8 lg:h-9 px-1.5 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-300 border border-skel-metal/10 text-[10px] sm:text-xs font-mono font-bold shrink-0"
          title={t('common.language', 'Dil Seçimi')}
        >
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-focus-neon shrink-0" />
          <span className="uppercase">{language}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[220]" align="end">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setLanguage('tr')}
            className={`w-full p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
              language === 'tr' 
                ? 'bg-focus-neon/15 text-focus-neon font-bold border border-focus-neon/30' 
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🇹🇷</span>
              <span>Türkçe</span>
            </span>
            {language === 'tr' && <Check size={14} />}
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`w-full p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
              language === 'en' 
                ? 'bg-focus-neon/15 text-focus-neon font-bold border border-focus-neon/30' 
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🇬🇧</span>
              <span>English</span>
            </span>
            {language === 'en' && <Check size={14} />}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
