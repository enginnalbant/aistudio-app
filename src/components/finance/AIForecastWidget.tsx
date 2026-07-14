import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  BrainCircuit,
  RefreshCw,
  Gauge
} from 'lucide-react';

interface Prediction {
  period: string;
  income: number;
  expense: number;
  savings: number;
  note: string;
}

interface ForecastData {
  futurePredictions: Prediction[];
  warnings: string[];
  scoreForecast: string;
  confidence: string;
  advice: string;
}

export const AIForecastWidget = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ForecastData | null>(null);

  // Load from localStorage or trigger initial fetch context
  const getContext = () => {
    try {
      const incomes = JSON.parse(localStorage.getItem('finance_incomes') || '[]');
      const expenses = JSON.parse(localStorage.getItem('finance_expenses') || '[]');
      const investments = JSON.parse(localStorage.getItem('finance_investments') || '[]');
      const debts = JSON.parse(localStorage.getItem('finance_debts') || '[]');

      return JSON.stringify({
        incomes: incomes.slice(0, 10).map((i: any) => ({ title: i.title, amount: i.amount })),
        expenses: expenses.slice(0, 10).map((e: any) => ({ title: e.title, amount: e.amount, category: e.category })),
        totalInvestments: investments.reduce((s: number, i: any) => s + Number(i.currentAmount || 0), 0),
        totalDebts: debts.reduce((s: number, d: any) => s + Number(d.remainingAmount || 0), 0)
      });
    } catch {
      return '';
    }
  };

  const handleGenerateForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: getContext() })
      });

      const parsed = await response.json();
      if (parsed && parsed.futurePredictions) {
        setData(parsed);
        // Cache forecast locally
        localStorage.setItem('cached_ai_forecast', JSON.stringify(parsed));
      }
    } catch (err) {
      console.error('[AI Forecast Widget Error]', err);
    } finally {
      setLoading(false);
    }
  };

  // Try to load cached prediction on mount
  useEffect(() => {
    const cached = localStorage.getItem('cached_ai_forecast');
    if (cached) {
      try {
        setData(JSON.parse(cached));
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-focus-neon/15 border border-focus-neon/30 flex items-center justify-center text-focus-neon">
            <BrainCircuit size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              Yapay Zeka Gelecek Öngörü Motoru
            </h3>
            <p className="text-[11px] text-text-secondary">
              Mevcut nakit akışını ve harcamaları işleyerek gelecek 3 dönemi simüle eder.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateForecast}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-focus-main to-focus-neon hover:from-focus-neon hover:to-focus-main text-white font-display font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {loading ? 'Simüle Ediliyor...' : 'Tahminleri Güncelle'}
        </button>
      </div>

      {data ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Prediction Stats & Confidence */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28">
                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Tahmini Sağlık Skoru</span>
                <span className="text-3xl font-mono font-black text-white">{data.scoreForecast}</span>
                <span className="text-[9px] text-focus-neon font-bold">Öngörülen Durum</span>
              </div>

              <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28">
                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Model Güven Oranı</span>
                <span className="text-3xl font-mono font-black text-emerald-400">{data.confidence}</span>
                <span className="text-[9px] text-text-secondary">Simülasyon Hassasiyeti</span>
              </div>
            </div>

            {/* Smart Advice */}
            <div className="bg-focus-neon/5 border border-focus-neon/15 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] text-focus-neon font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} /> Akıllı Tavsiye & Öngörü
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                {data.advice}
              </p>
            </div>

            {/* Warnings List */}
            {data.warnings && data.warnings.length > 0 && (
              <div className="bg-crit-vivid/5 border border-crit-vivid/15 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-crit-vivid font-black uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Öngörülen Limit & Bütçe Aşım Riskleri
                </span>
                <ul className="space-y-1.5">
                  {data.warnings.map((warn, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-crit-vivid rounded-full mt-1.5 shrink-0" />
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Forecast Trend Chart */}
          <div className="lg:col-span-7 bg-black/20 border border-white/5 p-5 rounded-3xl flex flex-col justify-between min-h-[300px]">
            <div>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Tahmini Bütçe Nakit Akış Grafiği</span>
              <p className="text-[11px] text-text-secondary opacity-60 mt-0.5">Yapay zekanın öngördüğü 3 dönemlik gelir, gider ve tasarruf trendi.</p>
            </div>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.futurePredictions} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="period" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="income" name="Öngörülen Gelir" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                  <Line type="monotone" dataKey="expense" name="Öngörülen Gider" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="savings" name="Öngörülen Tasarruf" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend / Timeline notes */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 mt-3">
              {data.futurePredictions.slice(0, 3).map((p, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-[9px] font-bold text-white block">{p.period}</span>
                  <span className="text-[8px] text-text-secondary font-mono block truncate mt-0.5">{p.note || 'İstikrarlı'}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-text-secondary">
            <Sparkles size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Henüz Akıllı Tahmin Üretilmedi</h4>
            <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
              Akıllı tahmin motorunu çalıştırmak için yukarıdaki "Tahminleri Güncelle" butonuna tıklayın. Model bütçe verilerinizi işleyerek simülasyonu başlatacaktır.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
