import React, { useState } from 'react';
import { Layers, Plus } from 'lucide-react';

interface WhiteboardNode {
  id: string;
  title: string;
  x: number;
  y: number;
  color: string;
}

export const WhiteboardTab: React.FC = () => {
  const [nodes, setNodes] = useState<WhiteboardNode[]>([
    { id: 'w1', title: 'Knowledge Core Engine', x: 80, y: 80, color: 'bg-indigo-600/30 border-indigo-400' },
    { id: 'w2', title: 'AI Copilot & Vector Search', x: 340, y: 60, color: 'bg-purple-600/30 border-purple-400' },
    { id: 'w3', title: 'Local-First Hybrid Sync', x: 220, y: 220, color: 'bg-cyan-600/30 border-cyan-400' }
  ]);

  const handleAddNode = () => {
    const title = prompt('Düğüm Başlığı:');
    if (!title) return;
    const colors = [
      'bg-indigo-600/30 border-indigo-400',
      'bg-purple-600/30 border-purple-400',
      'bg-cyan-600/30 border-cyan-400',
      'bg-emerald-600/30 border-emerald-400',
      'bg-amber-600/30 border-amber-400'
    ];
    setNodes(prev => [
      ...prev,
      {
        id: `node-${Date.now()}`,
        title,
        x: Math.floor(Math.random() * 300) + 50,
        y: Math.floor(Math.random() * 200) + 50,
        color: colors[Math.floor(Math.random() * colors.length)]
      }
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="text-purple-400" /> Infinite Whiteboard Canvas
          </h2>
          <button
            onClick={handleAddNode}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus size={14} /> Add Card Node
          </button>
        </div>

        <div className="h-96 bg-slate-950 rounded-2xl border border-white/10 relative p-6 overflow-hidden shadow-inner">
          {nodes.map(node => (
            <div 
              key={node.id} 
              className={`absolute p-4 rounded-2xl border ${node.color} text-white font-bold text-xs shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform select-none`}
              style={{ left: node.x, top: node.y }}
            >
              {node.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
