import { motion } from 'motion/react';
import { Wallet, TrendingUp, TrendingDown, CreditCard, PiggyBank, ShoppingCart, PieChart } from 'lucide-react';

interface BudgetDashboardProps {
  setActiveModule: (module: string) => void;
}

export function BudgetDashboard({ setActiveModule }: BudgetDashboardProps) {
  const cards = [
    { id: 'budget-incomes', title: 'Gelirler', icon: <TrendingUp size={24} />, value: '₺45,000', color: 'text-emerald-400' },
    { id: 'budget-expenses', title: 'Giderler', icon: <TrendingDown size={24} />, value: '₺12,400', color: 'text-rose-400' },
    { id: 'budget-subscriptions', title: 'Abonelik & Borçlar', icon: <CreditCard size={24} />, value: '₺3,200', color: 'text-amber-400' },
    { id: 'budget-investments', title: 'Yatırım & Birikim', icon: <PiggyBank size={24} />, value: '₺15,000', color: 'text-focus-neon' },
    { id: 'budget-wishlist', title: 'Alınacaklar', icon: <ShoppingCart size={24} />, value: '5 Ürün', color: 'text-purple-400' },
    { id: 'budget-reports', title: 'Raporlar', icon: <PieChart size={24} />, value: 'Görüntüle', color: 'text-blue-400' },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
            <Wallet className="text-focus-neon" size={32} />
            Kişisel Bütçe
          </h1>
          <p className="text-skel-glass mt-1">Finansal durumunuzun genel özeti</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
