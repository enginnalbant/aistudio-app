import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  BarChart2,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  ArrowRight,
  Zap,
  UserCheck,
  UserMinus,
  Building2,
  Briefcase,
  Plus,
  Search,
  Wallet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AccountWizardModal } from './AccountWizardModal';

const COLORS = ['#00F2FF', '#00D1FF', '#7000FF', '#FF00E5', '#FFD600'];

export function AccountsDashboard({ setActiveModule }: { setActiveModule: (module: string) => void }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/accounts/summary');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAccounts(data);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAccounts = accounts?.length || 0;
  const activeAccounts = accounts?.filter(a => a.status === 'Aktif')?.length || 0;
  const totalCost = (accounts || []).reduce((acc, curr) => acc + (curr.total_cost || 0), 0);
  const totalPayment = (accounts || []).reduce((acc, curr) => acc + (curr.total_payment || 0), 0);
  const totalOverdue = (accounts || []).reduce((acc, curr) => acc + (curr.overdue_debt || 0), 0);
  const netBalance = totalCost - totalPayment;

  // Type distribution
  const typeData = Object.entries(
    (accounts || []).reduce((acc: any, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Top accounts by balance
  const topAccounts = [...(accounts || [])]
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .slice(0, 6)
    .map(a => ({
      name: a.name.length > 12 ? a.name.substring(0, 12) + '...' : a.name,
      balance: a.balance,
      fullName: a.name
    }));

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-focus-neon/20 border-t-focus-neon rounded-full animate-spin" />
        <p className="text-skel-metal animate-pulse font-medium">Finansal veriler analiz ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-skel-glass mb-1 flex items-center gap-3">
            <Wallet size={32} className="text-focus-neon" />
            Cari & Finans
          </h1>
          <p className="text-skel-metal text-sm">Müşteri ve tedarikçi ilişkileri, borç/alacak ve nakit akışı özeti.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="os-btn os-btn-primary bg-focus-neon text-skel-dark border-transparent hover:bg-focus-neon/90 shadow-lg shadow-focus-neon/20"
          >
            <Plus size={16} /> Yeni Cari Kart
          </button>
          <button className="os-btn os-btn-secondary">
            <Activity size={16} /> Mizan Al
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          { 
            title: 'Toplam Cari', 
            value: totalAccounts.toLocaleString(), 
            icon: <Users size={24} className="text-focus-neon" />, 
            trend: `${activeAccounts} Aktif`, 
            color: 'from-focus-main/20 to-transparent', 
            border: 'border-focus-main/30',
            target: 'accounts-list'
          },
          { 
            title: 'Toplam Borç', 
            value: `₺${totalCost.toLocaleString()}`, 
            icon: <ArrowUpRight size={24} className="text-crit-vivid" />, 
            trend: 'İşleme Gönderilen', 
            color: 'from-crit-vivid/20 to-transparent', 
            border: 'border-crit-vivid/30',
            target: 'accounts-reconciliation'
          },
          { 
            title: 'Toplam Ödenen', 
            value: `₺${totalPayment.toLocaleString()}`, 
            icon: <ArrowDownRight size={24} className="text-grow-main" />, 
            trend: 'Yapılan Ödemeler', 
            color: 'from-grow-main/20 to-transparent', 
            border: 'border-grow-main/30',
            target: 'accounts-reconciliation'
          },
          { 
            title: 'Kalan Borç', 
            value: `₺${Math.abs(netBalance).toLocaleString()}`, 
            icon: <DollarSign size={24} className={netBalance > 0 ? 'text-crit-vivid' : netBalance < 0 ? 'text-grow-main' : 'text-skel-glass'} />, 
            trend: netBalance > 0 ? 'Borçluyuz' : netBalance < 0 ? 'Alacaklıyız' : 'Kapalı', 
            color: netBalance > 0 ? 'from-crit-vivid/20 to-transparent' : netBalance < 0 ? 'from-grow-main/20 to-transparent' : 'from-white/10 to-transparent', 
            border: netBalance > 0 ? 'border-crit-vivid/30' : netBalance < 0 ? 'border-grow-main/30' : 'border-skel-matte/20',
            target: 'accounts-list'
          },
          { 
            title: 'Vadesi Geçen', 
            value: `₺${totalOverdue.toLocaleString()}`, 
            icon: <AlertCircle size={24} className="text-crit-vivid" />, 
            trend: totalOverdue > 0 ? 'Acil Ödeme' : 'Gecikme Yok', 
            color: totalOverdue > 0 ? 'from-crit-vivid/40 to-transparent' : 'from-grow-main/20 to-transparent', 
            border: totalOverdue > 0 ? 'border-crit-vivid/50 shadow-[0_0_15px_rgba(255,68,68,0.2)]' : 'border-grow-main/30',
            target: 'accounts-reconciliation'
          },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveModule(stat.target)}
            className={`layer-3d p-6 relative overflow-hidden border-t-4 ${stat.border} group hover:translate-y-[-12px] transition-all duration-500 cursor-pointer bg-white`}
            style={{ 
              boxShadow: 'var(--depth-2-shadow)',
              borderRadius: '24px'
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-white shadow-[0_8px_16px_rgba(0,0,0,0.05)] border border-skel-matte/10 group-hover:scale-110 transition-transform duration-500">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-white/80 border border-white/60 shadow-sm flex items-center gap-1 uppercase tracking-wider ${stat.trend === 'Borçluyuz' || stat.trend === 'Acil Ödeme' ? 'text-crit-vivid' : 'text-skel-metal'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-mono font-black text-skel-glass mb-2 tracking-tighter group-hover:text-focus-neon transition-colors">{stat.value}</h3>
              <p className="text-[10px] text-skel-metal font-black uppercase tracking-[0.25em] opacity-70">{stat.title}</p>
            </div>
            
            {/* 3D Glass Highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 layer-3d p-6 flex flex-col min-h-[400px]"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-bold text-skel-glass flex items-center gap-2">
                <BarChart2 size={18} className="text-focus-neon" />
                En Yüksek Bakiyeli Cariler
              </h2>
              <p className="text-xs text-skel-metal mt-1">İşlem hacmi en geniş olan ilk 6 cari kartı.</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-skel-matte/20 text-skel-metal hover:text-skel-glass transition-colors">
                <TrendingUp size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
              {topAccounts?.length > 0 ? (
                <BarChart data={topAccounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F2FF" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#00F2FF" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(value: any) => [`₺${Math.abs(value).toLocaleString()}`, 'Bakiye']}
                  />
                  <Bar dataKey="balance" fill="url(#balanceGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-skel-metal text-sm">
                  Veri bulunamadı
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Type Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="layer-3d p-6 flex flex-col"
        >
          <h2 className="text-lg font-bold text-skel-glass flex items-center gap-2 mb-6">
            <PieChartIcon size={18} className="text-grow-main" />
            Cari Tipi Dağılımı
          </h2>
          <div className="flex-1 min-h-[250px] relative min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-skel-glass">{typeData?.length || 0}</span>
              <span className="text-[10px] text-skel-metal uppercase font-bold tracking-widest">Tip</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {(typeData || []).slice(0, 4).map((type, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-skel-matte/10 border border-skel-matte/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-skel-glass font-medium">{type.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-skel-glass">{String(type.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Accounts / High Risk */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="layer-3d p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-skel-glass flex items-center gap-2">
              <UserCheck size={18} className="text-focus-neon" />
              Son Eklenen Cariler
            </h2>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {accounts?.length > 0 ? (
              [...(accounts || [])].reverse().slice(0, 5).map((account, i) => (
                <div key={i} className="p-4 rounded-2xl border border-skel-matte/20 bg-skel-matte/10 flex items-center justify-between group hover:bg-skel-matte/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-skel-matte/20 border border-skel-matte/20 flex items-center justify-center text-skel-metal group-hover:text-focus-neon transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-skel-glass font-bold text-sm">{account.name}</h4>
                      <p className="text-[10px] text-skel-metal font-mono uppercase">{account.type} • {account.series || 'KODSUZ'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold text-sm ${account.balance > 0 ? 'text-crit-vivid' : account.balance < 0 ? 'text-grow-main' : 'text-skel-glass'}`}>
                      ₺{Math.abs(account.balance).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-skel-metal uppercase font-bold tracking-widest">
                      {account.balance > 0 ? 'Borçluyuz' : account.balance < 0 ? 'Alacaklıyız' : 'Kapalı'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-skel-metal">
                <UserMinus size={48} className="text-skel-matte mb-4 opacity-20" />
                <p className="text-sm font-medium">Henüz cari kaydı bulunmuyor.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Financial Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="layer-3d p-8 bg-white border border-skel-matte/20 relative overflow-hidden group"
          style={{ 
            boxShadow: 'var(--depth-3-shadow)',
            borderRadius: '32px'
          }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-focus-neon/5 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-skel-glass uppercase tracking-[0.15em] flex items-center gap-3">
                  <Zap size={24} className="text-focus-neon animate-bounce" style={{ animationDuration: '3s' }} />
                  Finansal Zeka
                </h2>
                <p className="text-xs text-skel-metal font-bold mt-1">Nakit akışı ve risk yönetimi analizi</p>
              </div>
              <span className="text-[10px] font-black text-focus-neon bg-focus-neon/10 px-4 py-1.5 rounded-full border border-focus-neon/20">FİNANSAL ANALİZ</span>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-skel-space/50 border border-skel-matte/10 hover:bg-white hover:shadow-depth-1 transition-all flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-focus-ice text-focus-neon shadow-sm">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4 className="text-skel-glass font-black text-sm uppercase tracking-wider mb-1.5">Yeni İş Fırsatları</h4>
                  <p className="text-xs text-skel-metal leading-relaxed font-medium">
                    "Müşteri" tipindeki carilerinizin %20'si son 60 gündür işlem yapmadı. Geri kazanım kampanyası planlanabilir.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-skel-space/50 border border-skel-matte/10 hover:bg-white hover:shadow-depth-1 transition-all flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-crit-pale text-crit-vivid shadow-sm">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-skel-glass font-black text-sm uppercase tracking-wider mb-1.5">Vadesi Gelen Borçlar</h4>
                  <p className="text-xs text-skel-metal leading-relaxed font-medium">
                    Toplam ₺{totalOverdue.toLocaleString()} vadesi gelmiş borcunuz bulunmaktadır. Ödeme planlaması yapmanız önerilir.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-skel-space/50 border border-skel-matte/10 hover:bg-white hover:shadow-depth-1 transition-all flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-grow-mint text-grow-main shadow-sm">
                  <ArrowRight size={20} />
                </div>
                <div>
                  <h4 className="text-skel-glass font-black text-sm uppercase tracking-wider mb-1.5">Tahsilat Performansı</h4>
                  <p className="text-xs text-skel-metal leading-relaxed font-medium">
                    Ortalama tahsilat süreniz geçen aya göre 4 gün kısaldı. Nakit akışınız iyileşme eğiliminde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AccountWizardModal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSave={() => {
          setIsWizardOpen(false);
          fetchAccounts();
        }} 
      />
      </div>
    </div>
  );
}
