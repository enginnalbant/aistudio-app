import { motion } from 'motion/react';
import { PlaySquare, Newspaper, Library, GraduationCap, Video } from 'lucide-react';

interface MediaDashboardProps {
  setActiveModule: (module: string) => void;
}

export function MediaDashboard({ setActiveModule }: MediaDashboardProps) {
  const cards = [
    { id: 'media-news', title: 'Haber & Dergi', icon: <Newspaper size={24} />, value: '12 Yeni', color: 'text-blue-400' },
    { id: 'media-library', title: 'Kitaplık', icon: <Library size={24} />, value: '45 Kitap', color: 'text-amber-400' },
    { id: 'media-education', title: 'Eğitim', icon: <GraduationCap size={24} />, value: '3 Kurs', color: 'text-emerald-400' },
    { id: 'media-records', title: 'Kayıtlar', icon: <Video size={24} />, value: '28 Video', color: 'text-purple-400' },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
            <PlaySquare className="text-focus-neon" size={32} />
            Medya
          </h1>
          <p className="text-skel-glass mt-1">İçerik tüketim ve öğrenme merkeziniz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setActiveModule(card.id)}
            className="bento-card p-6 flex flex-col items-start gap-4 hover:scale-[1.02] transition-transform text-left group"
          >
            <div className={`p-3 rounded-xl bg-skel-matte/50 ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-skel-glass font-medium">{card.title}</h3>
              <div className="text-2xl font-display font-bold text-pure-white mt-1">{card.value}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
