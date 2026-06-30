import React from 'react';
import { Folder, Plus, MoreVertical, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const Projects = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-black tracking-tight text-text-primary uppercase">
          Projelerim
        </h1>
        <button className="px-4 py-2 bg-focus-neon text-pure-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-focus-main transition-all">
          <Plus size={16} />
          Yeni Proje
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Apex OS Redesign', status: 'Devam Ediyor', progress: 75, color: 'bg-focus-neon' },
          { name: 'Mobile App API', status: 'Planlama', progress: 20, color: 'bg-ai-bright' },
          { name: 'E-Ticaret Entegrasyonu', status: 'Tamamlandı', progress: 100, color: 'bg-focus-main' },
        ].map((project, i) => (
          <motion.div 
            key={project.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bento-card p-6 space-y-6 group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-skel-matte/5 flex items-center justify-center text-text-secondary group-hover:text-focus-neon transition-colors">
                <Folder size={24} />
              </div>
              <button className="text-text-secondary opacity-40 hover:opacity-100 transition-opacity">
                <MoreVertical size={20} />
              </button>
            </div>

            <div>
              <h3 className="font-display font-black text-lg text-text-primary group-hover:text-focus-neon transition-colors">{project.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-text-secondary uppercase tracking-widest opacity-60">
                <Clock size={12} />
                {project.status}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-text-secondary uppercase tracking-widest">
                <span>İlerleme</span>
                <span>%{project.progress}</span>
              </div>
              <div className="h-1.5 w-full bg-skel-matte/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  className={`h-full ${project.color} shadow-[0_0_10px_rgba(37,99,235,0.3)]`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
