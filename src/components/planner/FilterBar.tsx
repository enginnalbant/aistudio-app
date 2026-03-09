import React from 'react';

export const FilterBar = ({ currentFilter, onFilterChange }: { currentFilter: string, onFilterChange: (f: string) => void }) => {
  const filters = ['Tümü', 'Acil', 'Sabah', 'Öğlen', 'Akşam', 'Tamamlanan', 'Bekleyen'];
  return (
    <div className="flex gap-2 p-2 bg-bg-card/50 border border-border rounded-2xl mb-6 backdrop-blur-xl">
      {filters.map(f => (
        <button 
          key={f} 
          onClick={() => onFilterChange(f)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentFilter === f ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-text-secondary hover:text-text-primary'}`}
        >
          {f}
        </button>
      ))}
    </div>
  );
};
