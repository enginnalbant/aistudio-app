import React from 'react';
import { FullScreenCalendar } from './ui/fullscreen-calendar';
import { ArrowLeft } from 'lucide-react';

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

export const CalendarPage = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const handleBack = () => {
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule('main-dashboard');
    }
  };

  const calendarEvents = React.useMemo(() => {
    const subscriptions = JSON.parse(localStorage.getItem('finance_subscriptions') || '[]');
    const debts = JSON.parse(localStorage.getItem('finance_debts') || '[]');
    const incomes = JSON.parse(localStorage.getItem('finance_incomes') || '[]');
    const expenses = JSON.parse(localStorage.getItem('finance_expenses') || '[]');
    const savings = JSON.parse(localStorage.getItem('finance_savings') || '[]');

    const eventsByDate: { [key: string]: { day: Date; events: any[] } } = {};

    const addEvent = (dateStr: string, eventObj: any) => {
      const dayObj = parseLocalDate(dateStr);
      if (!dayObj) return;
      
      const key = `${dayObj.getFullYear()}-${dayObj.getMonth()}-${dayObj.getDate()}`;
      if (!eventsByDate[key]) {
        eventsByDate[key] = {
          day: dayObj,
          events: []
        };
      }
      eventsByDate[key].events.push(eventObj);
    };

    // Subscriptions
    subscriptions.forEach((sub: any) => {
      if (sub.status === 'Aktif' && sub.nextBillingDate) {
        addEvent(sub.nextBillingDate, {
          id: `sub-${sub.id}`,
          name: `💳 Abonelik: ${sub.title}`,
          time: `${sub.amount} TL`,
          datetime: sub.nextBillingDate
        });
      }
    });

    // Debts
    debts.forEach((debt: any) => {
      if (debt.status === 'Devam Ediyor' && debt.nextPaymentDate) {
        addEvent(debt.nextPaymentDate, {
          id: `debt-${debt.id}`,
          name: `🚨 Borç Ödemesi: ${debt.title}`,
          time: `${debt.paymentAmount} TL`,
          datetime: debt.nextPaymentDate
        });
      }
    });

    // Incomes
    incomes.forEach((inc: any) => {
      if (inc.date) {
        addEvent(inc.date, {
          id: `inc-${inc.id}`,
          name: `📈 Gelir: ${inc.title}`,
          time: `${inc.amount} TL (${inc.status})`,
          datetime: inc.date
        });
      }
    });

    // Expenses
    expenses.forEach((exp: any) => {
      if (exp.date) {
        addEvent(exp.date, {
          id: `exp-${exp.id}`,
          name: `📉 Gider: ${exp.title}`,
          time: `${exp.amount} TL (${exp.status})`,
          datetime: exp.date
        });
      }
    });

    // Savings Goals
    savings.forEach((sav: any) => {
      if (sav.deadline) {
        addEvent(sav.deadline, {
          id: `sav-${sav.id}`,
          name: `🎯 Hedef: ${sav.title}`,
          time: `${sav.currentAmount} / ${sav.targetAmount} TL`,
          datetime: sav.deadline
        });
      }
    });

    return Object.values(eventsByDate);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 lg:p-0">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="w-10 h-10 rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 flex items-center justify-center text-text-secondary transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-display font-black tracking-tight text-text-primary uppercase">
                Etkinlik Takvimi
              </h1>
              <p className="text-xs text-text-secondary opacity-60 font-mono uppercase tracking-widest">
                Planlanan tüm finansal işlemler, abonelikler ve hedefler
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Container */}
      <div className="flex-1 bento-card border-skel-metal/10 overflow-hidden bg-skel-space/30 backdrop-blur-xl">
        <FullScreenCalendar data={calendarEvents} />
      </div>
    </div>
  );
};
