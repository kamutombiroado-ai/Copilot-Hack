
import React, { useState } from 'react';
import { FinancialEntry, EntryType, InvestmentPerformance } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Icons, COLORS } from '../constants';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface FinancialTableProps {
  entries: FinancialEntry[];
  type: EntryType;
  onDelete: (id: string) => void;
  onViewSchedule?: (entry: FinancialEntry) => void;
  currency: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

const PerformanceCell = ({ performance }: { performance: InvestmentPerformance }) => {
  const [timeframe, setTimeframe] = useState<'1Y' | '5Y' | 'MAX'>('1Y');

  // Determine active data based on selection and availability
  let activeReturn = performance.return1Y;
  let activeHistory = performance.history1Y;

  if (timeframe === '5Y' && performance.return5Y !== undefined && performance.history5Y) {
    activeReturn = performance.return5Y;
    activeHistory = performance.history5Y;
  } else if (timeframe === 'MAX' && performance.returnMax !== undefined && performance.historyMax) {
    activeReturn = performance.returnMax;
    activeHistory = performance.historyMax;
  }

  // Fallback for legacy data that might only have 'history' (mapped to history1Y in type, but maybe missing in runtime if old data)
  if (!activeHistory && (performance as any).history) {
    activeHistory = (performance as any).history;
  }

  const isPositive = activeReturn >= 0;

  return (
    <div className="w-40 mx-auto">
      {/* Timeframe Toggles */}
      <div className="flex justify-center gap-1 mb-1">
        <button
          onClick={() => setTimeframe('1Y')}
          className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${timeframe === '1Y' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        >
          1Y
        </button>
        {performance.return5Y !== undefined && (
          <button
            onClick={() => setTimeframe('5Y')}
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${timeframe === '5Y' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            5Y
          </button>
        )}
        {performance.returnMax !== undefined && (
          <button
            onClick={() => setTimeframe('MAX')}
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${timeframe === 'MAX' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            Max
          </button>
        )}
      </div>

      {/* Sparkline */}
      <div className="h-10 w-full bg-slate-50/50 rounded-lg border border-slate-100 overflow-hidden relative group">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activeHistory ? activeHistory.map((val, i) => ({ i, val })) : []}>
            <Line 
              type="monotone" 
              dataKey="val" 
              stroke={isPositive ? COLORS.ASSET : COLORS.LIABILITY} 
              strokeWidth={2} 
              dot={false}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Tooltip Effect Overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
      </div>

      {/* Return Value */}
      <div className={`text-xs font-bold mt-1 text-center ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{activeReturn}%
      </div>
    </div>
  );
};

const FinancialTable: React.FC<FinancialTableProps> = ({ entries, type, onDelete, onViewSchedule, currency, isPremium, onUpgrade }) => {
  const filteredEntries = entries.filter(e => e.type === type);
  const total = filteredEntries.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${type === EntryType.ASSET ? 'bg-emerald-50/30' : 'bg-red-50/30'}`}>
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {type === EntryType.ASSET ? (
            <span className="text-emerald-600">Assets</span>
          ) : (
            <span className="text-red-600">Liabilities</span>
          )}
          <span className="text-slate-400 font-normal">({filteredEntries.length})</span>
        </h3>
        <span className={`text-lg font-bold ${type === EntryType.ASSET ? 'text-emerald-700' : 'text-red-700'}`}>
          {formatCurrency(total, currency)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Value</th>
              {type === EntryType.ASSET && (
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center w-40">Performance</th>
              )}
              {type === EntryType.LIABILITY && (
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Interest</th>
              )}
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={type === EntryType.ASSET ? 5 : 5} className="px-6 py-8 text-center text-slate-400 italic">
                  No {type.toLowerCase()}s added yet.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-700">{entry.name}</div>
                      {entry.isDepreciating && (
                        <div className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1" title="Depreciating Asset">
                          <Icons.TrendingDown />
                          <span className="hidden sm:inline">{entry.depreciationRate}%/yr</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{formatDate(entry.updatedAt)}</div>
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold ${type === EntryType.ASSET ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(entry.value, currency)}
                    {entry.originalValue && entry.originalValue !== entry.value && (
                       <div className="text-[10px] text-slate-400 line-through font-normal">
                         {formatCurrency(entry.originalValue, currency)}
                       </div>
                    )}
                  </td>

                  {type === EntryType.ASSET && (
                    <td className="px-6 py-2 text-center align-middle">
                      {entry.performance ? (
                        <PerformanceCell performance={entry.performance} />
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                  )}
                  
                  {type === EntryType.LIABILITY && (
                    <td className="px-6 py-4 text-center">
                      {entry.interestRate ? (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            <Icons.Percent /> {entry.interestRate}%
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            {entry.interestType === 'SIMPLE' ? 'Simple' : 'Compound'}
                          </span>
                          {onViewSchedule && entry.termYears && (
                            <button 
                              onClick={() => isPremium ? onViewSchedule(entry) : onUpgrade()}
                              className="mt-1 text-[10px] flex items-center gap-1 mx-auto"
                            >
                              {!isPremium && <Icons.Lock size={10} />}
                              <span className={!isPremium ? "text-slate-400" : "text-blue-500 hover:text-blue-700 underline"}>
                                View Schedule
                              </span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  )}

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Delete entry"
                    >
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialTable;
