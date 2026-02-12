
import React, { useMemo, useState } from 'react';
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart,
  Line,
  Legend
} from 'recharts';
import { FinancialEntry, EntryType } from '../types';
import { calculateAmortizationSchedule } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { Icons, COLORS } from '../constants';

interface DebtDashboardProps {
  entries: FinancialEntry[];
  currency: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

const DebtDashboard: React.FC<DebtDashboardProps> = ({ entries, currency, isPremium, onUpgrade }) => {
  const [isConsolidationMode, setIsConsolidationMode] = useState(false);
  const [conRate, setConRate] = useState<string>('');
  const [conTerm, setConTerm] = useState<string>('');

  const liabilities = entries.filter(e => e.type === EntryType.LIABILITY);

  const { summary, chartData, consolidation } = useMemo(() => {
    let totalCurrent = 0;
    let totalOriginal = 0;
    let totalMonthlyPayment = 0;
    let totalInterestRemaining = 0;

    const loans = liabilities.map(loan => {
      const current = loan.value;
      const original = loan.originalValue && loan.originalValue > current ? loan.originalValue : current;
      const progress = original > 0 ? ((original - current) / original) * 100 : 0;
      
      let monthlyPayment = 0;
      let interestRemaining = 0;
      let schedule: any[] = [];

      // Calculate projection only if we have rate and term
      if (loan.interestRate && loan.termYears) {
        schedule = calculateAmortizationSchedule(
          loan.value, 
          loan.interestRate, 
          loan.termYears, 
          loan.interestType || 'COMPOUND_MONTHLY'
        );
        if (schedule.length > 0) {
           monthlyPayment = schedule[0].payment;
           interestRemaining = schedule.reduce((sum, row) => sum + row.interest, 0);
        }
      }

      totalCurrent += current;
      totalOriginal += original;
      totalMonthlyPayment += monthlyPayment;
      totalInterestRemaining += interestRemaining;

      return {
        ...loan,
        original,
        progress,
        monthlyPayment,
        schedule
      };
    });

    // Consolidation Logic
    let conSchedule: any[] = [];
    let conMonthlyPayment = 0;
    let conTotalInterest = 0;

    if (isConsolidationMode && conRate && conTerm) {
       const rate = parseFloat(conRate);
       const term = parseFloat(conTerm);
       if (!isNaN(rate) && !isNaN(term) && term > 0) {
         conSchedule = calculateAmortizationSchedule(
            totalCurrent,
            rate,
            term,
            'COMPOUND_MONTHLY'
         );
         if (conSchedule.length > 0) {
             conMonthlyPayment = conSchedule[0].payment;
             conTotalInterest = conSchedule.reduce((sum, row) => sum + row.interest, 0);
         }
       }
    }

    // Chart Data Generation
    const maxMonthsIndividual = Math.max(...loans.map(l => l.schedule?.length || 0), 0);
    const maxMonthsConsolidated = conSchedule.length;
    const maxMonths = Math.max(maxMonthsIndividual, maxMonthsConsolidated);
    
    const data = [];
    
    // Sample points for the chart
    const samplingInterval = maxMonths > 60 ? 6 : (maxMonths > 24 ? 3 : 1);

    for (let i = 0; i <= maxMonths; i += samplingInterval) {
      let currentBalance = 0;
      let consolidatedBalance = 0;

      // Current Strategy Balance
      loans.forEach(loan => {
        if (!loan.schedule || loan.schedule.length === 0) {
           currentBalance += loan.value; 
           return;
        }
        if (i === 0) {
          currentBalance += loan.value;
        } else {
           const rowIndex = Math.min(i - 1, loan.schedule.length - 1);
           if (i > loan.schedule.length) {
             currentBalance += 0;
           } else {
             const row = loan.schedule[rowIndex];
             currentBalance += row ? row.balance : 0;
           }
        }
      });

      // Consolidated Strategy Balance
      if (isConsolidationMode && conSchedule.length > 0) {
          if (i === 0) {
              consolidatedBalance = totalCurrent;
          } else if (i > conSchedule.length) {
              consolidatedBalance = 0;
          } else {
              const rowIndex = Math.min(i - 1, conSchedule.length - 1);
              const row = conSchedule[rowIndex];
              consolidatedBalance = row ? row.balance : 0;
          }
      }

      data.push({
        name: i === 0 ? 'Now' : (i < 12 ? `${i}m` : `${(i/12).toFixed(1)}y`),
        balance: Math.max(0, Math.round(currentBalance)),
        consolidatedBalance: isConsolidationMode && conSchedule.length > 0 ? Math.max(0, Math.round(consolidatedBalance)) : null,
        monthIndex: i
      });
    }

    // Force zero point if needed
    if (data.length > 0 && (data[data.length-1].balance > 100 || (isConsolidationMode && (data[data.length-1].consolidatedBalance || 0) > 100))) {
        data.push({ 
            name: 'End', 
            balance: 0, 
            consolidatedBalance: isConsolidationMode ? 0 : null,
            monthIndex: maxMonths 
        });
    }

    return { 
        summary: { loans, totalCurrent, totalOriginal, totalMonthlyPayment, totalInterestRemaining }, 
        consolidation: { 
            monthlyPayment: conMonthlyPayment, 
            totalInterest: conTotalInterest,
            isValid: conSchedule.length > 0
        },
        chartData: data 
    };
  }, [liabilities, isConsolidationMode, conRate, conTerm]);

  if (liabilities.length === 0) return null;

  const monthlySavings = summary.totalMonthlyPayment - consolidation.monthlyPayment;
  const interestSavings = summary.totalInterestRemaining - consolidation.totalInterest;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8 relative">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Icons.MinusCircle />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Debt Repayment Planner
                {!isPremium && <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1"><Icons.Lock /> Premium</span>}
              </h3>
              <p className="text-xs text-slate-500">Track payoff progress and projections</p>
            </div>
          </div>
          
          {isPremium && (
            <div className="flex items-center gap-3">
               <button
                  onClick={() => setIsConsolidationMode(!isConsolidationMode)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      isConsolidationMode 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
               >
                  {isConsolidationMode ? <Icons.X /> : <Icons.Sparkles />}
                  {isConsolidationMode ? 'Close Simulator' : 'Simulate Consolidation'}
               </button>
               {!isConsolidationMode && (
                  <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Est. Monthly Payment</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(summary.totalMonthlyPayment, currency)}</p>
                  </div>
               )}
            </div>
          )}
        </div>

        {!isPremium ? (
             <div className="relative py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 overflow-hidden text-center">
               <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-red-600 mb-4">
                 <Icons.Lock />
               </div>
               <h4 className="text-lg font-bold text-slate-900 mb-2">Unlock Debt Payoff Tools</h4>
               <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                 Simulate consolidation strategies, visualize amortization schedules, and track your debt-free date with Premium.
               </p>
               <button
                 onClick={onUpgrade}
                 className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
               >
                 <Icons.Crown />
                 Unlock Features
               </button>
             </div>
        ) : (
          <>
            {/* Consolidation Simulator Panel */}
            {isConsolidationMode && (
                 <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1 block">Consolidated Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={conRate}
                                        onChange={(e) => setConRate(e.target.value)}
                                        placeholder="e.g. 7.5"
                                        className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1 block">New Term (Years)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={conTerm}
                                        onChange={(e) => setConTerm(e.target.value)}
                                        placeholder="e.g. 5"
                                        className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            
                            {consolidation.isValid && (
                                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                                         <p className="text-[10px] text-slate-500 uppercase font-semibold">Monthly Delta</p>
                                         <div className={`text-lg font-bold ${monthlySavings >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {monthlySavings >= 0 ? '-' : '+'}{formatCurrency(Math.abs(monthlySavings), currency)}
                                         </div>
                                         <p className="text-[10px] text-slate-400">
                                             {monthlySavings >= 0 ? 'Savings / mo' : 'Extra Cost / mo'}
                                         </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                                         <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Interest Delta</p>
                                         <div className={`text-lg font-bold ${interestSavings >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {interestSavings >= 0 ? '-' : '+'}{formatCurrency(Math.abs(interestSavings), currency)}
                                         </div>
                                         <p className="text-[10px] text-slate-400">
                                             {interestSavings >= 0 ? 'Total Savings' : 'Total Extra Cost'}
                                         </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 h-72 bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                    {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.LIABILITY} stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={COLORS.LIABILITY} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                                    minTickGap={30}
                                />
                                <YAxis 
                                    hide 
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number, name: string) => [
                                        formatCurrency(value, currency), 
                                        name === 'consolidatedBalance' ? 'Consolidated Plan' : 'Current Plan'
                                    ]}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                                <Area 
                                    type="monotone" 
                                    name="Current Plan"
                                    dataKey="balance" 
                                    stroke={COLORS.LIABILITY} 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorDebt)" 
                                />
                                {isConsolidationMode && consolidation.isValid && (
                                    <Line
                                        type="monotone"
                                        name="Consolidated Plan"
                                        dataKey="consolidatedBalance"
                                        stroke="#4f46e5" // Indigo 600
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        dot={false}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm p-4 text-center">
                            <Icons.TrendingDown />
                            <span className="mt-2">Add Interest Rate and Payoff Period to liabilities to see projections.</span>
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Remaining</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.totalCurrent, currency)}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Principal only
                        </p>
                    </div>
                    
                    {/* Current Strategy Stats */}
                    <div className={`p-4 rounded-xl border transition-all ${isConsolidationMode ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Current Total Interest</p>
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(summary.totalInterestRemaining, currency)}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Future interest payable
                        </p>
                    </div>

                    {/* Consolidated Strategy Stats Preview */}
                    {isConsolidationMode && consolidation.isValid && (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                            <p className="text-xs text-indigo-800 uppercase tracking-wider font-semibold mb-1">New Total Interest</p>
                            <p className="text-2xl font-bold text-indigo-700">{formatCurrency(consolidation.totalInterest, currency)}</p>
                            <p className="text-xs text-indigo-400 mt-1">
                                With {conRate}% rate
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Individual Loan Progress */}
            <div className="mt-8 space-y-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Liability Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.loans.map((loan) => (
                        <div key={loan.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h5 className="font-bold text-slate-800">{loan.name}</h5>
                                    <p className="text-xs text-slate-500">{loan.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-slate-800">{formatCurrency(loan.value, currency)}</span>
                                    <p className="text-[10px] text-slate-400">Remaining</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-600">{loan.progress.toFixed(0)}% Paid</span>
                                    <span className="text-slate-400">Original: {formatCurrency(loan.original, currency)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${loan.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {loan.monthlyPayment > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Monthly Payment</span>
                                    <span className="font-semibold text-red-600">{formatCurrency(loan.monthlyPayment, currency)}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DebtDashboard;
