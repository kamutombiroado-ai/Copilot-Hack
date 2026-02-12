
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { FinancialEntry, BudgetEntry, IncomeEntry, EntryType } from '../types';
import { calculateAmortizationSchedule } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { Icons, COLORS } from '../constants';

interface CashflowManagerProps {
  incomeEntries: IncomeEntry[];
  budgets: BudgetEntry[];
  entries: FinancialEntry[]; // To extract liabilities
  isPremium: boolean;
  onUpgrade: () => void;
  currency: string;
}

const CashflowManager: React.FC<CashflowManagerProps> = ({ 
  incomeEntries, 
  budgets, 
  entries, 
  isPremium, 
  onUpgrade, 
  currency 
}) => {
  
  const { monthlyIncome, monthlyDebtPayments, monthlyBudgetLimit, totalExpenses, netFlow } = useMemo(() => {
    // 1. Calculate Total Monthly Income
    const income = incomeEntries.reduce((sum, item) => sum + item.amount, 0);

    // 2. Calculate Monthly Debt Payments (from Liabilities)
    const liabilities = entries.filter(e => e.type === EntryType.LIABILITY);
    let debtPayments = 0;
    
    liabilities.forEach(loan => {
      // Basic check for valid parameters to calculate payment
      if (loan.interestRate !== undefined && loan.termYears !== undefined && loan.value > 0) {
        // Calculate payment using utility
        const schedule = calculateAmortizationSchedule(
          loan.value,
          loan.interestRate,
          loan.termYears,
          loan.interestType || 'COMPOUND_MONTHLY'
        );
        if (schedule.length > 0) {
          debtPayments += schedule[0].payment;
        }
      }
    });

    // 3. Calculate Monthly Budget Limits (Planned Expenses)
    const budgetLimit = budgets.reduce((sum, item) => sum + item.limit, 0);

    // 4. Totals
    const expenses = debtPayments + budgetLimit;
    const flow = income - expenses;

    return {
      monthlyIncome: income,
      monthlyDebtPayments: debtPayments,
      monthlyBudgetLimit: budgetLimit,
      totalExpenses: expenses,
      netFlow: flow
    };
  }, [incomeEntries, budgets, entries]);

  // Prepare chart data
  const chartData = [
    { name: 'Income', value: monthlyIncome, color: COLORS.ASSET },
    { name: 'Living Expenses', value: monthlyBudgetLimit, color: '#f59e0b' }, // Amber
    { name: 'Debt Payments', value: monthlyDebtPayments, color: COLORS.LIABILITY },
  ];

  const savingsRate = monthlyIncome > 0 ? (netFlow / monthlyIncome) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8 relative">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Icons.Activity />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Cashflow Management
                {!isPremium && <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1"><Icons.Lock /> Premium</span>}
              </h3>
              <p className="text-xs text-slate-500">Income vs. Expenses & Savings Rate</p>
            </div>
          </div>
        </div>

        {!isPremium ? (
           <div className="relative py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 overflow-hidden">
             {/* Blurred Content Background */}
             <div className="absolute inset-0 filter blur-sm opacity-50 bg-white pointer-events-none p-6 grid grid-cols-2 gap-4">
                <div className="h-20 bg-emerald-50 rounded-xl"></div>
                <div className="h-20 bg-red-50 rounded-xl"></div>
                <div className="col-span-2 h-40 bg-slate-50 rounded-xl mt-4"></div>
             </div>
 
             {/* Lock Overlay */}
             <div className="relative z-10 text-center">
               <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-indigo-600 mb-4">
                 <Icons.Lock />
               </div>
               <h4 className="text-lg font-bold text-slate-900 mb-2">Unlock Cashflow Analysis</h4>
               <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                 Gain clarity on your monthly cashflow. Track net income, recurring debt payments, and living expenses to optimize your savings rate.
               </p>
               <button
                 onClick={onUpgrade}
                 className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
               >
                 <Icons.Crown />
                 Unlock for $9.99/mo
               </button>
             </div>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Column */}
            <div className="space-y-4">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-800 uppercase tracking-wider font-semibold mb-1">Total Monthly Income</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(monthlyIncome, currency)}</p>
              </div>

              <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                <p className="text-xs text-red-800 uppercase tracking-wider font-semibold mb-1">Total Monthly Outflow</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses, currency)}</p>
                <div className="mt-2 text-xs text-red-600 flex justify-between">
                   <span>Debt: {formatCurrency(monthlyDebtPayments, currency)}</span>
                   <span>Living: {formatCurrency(monthlyBudgetLimit, currency)}</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${netFlow >= 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
                <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${netFlow >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Net Cashflow</p>
                <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {netFlow > 0 ? '+' : ''}{formatCurrency(netFlow, currency)}
                </p>
                <p className={`text-xs mt-1 ${netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                   Savings Rate: <span className="font-bold">{savingsRate.toFixed(1)}%</span>
                </p>
              </div>
            </div>

            {/* Chart Column */}
            <div className="lg:col-span-2 bg-slate-50/50 rounded-xl border border-slate-100 p-4 min-h-[300px] flex flex-col">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Monthly Breakdown</h4>
              {monthlyIncome === 0 && totalExpenses === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                    <Icons.Activity />
                    <span className="mt-2">Add Income and Budget entries to visualize cashflow.</span>
                 </div>
              ) : (
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                       <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                          tickFormatter={(val) => `${val >= 1000 ? val/1000 + 'k' : val}`}
                        />
                       <Tooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [formatCurrency(value, currency), '']}
                       />
                       <ReferenceLine y={0} stroke="#e2e8f0" />
                       <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50} animationDuration={1000}>
                          {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashflowManager;
