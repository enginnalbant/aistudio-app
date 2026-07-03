export interface RolloverData {
  rolloverIncomes: any[];
  rolloverExpenses: any[];
}

export const getRollovers = (incomes: any[], expenses: any[]): RolloverData => {
  const rolloverIncomes: any[] = [];
  const rolloverExpenses: any[] = [];

  // Starting date is 1 July 2026
  const startDate = new Date(2026, 6, 1);
  const today = new Date();

  // Filter actual entered transactions that occur strictly before July 1, 2026
  const preIncomes = incomes.filter(inc => {
    if (!inc || !inc.date || inc.status !== 'Tamamlandı') return false;
    const d = new Date(inc.date);
    return d < startDate;
  });

  const preExpenses = expenses.filter(exp => {
    if (!exp || !exp.date || exp.status !== 'Gerçekleşti') return false;
    const d = new Date(exp.date);
    return d < startDate;
  });

  const preTotalInc = preIncomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
  const preTotalExp = preExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  
  // Starting balance derived from any pre-July data
  let accumulatedBalance = preTotalInc - preTotalExp;

  // Track the previous month's active expenses to identify the "culprit" for a negative balance
  let lastExpensesList = preExpenses.map(e => ({
    title: e.title || 'Gider',
    amount: Number(e.amount || 0),
    category: e.category || 'Gider'
  }));

  const currentYear = 2026;
  const currentMonthIndex = 6; // July

  // Carry forward through months (simulate up to 36 months forward)
  for (let m = 0; m <= 35; m++) {
    const idx = (currentMonthIndex + m) % 12;
    const year = currentYear + Math.floor((currentMonthIndex + m) / 12);
    const yearMonth = `${year}-${String(idx + 1).padStart(2, '0')}`;

    const rolloverDate = new Date(year, idx, 1);
    const isFuture = rolloverDate > today;

    // Professional Timing logic:
    // Dynamic periodic records should only execute ('Tamamlandı' / 'Gerçekleşti') if their date has arrived.
    // Future rollovers are marked as 'Beklemede' (Pending) or 'Planlı' (Planned).
    const incomeStatus = isFuture ? 'Beklemede' : 'Tamamlandı';
    const expenseStatus = isFuture ? 'Planlı' : 'Gerçekleşti';

    if (accumulatedBalance > 0) {
      rolloverIncomes.push({
        id: `dyn-inc-rollover-${yearMonth}`,
        title: 'Önceki Dönemden Devir (Eldeki Nakit)',
        amount: accumulatedBalance,
        category: 'Devir',
        date: `${yearMonth}-01`,
        status: incomeStatus,
        isDynamic: true,
        isFuture: isFuture,
        tags: ['Devir'],
        source: 'Sistem Devri'
      });
    } else if (accumulatedBalance < 0) {
      let culpTitle = "Genel Giderler";
      let culpCategory = "Diğer";
      if (lastExpensesList.length > 0) {
        const sorted = [...lastExpensesList].sort((a, b) => b.amount - a.amount);
        culpTitle = sorted[0].title;
        culpCategory = sorted[0].category;
      }
      rolloverExpenses.push({
        id: `dyn-exp-rollover-${yearMonth}`,
        title: `Önceki Dönem Ödenmemiş Bakiye: ${culpTitle}`,
        amount: Math.abs(accumulatedBalance),
        category: culpCategory,
        date: `${yearMonth}-01`,
        status: expenseStatus,
        isDynamic: true,
        isFuture: isFuture,
        tags: ['Devir'],
        recipient: 'Devir Ödemesi'
      });
    }

    // Now get the actual incomes & expenses for this specific month
    const monthActualIncomes = incomes.filter(inc => inc && inc.date && inc.date.startsWith(yearMonth) && inc.status === 'Tamamlandı');
    const monthActualExpenses = expenses.filter(exp => exp && exp.date && exp.date.startsWith(yearMonth) && exp.status === 'Gerçekleşti');

    const monthIncomeTotal = monthActualIncomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0) + (accumulatedBalance > 0 ? accumulatedBalance : 0);
    const monthExpenseTotal = monthActualExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) + (accumulatedBalance < 0 ? Math.abs(accumulatedBalance) : 0);

    accumulatedBalance = monthIncomeTotal - monthExpenseTotal;

    lastExpensesList = monthActualExpenses.length > 0
      ? monthActualExpenses.map(e => ({ title: e.title || 'Gider', amount: Number(e.amount || 0), category: e.category || 'Gider' }))
      : [{ title: 'Düzenli Giderler', amount: monthExpenseTotal, category: 'Gider' }];
  }

  return { rolloverIncomes, rolloverExpenses };
};
